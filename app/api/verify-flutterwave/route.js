import { NextResponse } from "next/server";

export async function POST(request) {
    const { transactionId } = await request.json();

    if (!transactionId) {
        return NextResponse.json({ success: false, message: "Transaction ID is required" }, { status: 400 });
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

        if (data.status === "success") {
            // This endpoint only confirms the payment was successful.
            // The webhook is responsible for fulfilling the order/crediting the wallet.
            return NextResponse.json({ success: true, data: data.data });
        } else {
            return NextResponse.json({ success: false, message: data.message || "Payment not successful." });
        }

    } catch (error) {
        console.error("Internal Server Error during Flutterwave verification:", error);
        return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
    }
}
