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
  getAdditionalUserInfo,
} from 'firebase/auth';
import { useAuth as useFirebaseAuth } from '../provider';
import toast from 'react-hot-toast';

// This is a custom hook that we can use to access the current user.
// It uses the onAuthStateChanged listener to keep track of the user's
// authentication state.
export function useUser() {
  const auth = useFirebaseAuth();
  const [user, setUser] = useState(null);
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
            const result = await signInWithPopup(auth, provider);
            const additionalInfo = getAdditionalUserInfo(result);
            if (additionalInfo?.isNewUser) {
                toast.success('Account created successfully! Welcome!');
                // The onboarding tour will be triggered by the isNewUser flag in the user's document
            } else {
                toast.success('Signed in with Google successfully!');
            }
            return {isNewUser: additionalInfo?.isNewUser};
        } catch (error) {
            console.error("Error signing in with Google: ", error);
            toast.error('Failed to sign in with Google. Please try again.');
            throw error;
        }
    };

    const signUpWithEmail = async (email, password) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            toast.success('Account created successfully! Welcome!');
            // The onboarding tour will be triggered by the isNewUser flag in the user's document
            return {isNewUser: true};
        } catch (error) {
            console.error("Error signing up: ", error);
            if (error.code === 'auth/email-already-in-use') {
                toast.error('An account with this email already exists.');
            } else if (error.code === 'auth/weak-password') {
                toast.error('Password is too weak. It should be at least 6 characters.');
            }
            else {
                toast.error('Failed to create account. Please try again.');
            }
            throw error;
        }
    };

    const signInWithEmail = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success('Signed in successfully!');
             return {isNewUser: false};
        } catch (error) {
            console.error("Error signing in: ", error);
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                toast.error('Invalid email or password.');
            } else {
                toast.error('Failed to sign in. Please try again.');
            }
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
        signUpWithEmail,
        signInWithEmail,
        signOut,
    };
}

    