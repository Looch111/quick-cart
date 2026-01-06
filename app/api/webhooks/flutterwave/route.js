import { NextResponse } from 'next/server';
import admin from '@/app/lib/firebase-admin';

export async function POST(req) {
    const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
    const signature = req.headers.get('verif-hash');

    if (!signature || (signature !== secretHash)) {
        // This request isn't from Flutterwave; discard
        return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }

    try {
        const payload = await req.json();
        const { event, data: transactionData } = payload;

        // Ensure we are handling a completed charge event
        if (event === 'charge.completed' && transactionData.status === 'successful') {
            
            // Check if this is a wallet funding transaction by looking at the metadata
            if (transactionData.meta && transactionData.meta.type === 'wallet-funding') {
                const { tx_ref, amount, meta } = transactionData;
                const userId = meta.user_id;

                if (!userId || !amount) {
                    return NextResponse.json({ message: "Missing metadata for wallet funding" }, { status: 400 });
                }

                const userRef = admin.firestore().collection('users').doc(userId);

                // Use a Firestore transaction to ensure atomic and safe updates
                await admin.firestore().runTransaction(async (transaction) => {
                    const userDoc = await transaction.get(userRef);

                    if (!userDoc.exists) {
                        throw new Error(`User with ID ${userId} not found.`);
                    }
                    
                    const userData = userDoc.data();
                    const transactions = userData.walletTransactions || [];

                    // --- Idempotency Check ---
                    // Prevent processing the same transaction twice by checking the unique tx_ref
                    if (transactions.some(tx => tx.id === tx_ref)) {
                        console.log(`Webhook: Transaction ${tx_ref} already processed.`);
                        return; // Exit transaction gracefully if already handled
                    }
                    
                    const newTransaction = {
                        id: tx_ref, // Use tx_ref for idempotency
                        type: 'Top Up',
                        amount: amount,
                        date: new Date().toISOString(),
                        method: 'Flutterwave',
                    };
                    
                    // Update user's wallet balance and transaction history using Admin SDK FieldValues
                    transaction.update(userRef, {
                        walletBalance: admin.firestore.FieldValue.increment(amount),
                        walletTransactions: admin.firestore.FieldValue.arrayUnion(newTransaction)
                    });
                });

                console.log(`Webhook: Successfully credited ${amount} to user ${userId}'s wallet.`);
            }
        }

        // Acknowledge receipt of the webhook
        return NextResponse.json({ status: "success" });

    } catch (error) {
        console.error("Error processing Flutterwave webhook:", error);
        return NextResponse.json({ message: "Webhook processing failed.", error: error.message }, { status: 500 });
    }
}
