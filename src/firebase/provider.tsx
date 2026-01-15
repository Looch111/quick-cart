'use client';
import { createContext, useContext, useMemo, useEffect, useState } from 'react';
import { initializeFirebase } from './index';
import { getMessaging, isSupported } from 'firebase/messaging';

const FirebaseContext = createContext(
  undefined
);

// This is a custom hook that we can use to access the Firebase context.
export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

export function useFirebaseApp() {
  return useFirebase().firebaseApp;
}

export function useAuth() {
  return useFirebase().auth;
}

export function useFirestore() {
  return useFirebase().firestore;
}

export function FirebaseProvider({ children }) {
  const { firebaseApp, auth, firestore } = useMemo(initializeFirebase, []);
  const [messaging, setMessaging] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      isSupported().then(supported => {
          if (supported && firebaseApp) {
              setMessaging(getMessaging(firebaseApp));
          }
      })
    }
  }, [firebaseApp]);
  
  const contextValue = useMemo(
    () => ({ firebaseApp, auth, firestore, messaging }),
    [firebaseApp, auth, firestore, messaging]
  );
  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
}
