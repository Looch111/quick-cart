
import { NextResponse } from 'next/server';

// This webhook endpoint now serves only as a backup and for logging purposes.
// The primary wallet update logic has been moved to the server-side verification
// route to ensure immediate and reliable balance updates for the user.
export async function POST(req) {
    const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
    const signature = req.headers.get('verif-hash');

    if (!signature || (signature !== secretHash)) {
        // This is a security measure to ensure the request is from Flutterwave
        return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }

    try {
        const payload = await req.json();
        
        // You can add logging here for monitoring purposes if needed.
        // For example, log successful charges to your monitoring system.
        if (payload.event === 'charge.completed' && payload.data.status === 'successful') {
            console.log(`Webhook received for successful charge: ${payload.data.id}`);
        }

        // Acknowledge receipt of the event
        return NextResponse.json({ status: "success" });

    } catch (error) {
        console.error("Error processing Flutterwave webhook:", error);
        return NextResponse.json({ message: "Webhook processing failed.", error: error.message }, { status: 500 });
    }
}
