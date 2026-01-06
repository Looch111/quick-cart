import { NextResponse } from "next/server";
import admin from '@/app/lib/firebase-admin';
import { db } from '@/app/lib/firebase-admin';

export async function POST(request) {
    const { transactionId, userId } = await request.json();

    if (!transactionId || !userId) {
        return NextResponse.json({ success: false, message: "Transaction ID and User ID are required" }, { status: 400 });
    }

    const url = `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`;
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
            const userRef = db.collection('users').doc(userId);
            const transactionData = data.data;

            // Use a transaction to ensure atomicity
            await db.runTransaction(async (transaction) => {
                const userDoc = await transaction.get(userRef);
                if (!userDoc.exists) {
                    throw new Error("User not found.");
                }

                const userData = userDoc.data();
                const alreadyProcessed = userData.walletTransactions?.some(tx => tx.id === transactionData.id.toString());
                
                if (alreadyProcessed) {
                    console.log(`Transaction ${transactionData.id} has already been processed.`);
                    return; // Exit transaction without doing anything
                }

                const newTransaction = {
                    id: transactionData.id.toString(),
                    type: 'Top Up',
                    amount: transactionData.amount,
                    date: new Date().toISOString(),
                    method: 'Flutterwave',
                };
                
                transaction.update(userRef, {
                    walletBalance: admin.firestore.FieldValue.increment(transactionData.amount),
                    walletTransactions: admin.firestore.FieldValue.arrayUnion(newTransaction)
                });
            });

            return NextResponse.json({ success: true, message: "Payment verified and wallet updated.", data: transactionData });
        } else {
            return NextResponse.json({ success: false, message: data.message || "Payment not successful." });
        }

    } catch (error) {
        console.error("Internal Server Error during Flutterwave verification:", error);
        return NextResponse.json({ success: false, message: error.message || "Internal server error." }, { status: 500 });
    }
}
