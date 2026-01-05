import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// App is a singleton, so we can initialize it once and then reuse it.
// We are using initializeApp to create the app, and then we are
// using getAuth and getFirestore to get the auth and firestore services.
export function initializeFirebase() {
  const existingApp = getApps().length ? getApp() : null;
  if (existingApp) {
    return {
      firebaseApp: existingApp,
      auth: getAuth(existingApp),
      firestore: getFirestore(existingApp),
    };
  }

  const firebaseApp = initializeApp(firebaseConfig);
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);

  return { firebaseApp, auth, firestore };
}

export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
