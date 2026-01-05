import { NextResponse } from "next/server";
import admin from '@/app/lib/firebase-admin';

export async function POST(request) {
    const { transaction_id } = await request.json();

    if (!transaction_id) {
        return NextResponse.json({ success: false, message: "Transaction ID is required" }, { status: 400 });
    }

    const url = `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`;
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;

    if (!secretKey) {
        console.error("Flutterwave secret key is not set in environment variables.");
        return NextResponse.json({ success: false, message: "Server configuration error." }, { status: 500 });
    }

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${secretKey}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Flutterwave API Error:", data);
            return NextResponse.json({ success: false, message: data.message || "Failed to verify transaction with Flutterwave." }, { status: response.status });
        }

        if (data.status === "success" && data.data.status === "successful") {
            const transactionData = data.data;

            // --- Securely update user's wallet ---
            const { tx_ref, amount, meta } = transactionData;
            const userId = meta?.user_id;

            if (!userId || !amount) {
                return NextResponse.json({ message: "Missing metadata for wallet funding" }, { status: 400 });
            }

            const userRef = admin.firestore().collection('users').doc(userId);

            await admin.firestore().runTransaction(async (transaction) => {
                const userDoc = await transaction.get(userRef);

                if (!userDoc.exists) {
                    throw new Error(`User with ID ${userId} not found.`);
                }
                
                const userData = userDoc.data();
                const transactions = userData.walletTransactions || [];

                // Idempotency Check: Prevent double crediting
                if (transactions.some(tx => tx.id === tx_ref)) {
                    console.log(`Transaction ${tx_ref} already processed.`);
                    return; 
                }
                
                const newBalance = (userData.walletBalance || 0) + amount;
                const newTransactionRecord = {
                    id: tx_ref,
                    type: 'Top Up',
                    amount: amount,
                    date: new Date().toISOString(),
                    method: 'Flutterwave',
                };

                const updatedTransactions = [newTransactionRecord, ...transactions];

                transaction.update(userRef, {
                    walletBalance: newBalance,
                    walletTransactions: updatedTransactions
                });
            });

            return NextResponse.json({ success: true, data: transactionData });

        } else {
            return NextResponse.json({ success: false, message: data.message || "Payment not successful." });
        }

    } catch (error) {
        console.error("Internal Server Error during Flutterwave verification:", error);
        return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
    }
}
