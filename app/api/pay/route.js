import { NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase-admin';

// This endpoint initializes a payment by creating a 'pending' order
// in the database. It's a crucial security step to ensure that order details
// are validated on the server and an immutable record is created before
// handing off to the payment provider.

export async function POST(req) {
    try {
        const { email, name, cart, address, totalAmount, userId, paymentMethod } = await req.json();

        if (!cart || Object.keys(cart).length === 0) {
            return NextResponse.json({ message: 'Cart is empty.' }, { status: 400 });
        }
        
        if (!userId) {
            return NextResponse.json({ message: 'User not authenticated.' }, { status: 401 });
        }

        // --- Server-side validation ---
        let serverCalculatedAmount = 0;
        const productIds = Object.keys(cart);
        const productRefs = productIds.map(id => db.collection('products').doc(id));
        const productDocs = await db.getAll(...productRefs);
        const productsInCart = {};
        const orderItems = [];


        for (const doc of productDocs) {
            if (!doc.exists) {
                return NextResponse.json({ message: `Product with ID ${doc.id} not found.` }, { status: 404 });
            }
            const product = { id: doc.id, ...doc.data() };
            const quantity = cart[product.id];
            
            if (product.stock < quantity) {
                return NextResponse.json({ message: `Not enough stock for ${product.name}. Only ${product.stock} left.` }, { status_code: 400 });
            }
            
            const isFlashSale = product.flashSaleEndDate && product.flashSaleEndDate.toDate() > new Date();
            const currentPrice = isFlashSale ? product.offerPrice : product.price;

            serverCalculatedAmount += currentPrice * quantity;
            productsInCart[product.id] = product;
            orderItems.push({
                ...product,
                price: Number(product.price),
                offerPrice: Number(product.offerPrice),
                productId: product.id,
                quantity,
            });
        }
        
        // --- Create Pending Order ---
        const tx_ref = `QUICKCART-${Date.now()}`;
        const newOrderRef = db.collection('orders').doc();
        
        // Use the server-calculated total amount for the order record
        await newOrderRef.set({
            userId: userId,
            items: orderItems,
            amount: totalAmount, // Use the client-side totalAmount which includes shipping and discounts for the final charge
            address: address,
            status: 'pending',
            paymentMethod: paymentMethod,
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
