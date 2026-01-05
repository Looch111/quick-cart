import { NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase-admin';

// This is the webhook handler for Flutterwave. It's responsible for
// verifying the payment status and updating the order in the database.
// This is a critical part of the payment flow as it's the source of truth
// for whether a payment was successful or not.

export async function POST(req) {
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
    const signature = req.headers.get('verif-hash');

    if (!signature || (signature !== secretHash)) {
        // This request isn't from Flutterwave. Don't process it.
        return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
    }

    try {
        const payload = await req.json();
        console.log("Received Flutterwave webhook:", payload);

        // Check if the payment was successful
        if (payload.status === 'successful' || payload.event === 'charge.completed') {
            const tx_ref = payload.data?.tx_ref || payload.tx_ref;
            const amountPaid = payload.data?.amount || payload.amount;

            if (!tx_ref) {
                 console.warn(`Webhook received without a transaction reference.`);
                 return NextResponse.json({ status: 'success', message: 'Acknowledged, but no tx_ref found.' });
            }

            // Find the pending order in Firestore using the transaction reference
            const ordersRef = db.collection('orders');
            const snapshot = await ordersRef.where('transactionRef', '==', tx_ref).where('status', '==', 'pending').limit(1).get();

            if (snapshot.empty) {
                console.warn(`No pending order found for tx_ref: ${tx_ref}. It might have been processed already.`);
                // Acknowledge receipt to Flutterwave even if order not found
                return NextResponse.json({ status: 'success', message: 'Acknowledged, but no order found or already processed.' });
            }

            const orderDoc = snapshot.docs[0];
            const order = orderDoc.data();

            // --- CRITICAL VERIFICATION ---
            // Verify that the amount paid matches the order amount. Allow for small floating point discrepancies.
            if (Math.abs(order.amount - amountPaid) > 0.01) {
                console.error(`CRITICAL: Amount mismatch for tx_ref: ${tx_ref}. Expected ${order.amount}, but Flutterwave reported ${amountPaid}.`);
                // Mark order as failed to prevent fulfillment and trigger manual review.
                await orderDoc.ref.update({ status: 'failed', failureReason: 'Amount mismatch' });
                return NextResponse.json({ message: 'Amount mismatch' }, { status: 400 });
            }
            
            // --- Finalize Order in a Transaction ---
            await db.runTransaction(async (transaction) => {
                // Double check stock and product existence before committing
                for (const item of order.items) {
                    const productRef = db.collection('products').doc(item.productId);
                    const productDoc = await transaction.get(productRef);
                    if (!productDoc.exists) {
                        throw new Error(`Product ${item.productId} not found during final transaction!`);
                    }
                    
                    const newStock = productDoc.data().stock - item.quantity;
                    if (newStock < 0) {
                        throw new Error(`Stock level error for ${item.productId}! Cannot fulfill order.`);
                    }
                    
                    transaction.update(productRef, { stock: newStock });
                }
                
                // Update order status to 'Order Placed' and clear the user's cart
                transaction.update(orderDoc.ref, { status: 'Order Placed' });

                if (order.userId) {
                    const userRef = db.collection('users').doc(order.userId);
                    transaction.update(userRef, { cartItems: {} });
                }
            });

            console.log(`Order ${orderDoc.id} successfully processed and verified for tx_ref: ${tx_ref}`);
        } else {
            // Handle failed or abandoned transactions if needed
            const tx_ref = payload.data?.tx_ref || payload.tx_ref;
            if (tx_ref) {
                 const ordersRef = db.collection('orders');
                 const snapshot = await ordersRef.where('transactionRef', '==', tx_ref).where('status', '==', 'pending').limit(1).get();
                 if (!snapshot.empty) {
                     const orderDoc = snapshot.docs[0];
                     await orderDoc.ref.update({ status: 'failed', failureReason: payload.data?.processor_response || 'Payment failed or was cancelled.' });
                 }
            }
        }

        // Acknowledge receipt to Flutterwave
        return NextResponse.json({ status: 'success' });
    } catch (error) {
        console.error('FLUTTERWAVE_WEBHOOK_ERROR:', error.message);
        // Return a 500 error to signal that something went wrong on our end
        return NextResponse.json({ message: `Internal Server Error: ${error.message}` }, { status: 500 });
    }
}
