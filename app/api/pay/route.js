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
        
        // Use the totalAmount passed from client as the final charge amount, which includes shipping & discounts
        await newOrderRef.set({
            userId: userId,
            items: orderItems,
            amount: totalAmount, 
            address: address,
            status: 'pending',
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
            return NextResponse.json({ message: 'Failed to create payment link.' }, { status: 500 });
        }

        return NextResponse.json({
            message: 'Payment link created successfully',
            paymentLink: response.data.link,
            tx_ref,
        });

    } catch (error) {
        console.error('PAYMENT_INITIALIZATION_ERROR:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
