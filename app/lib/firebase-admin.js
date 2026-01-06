
import * as admin from 'firebase-admin';

// This file configures and exports the Firebase Admin SDK.
// It's used for server-side operations that require admin privileges,
// such as verifying webhook signatures or performing complex database transactions.

let serviceAccount;
try {
    // We expect the service account key to be a Base64 encoded string in the environment variables
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString('ascii'));
    } else {
        throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.");
    }
} catch (error) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", error.message);
    serviceAccount = undefined;
}


if (!admin.apps.length) {
  if (serviceAccount) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } catch (error) {
        console.error('Firebase admin initialization error', error.stack);
      }
  } else {
      console.warn("Firebase Admin SDK not initialized due to missing service account key. Server-side Firebase features will not work.");
  }
}

const firestore = admin.apps.length ? admin.firestore() : null;

export const db = firestore;
export const auth = admin.apps.length ? admin.auth() : null;
export default admin;
