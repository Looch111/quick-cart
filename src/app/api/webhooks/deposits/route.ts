/**
 * This webhook endpoint is no longer in use as the application has been simplified
 * to a Naira-only deposit flow, which does not require a crypto deposit webhook.
 */
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    console.warn("This crypto deposit webhook is deprecated and no longer in use.");
    return NextResponse.json({ success: false, message: 'This endpoint is deprecated.' }, { status: 410 });
}
