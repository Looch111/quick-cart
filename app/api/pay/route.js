import { NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase-admin';
import Flutterwave from 'flutterwave-node-v3';

const flw = new Flutterwave(
    process.env.FLUTTERWAVE_PUBLIC_KEY,
    process.env.FLUTTERWAVE_SECRET_KEY
);

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
        const orderItems = [];

        for (const doc of productDocs) {
            if (!doc.exists) {
                throw new Error(`Product with ID ${doc.id} not found.`);
            }
            const product = { id: doc.id, ...doc.data() };
            const quantity = cart[product.id];
            
            if (product.stock < quantity) {
                throw new Error(`Not enough stock for ${product.name}. Only ${product.stock} left.`);
            }
            
            // Safely check for flash sale and calculate price
            const isFlashSale = product.flashSaleEndDate && product.flashSaleEndDate.toDate && product.flashSaleEndDate.toDate() > new Date();
            const currentPrice = isFlashSale ? product.offerPrice : product.price;

            serverCalculatedAmount += Number(currentPrice) * quantity;

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
        
        // Use the SERVER calculated amount for the order record
        await newOrderRef.set({
            userId: userId,
            items: orderItems,
            amount: serverCalculatedAmount, // Use server-calculated amount
            address: address,
            status: 'pending',
            paymentMethod: paymentMethod,
            transactionRef: tx_ref,
            date: new Date(),
        });
        
        // --- Generate Payment Link ---
        const payload = {
            tx_ref,
            amount: totalAmount, // The client total (including shipping/discounts) is sent to Flutterwave
            currency: "NGN",
            redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/order-placed?tx_ref=${tx_ref}`,
            customer: {
              email: email,
              name: name,
            },
            customizations: {
              title: "QuickCart Store",
              description: "Payment for items in cart",
              logo: "https://i.imgur.com/Am9r4s8.png",
            },
        };

        const response = await flw.Payment.initiate(payload);

        if (response.status !== 'success') {
            throw new Error('Flutterwave failed to create payment link.');
        }

        return NextResponse.json({
            message: 'Payment link created successfully',
            paymentLink: response.data.link,
            tx_ref,
        });

    } catch (error) {
        // DETAILED LOGGING: This will show the exact error on the server console.
        console.error('PAYMENT_INITIALIZATION_ERROR:', error);
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
