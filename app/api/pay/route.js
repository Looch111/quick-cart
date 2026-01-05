import { NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase-admin';

// This endpoint initializes a payment by creating a 'pending' order
// in the database. It's a crucial security step to ensure that order details
// are validated on the server and an immutable record is created before
// handing off to the payment provider.

export async function POST(req) {
    try {
        const { amount: clientAmount, email, name, cart } = await req.json();

        if (!cart || Object.keys(cart).length === 0) {
            return NextResponse.json({ message: 'Cart is empty.' }, { status: 400 });
        }

        // --- Server-side validation ---
        let serverCalculatedAmount = 0;
        const productIds = Object.keys(cart);
        const productRefs = productIds.map(id => db.collection('products').doc(id));
        const productDocs = await db.getAll(...productRefs);
        const productsInCart = {};

        for (const doc of productDocs) {
            if (!doc.exists) {
                return NextResponse.json({ message: `Product with ID ${doc.id} not found.` }, { status: 404 });
            }
            const product = { id: doc.id, ...doc.data() };
            const quantity = cart[product.id];
            
            if (product.stock < quantity) {
                return NextResponse.json({ message: `Not enough stock for ${product.name}. Only ${product.stock} left.` }, { status: 400 });
            }
            
            const isFlashSale = product.flashSaleEndDate && product.flashSaleEndDate.toDate() > new Date();
            const currentPrice = isFlashSale ? product.offerPrice : product.price;

            serverCalculatedAmount += currentPrice * quantity;
            productsInCart[product.id] = product;
        }

        // Security: Compare client-side amount with server-calculated amount
        // Allowing a small tolerance for floating point inaccuracies
        if (Math.abs(clientAmount - serverCalculatedAmount) > 0.01) {
            return NextResponse.json({ message: 'Price mismatch. Please refresh your cart.' }, { status: 400 });
        }
        
        // --- Create Pending Order ---
        const tx_ref = `QUICKCART-${Date.now()}`;
        const newOrderRef = db.collection('orders').doc();
        
        await newOrderRef.set({
            amount: serverCalculatedAmount,
            userId: '', // Webhook will associate the user if needed
            customer: { email, name },
            items: Object.entries(cart).map(([id, quantity]) => ({
                ...productsInCart[id],
                productId: id,
                quantity,
            })),
            status: 'pending',
            paymentMethod: 'online',
            transactionRef: tx_ref,
            date: new Date(),
        });

        return NextResponse.json({
            message: 'Payment initialized successfully',
            tx_ref,
        });

    } catch (error) {
        console.error('PAYMENT_INITIALIZATION_ERROR:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
