'use server';

import { NextResponse } from 'next/server';
import { creditUserAccount } from '@/app/actions/deposit-actions';
import { z } from 'zod';

// Define the expected shape of the incoming webhook payload.
// In a real scenario, this would match the documentation of your wallet provider (e.g., Fireblocks, BitGo).
const depositWebhookPayloadSchema = z.object({
  userId: z.string().min(1),
  assetSymbol: z.string().min(1),
  assetName: z.string().min(1),
  amount: z.number().positive(),
  // You might also get a transaction hash, confirmation count, etc. from a real provider.
  // txHash: z.string().optional(),
});

/**
 * This is the webhook endpoint that your wallet infrastructure provider will call
 * when a deposit is confirmed on the blockchain.
 * 
 * To deploy, you would give the URL of this endpoint (e.g., https://your-app.com/api/webhooks/deposits)
 * to your wallet provider.
 */
export async function POST(request: Request) {
  console.log('Received a deposit webhook...');

  // --- 1. Verify the webhook signature (CRITICAL FOR SECURITY) ---
  // In a real application, you MUST verify that the request is coming from your
  // wallet provider. They will provide a secret key or a signature in the headers.
  // This prevents anyone from sending fake deposit notifications to your server.
  //
  // Example:
  // const signature = request.headers.get('x-provider-signature');
  // const secret = process.env.WALLET_PROVIDER_WEBHOOK_SECRET;
  // if (!isValidSignature(signature, await request.text(), secret)) {
  //   console.error('Invalid webhook signature.');
  //   return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  // }
  console.log('Security Check: Webhook signature would be verified here in a real app.');


  // --- 2. Parse the request body ---
  let payload;
  try {
    const body = await request.json();
    const validation = depositWebhookPayloadSchema.safeParse(body);
    if (!validation.success) {
      console.error('Invalid webhook payload:', validation.error);
      return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
    }
    payload = validation.data;
  } catch (error) {
    console.error('Failed to parse webhook body:', error);
    return NextResponse.json({ success: false, message: 'Bad request' }, { status: 400 });
  }

  console.log('Webhook payload parsed successfully:', payload);


  // --- 3. Process the deposit by calling our secure server action ---
  try {
    const result = await creditUserAccount({
      userId: payload.userId,
      assetSymbol: payload.assetSymbol,
      assetName: payload.assetName,
      amount: payload.amount,
    });

    if (result.success) {
      console.log(`Successfully credited user ${payload.userId} with ${payload.amount} ${payload.assetSymbol}.`);
      // Return a 200 OK response to the wallet provider so they know it was successful.
      return NextResponse.json({ success: true });
    } else {
      console.error(`Failed to credit user ${payload.userId}:`, result.message);
      // Return a server error status to indicate something went wrong on our end.
      return NextResponse.json({ success: false, message: 'Failed to process deposit.' }, { status: 500 });
    }
  } catch (error) {
    console.error('Unhandled error processing deposit:', error);
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}
