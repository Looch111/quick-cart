'use client';
import { useEffect, useState, useMemo } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { useAuth as useFirebaseAuth } from '../provider';
import toast from 'react-hot-toast';

// This is a custom hook that we can use to access the current user.
// It uses the onAuthStateChanged listener to keep track of the user's
// authentication state.
export function useUser() {
  const auth = useFirebaseAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  return { user, loading };
}

// This is a custom hook that provides authentication-related functions.
export function useAuth() {
    const auth = useFirebaseAuth();

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            toast.success('Signed in with Google successfully!');
        } catch (error) {
            console.error("Error signing in with Google: ", error);
            toast.error('Failed to sign in with Google.');
            throw error;
        }
    };

    const signUpWithEmail = async (email, password) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // You can optionally update the user's profile here
            // await updateProfile(userCredential.user, { displayName: "New User" });
            toast.success('Account created successfully!');
        } catch (error) {
            console.error("Error signing up: ", error);
            toast.error(error.message || 'Failed to create account.');
            throw error;
        }
    };

    const signInWithEmail = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success('Signed in successfully!');
        } catch (error) {
            console.error("Error signing in: ", error);
            toast.error(error.message || 'Failed to sign in.');
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error("Error signing out: ", error);
            toast.error('Failed to sign out.');
        }
    };

    return {
        signInWithGoogle,
        signUpWithEmail,
        signInWithEmail,
        signOut,
    };
}
