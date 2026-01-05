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
        const { event, data } = payload;

        if (event === 'charge.completed' && data.status === 'successful') {
            // Check if this is a wallet funding transaction
            if (data.meta && data.meta.type === 'wallet-funding') {
                const userId = data.meta.user_id;
                const amount = data.amount;
                const tx_ref = data.tx_ref;

                if (!userId || !amount) {
                    return NextResponse.json({ message: "Missing metadata for wallet funding" }, { status: 400 });
                }

                const userRef = admin.firestore().collection('users').doc(userId);

                // Use a transaction to ensure atomicity
                await admin.firestore().runTransaction(async (transaction) => {
                    const userDoc = await transaction.get(userRef);

                    if (!userDoc.exists) {
                        throw new Error(`User with ID ${userId} not found.`);
                    }
                    
                    const userData = userDoc.data();
                    const transactions = userData.walletTransactions || [];

                    // --- Idempotency Check ---
                    // Prevent processing the same transaction twice
                    if (transactions.some(tx => tx.id === tx_ref)) {
                        console.log(`Transaction ${tx_ref} already processed.`);
                        return; // Exit transaction gracefully
                    }
                    
                    const newBalance = (userData.walletBalance || 0) + amount;

                    const newTransaction = {
                        id: tx_ref, // Use tx_ref for idempotency
                        type: 'Top Up',
                        amount: amount,
                        date: new Date().toISOString(),
                        method: 'Flutterwave',
                    };

                    const updatedTransactions = [newTransaction, ...transactions];

                    transaction.update(userRef, {
                        walletBalance: newBalance,
                        walletTransactions: updatedTransactions
                    });
                });

                console.log(`Successfully credited ${amount} to user ${userId}'s wallet.`);
            }
        }

        return NextResponse.json({ status: "success" });

    } catch (error) {
        console.error("Error processing Flutterwave webhook:", error);
        return NextResponse.json({ message: "Webhook processing failed.", error: error.message }, { status: 500 });
    }
}
