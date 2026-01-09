import { NextResponse } from "next/server";
import admin from '@/app/lib/firebase-admin';
import { db } from '@/app/lib/firebase-admin';

// NOTE: This is a simplified example. In a production environment, you would
// need a more robust way to get the bank code from the bank name.
// This might involve a third-party service or a more comprehensive internal mapping.
const getBankCode = (bankName) => {
    const bankMap = {
        "access bank": "044",
        "citibank": "023",
        "diamond bank": "063",
        "ecobank": "050",
        "first bank": "011",
        "globus bank": "103",
        "guaranty trust bank": "058",
        "polaris bank": "076",
        "stanbic ibtc bank": "221",
        "standard chartered bank": "068",
        "sterling bank": "232",
        "suntrust bank": "100",
        "union bank": "032",
        "united bank for africa": "033",
        "unity bank": "215",
        "wema bank": "035",
        "zenith bank": "057",
    };
    return bankMap[bankName.toLowerCase()] || null;
}

export async function POST(request) {
    const { amount, bankDetails, userId } = await request.json();

    if (!amount || !bankDetails || !userId) {
        return NextResponse.json({ success: false, message: "Amount, bank details, and user ID are required" }, { status: 400 });
    }

    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secretKey) {
        console.error("Flutterwave secret key is not set.");
        return NextResponse.json({ success: false, message: "Server configuration error." }, { status: 500 });
    }

    const userRef = db.collection('users').doc(userId);

    try {
        let transferReference;

        // Use a transaction to ensure atomicity
        await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) throw new Error("User not found.");
            
            const userData = userDoc.data();
            if (userData.sellerWallet.balance < amount) throw new Error("Insufficient balance.");
            
            transferReference = `QUICKCART-WITHDRAWAL-${userId}-${Date.now()}`;
            const newTransaction = {
                id: transferReference,
                type: 'Withdrawal',
                amount: amount,
                date: new Date().toISOString(),
                status: 'pending' // We'll update this after the API call
            };

            transaction.update(userRef, {
                'sellerWallet.balance': admin.firestore.FieldValue.increment(-amount),
                'sellerWallet.transactions': admin.firestore.FieldValue.arrayUnion(newTransaction)
            });
        });
        
        const bankCode = getBankCode(bankDetails.bankName);
        if (!bankCode) {
            // If bank code is not found, we must revert the transaction
            throw new Error(`Bank "${bankDetails.bankName}" not supported or name is incorrect.`);
        }

        const transferPayload = {
            account_bank: bankCode,
            account_number: bankDetails.accountNumber,
            amount: amount,
            narration: "QuickCart Seller Payout",
            currency: "NGN",
            reference: transferReference,
            callback_url: "https://webhook.site/b3e505b0-fe02-430e-a558-24bbb13cb00e", // Replace with your actual webhook URL for transfers
            debit_currency: "NGN"
        };
        
        const flutterwaveResponse = await fetch('https://api.flutterwave.com/v3/transfers', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${secretKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transferPayload)
        });

        const responseData = await flutterwaveResponse.json();

        if (responseData.status === 'success') {
            // The transfer is initiated. Flutterwave will send a webhook for final status.
            // For now, we assume it's successful for the client.
            // You should have a webhook handler to update the transaction status from 'pending' to 'successful' or 'failed'.
            return NextResponse.json({ success: true, message: "Withdrawal initiated successfully." });
        } else {
             // If the API call fails, we need to revert the balance deduction and transaction record.
            throw new Error(responseData.message || "Failed to initiate transfer with Flutterwave.");
        }

    } catch (error) {
        console.error("Withdrawal Error:", error);
        
        // Revert the transaction if something went wrong after the Firestore update but before/during the API call
        await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            const userData = userDoc.data();
            const pendingTx = userData.sellerWallet.transactions.find(tx => tx.status === 'pending');

            if (pendingTx) {
                 transaction.update(userRef, {
                    'sellerWallet.balance': admin.firestore.FieldValue.increment(pendingTx.amount),
                    'sellerWallet.transactions': admin.firestore.FieldValue.arrayRemove(pendingTx)
                });
            }
        });

        return NextResponse.json({ success: false, message: error.message || "Internal server error." }, { status: 500 });
    }
}
