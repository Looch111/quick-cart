
import { NextResponse } from "next/server";
import admin from '@/app/lib/firebase-admin';
import { db } from '@/app/lib/firebase-admin';

export async function POST(request) {
    const { token: fcmToken } = await request.json();
    const idToken = request.headers.get('authorization')?.split('Bearer ')[1];

    if (!fcmToken || !idToken) {
        return NextResponse.json({ message: 'Missing token' }, { status: 400 });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const userId = decodedToken.uid;

        const userRef = db.collection('users').doc(userId);
        
        await userRef.update({
            fcmTokens: admin.firestore.FieldValue.arrayUnion(fcmToken)
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error registering FCM token:', error);
        return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
    }
}
