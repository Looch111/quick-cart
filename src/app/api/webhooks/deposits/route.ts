import { NextResponse } from 'next/server';
import { creditUserAccount } from '@/app/actions/deposit-actions';

/**
 * THIS IS A MOCK WEBHOOK ENDPOINT
 * In a real application, you would secure this endpoint.
 * For example, by verifying a signature sent by the wallet provider.
 * @see https://docs.fireblocks.com/api/docs/webhooks
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // 1. TODO: SECURITY - Verify the webhook signature
        // For example, using a secret shared between your app and the wallet provider.
        // const signature = request.headers.get('X-Signature');
        // if (!isValidSignature(body, signature)) {
        //     return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 401 });
        // }

        console.log("Received deposit webhook:", body);

        // 2. Parse the data from the webhook payload
        // This is a MOCK structure. Your provider's will be different.
        const { userId, asset, amount, assetName } = body;

        if (!userId || !asset || !amount || !assetName) {
            return NextResponse.json({ success: false, message: 'Missing required fields in webhook payload.' }, { status: 400 });
        }
        
        // 3. Call the secure server action to credit the user's account
        const result = await creditUserAccount({
            userId: userId,
            assetSymbol: asset,
            assetName: assetName,
            amount: parseFloat(amount)
        });

        if (result.success) {
            return NextResponse.json({ success: true, message: 'User credited successfully.' });
        } else {
            // If crediting failed, return a server error status
            return NextResponse.json({ success: false, message: result.message }, { status: 500 });
        }

    } catch (error: any) {
        console.error('Webhook processing error:', error);
        return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
    }
}
