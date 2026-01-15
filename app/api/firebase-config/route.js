
import { NextResponse } from 'next/server';
import { firebaseConfig } from '@/src/firebase/config';

/**
 * This API route provides the Firebase configuration to the
 * service worker. The service worker cannot access process.env
 * directly, so it fetches the configuration from this endpoint.
 */
export async function GET() {
    return NextResponse.json(firebaseConfig);
}
