'use server';
import Flutterwave from 'flutterwave-node-v3';
import admin from '@/app/lib/firebase-admin';

export async function fundWalletAction(payload) {
    const { amount, userId, email } = payload;
    
    if (!process.env.FLUTTERWAVE_PUBLIC_KEY || !process.env.FLUTTERWAVE_SECRET_KEY || !process.env.BASE_URL) {
        console.error("Flutterwave API keys or BASE_URL are not configured in .env file.");
        return { success: false, message: "Server is not configured for payments." };
    }
     if (!amount || !userId || !email) {
        return { success: false, message: "Missing required fields: amount, userId, or email." };
    }

    try {
        const flw = new Flutterwave(process.env.FLUTTERWAVE_PUBLIC_KEY, process.env.FLUTTERWAVE_SECRET_KEY);
        const tx_ref = `WALLET-FUND-${userId}-${Date.now()}`;

        const paymentPayload = {
            tx_ref,
            amount: Number(amount),
            currency: "NGN",
            redirect_url: `${process.env.BASE_URL}/wallet/verify`,
            customer: { email },
            meta: { user_id: userId, type: 'wallet-funding' },
            customizations: {
                title: "QuickCart Wallet Funding",
                description: `Fund your QuickCart wallet with ₦${amount}`,
                logo: "https://i.imgur.com/gB343so.png"
            }
        };

        const response = await flw.Payment.initiate(paymentPayload);

        if (response.status === 'success') {
            return { success: true, paymentLink: response.data.link };
        } else {
            console.error("Flutterwave payment initiation failed:", response);
            return { success: false, message: "Could not initialize payment with Flutterwave." };
        }

    } catch (error) {
        console.error("Critical Error in fundWalletAction:", error);
        return { success: false, message: "An internal server error occurred." };
    }
}


export async function verifyTransactionAction(payload) {
    const { transaction_id } = payload;

    if (!transaction_id) {
        return { success: false, message: "Transaction ID is required" };
    }

    const url = `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`;
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;

    if (!secretKey) {
        console.error("Flutterwave secret key is not set in environment variables.");
        return { success: false, message: "Server configuration error." };
    }

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { Authorization: `Bearer ${secretKey}` },
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Flutterwave API Error:", data);
            return { success: false, message: data.message || "Failed to verify transaction with Flutterwave." };
        }

        if (data.status === "success" && data.data.status === "successful") {
            const transactionData = data.data;
            const { tx_ref, amount, meta } = transactionData;
            const userId = meta?.user_id;

            if (!userId || !amount) {
                return { success: false, message: "Missing metadata for wallet funding" };
            }

            const userRef = admin.firestore().collection('users').doc(userId);

            await admin.firestore().runTransaction(async (transaction) => {
                const userDoc = await transaction.get(userRef);
                if (!userDoc.exists) throw new Error(`User with ID ${userId} not found.`);
                
                const userData = userDoc.data();
                const transactions = userData.walletTransactions || [];

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

            return { success: true, data: transactionData };

        } else {
            return { success: false, message: data.message || "Payment not successful." };
        }

    } catch (error) {
        console.error("Internal Server Error during Flutterwave verification:", error);
        return { success: false, message: "Internal server error." };
    }
}
