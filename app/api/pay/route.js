import { NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase-admin';
import Flutterwave from 'flutterwave-node-v3';

const flw = new Flutterwave(
    process.env.FLUTTERWAVE_PUBLIC_KEY,
    process.env.FLUTTERWAVE_SECRET_KEY
);

// This simplified endpoint is now only responsible for creating a pending order
// and generating a Flutterwave payment link. The complex validation is moved
// to the webhook for better reliability.
export async function POST(req) {
    try {
        const { email, name, cart, address, totalAmount, userId, paymentMethod } = await req.json();

        if (!userId) {
            return NextResponse.json({ message: 'User not authenticated.' }, { status: 401 });
        }
        if (!cart || Object.keys(cart).length === 0) {
            return NextResponse.json({ message: 'Cart is empty.' }, { status: 400 });
        }
        if (!address) {
            return NextResponse.json({ message: 'Shipping address is missing.' }, { status: 400 });
        }

        const productIds = Object.keys(cart);
        const productRefs = productIds.map(id => db.collection('products').doc(id));
        const productDocs = await db.getAll(...productRefs);
        const orderItems = [];

        for (const doc of productDocs) {
            if (doc.exists) {
                const product = { id: doc.id, ...doc.data() };
                 orderItems.push({
                    productId: product.id,
                    name: product.name,
                    image: product.image,
                    price: Number(product.price),
                    offerPrice: Number(product.offerPrice),
                    quantity: cart[product.id],
                    userId: product.userId,
                 });
            } else {
                 console.warn(`Product with ID ${doc.id} not found during order creation.`);
            }
        }
        
        // --- Create Pending Order ---
        const tx_ref = `QUICKCART-${Date.now()}`;
        const newOrderRef = db.collection('orders').doc();
        
        await newOrderRef.set({
            userId: userId,
            items: orderItems,
            amount: totalAmount, // This will be verified by the webhook
            address: address,
            status: 'pending', // CRITICAL: Start as pending
            paymentMethod: paymentMethod,
            transactionRef: tx_ref,
            date: new Date(),
        });
        
        // --- Generate Payment Link ---
        const payload = {
            tx_ref,
            amount: totalAmount,
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
            console.error("Flutterwave API Error:", response);
            throw new Error('Flutterwave failed to create payment link.');
        }

        return NextResponse.json({
            message: 'Payment link created successfully',
            paymentLink: response.data.link,
            tx_ref,
        });

    } catch (error) {
        console.error('PAYMENT_INITIALIZATION_ERROR:', error);
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
