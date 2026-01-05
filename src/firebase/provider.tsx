'use client';
import { createContext, useContext, useMemo } from 'react';
import { initializeFirebase } from './index';

// The Firebase context is used to provide the Firebase app, auth, and firestore
// instances to the rest of the application. The context is created in this
// file, and then the FirebaseProvider component is used to wrap the
// application in `app/layout.tsx`.

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
  const contextValue = useMemo(
    () => ({ firebaseApp, auth, firestore }),
    [firebaseApp, auth, firestore]
  );
  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
}
