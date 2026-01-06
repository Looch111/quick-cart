
import { NextResponse } from 'next/server';
import admin from '@/app/lib/firebase-admin';
import { db } from '@/app/lib/firebase-admin';

export async function POST(req) {
    const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
    const signature = req.headers.get('verif-hash');

    if (!signature || (signature !== secretHash)) {
        return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }

    try {
        const payload = await req.json();
        const { event, data: transactionData } = payload;
        
        if (event === 'charge.completed' && transactionData.status === 'successful') {
            
            const tx_ref = transactionData.tx_ref;
            if (tx_ref && tx_ref.includes('WALLET')) {
                 const { amount, customer } = transactionData;
                const userEmail = customer.email;

                if (!userEmail || !amount) {
                    return NextResponse.json({ message: "Missing metadata for wallet funding" }, { status: 400 });
                }

                const usersRef = db.collection('users');
                const q = usersRef.where('email', '==', userEmail).limit(1);
                const querySnapshot = await q.get();

                if (querySnapshot.empty) {
                    throw new Error(`User with email ${userEmail} not found.`);
                }
                
                const userDoc = querySnapshot.docs[0];
                const userRef = userDoc.ref;


                await db.runTransaction(async (transaction) => {
                    const freshUserDoc = await transaction.get(userRef);

                    if (!freshUserDoc.exists) {
                        throw new Error(`User with email ${userEmail} not found during transaction.`);
                    }
                    
                    const userData = freshUserDoc.data();
                    const transactions = userData.walletTransactions || [];

                    if (transactions.some(tx => tx.id === tx_ref)) {
                        console.log(`Webhook: Transaction ${tx_ref} already processed.`);
                        return; 
                    }
                    
                    const newTransaction = {
                        id: tx_ref,
                        type: 'Top Up',
                        amount: amount,
                        date: new Date().toISOString(),
                        method: 'Flutterwave',
                    };
                    
                    transaction.update(userRef, {
                        walletBalance: admin.firestore.FieldValue.increment(amount),
                        walletTransactions: admin.firestore.FieldValue.arrayUnion(newTransaction)
                    });
                });

                console.log(`Webhook: Successfully credited ${amount} to user ${userEmail}'s wallet.`);
            }
        }

        return NextResponse.json({ status: "success" });

    } catch (error) {
        console.error("Error processing Flutterwave webhook:", error);
        return NextResponse.json({ message: "Webhook processing failed.", error: error.message }, { status: 500 });
    }
}
