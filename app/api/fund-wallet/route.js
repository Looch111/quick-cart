import { NextResponse } from 'next/server';
import Flutterwave from 'flutterwave-node-v3';

export async function POST(req) {
    const flw = new Flutterwave(process.env.FLUTTERWAVE_PUBLIC_KEY, process.env.FLUTTERWAVE_SECRET_KEY);
    
    try {
        const { amount, userId, email } = await req.json();

        if (!amount || !userId || !email) {
            return NextResponse.json({ message: "Missing required fields: amount, userId, or email." }, { status: 400 });
        }

        const tx_ref = `WALLET-FUND-${userId}-${Date.now()}`;

        const payload = {
            tx_ref,
            amount: Number(amount),
            currency: "USD",
            redirect_url: `${process.env.BASE_URL}/wallet/verify`,
            customer: {
                email: email,
            },
            meta: {
                user_id: userId,
                type: 'wallet-funding'
            },
            customizations: {
                title: "QuickCart Wallet Funding",
                description: `Fund your QuickCart wallet with $${amount}`,
                logo: "https://i.imgur.com/gB343so.png"
            }
        };

        const response = await flw.Payment.initiate(payload);

        if (response.status === 'success') {
            return NextResponse.json({ paymentLink: response.data.link });
        } else {
            console.error("Flutterwave payment initiation failed:", response);
            return NextResponse.json({ message: "Could not initialize payment with Flutterwave." }, { status: 500 });
        }

    } catch (error) {
        console.error("Error in fund-wallet endpoint:", error);
        return NextResponse.json({ message: "An internal server error occurred." }, { status: 500 });
    }
}
