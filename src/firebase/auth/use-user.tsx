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
  sendPasswordResetEmail,
  sendEmailVerification,
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

// ActionCodeSettings for directing users back to the app
const actionCodeSettings = {
    url: typeof window !== 'undefined' ? `${window.location.origin}/` : 'http://localhost:3000/',
    handleCodeInApp: true,
};

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

    const signUpWithEmail = async (email, password, name) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });
            await sendEmailVerification(userCredential.user, actionCodeSettings);
            return {isNewUser: true, user: userCredential.user};
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
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            if (!userCredential.user.emailVerified) {
                toast.error('Please verify your email before logging in.');
                return { isUnverified: true, user: userCredential.user };
            }
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

    const sendPasswordReset = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email, actionCodeSettings);
            toast.success('Password reset link sent! Check your email.');
        } catch (error) {
            console.error("Error sending password reset email: ", error);
            if (error.code === 'auth/user-not-found') {
                toast.error('No account found with that email address.');
            } else {
                toast.error('Failed to send reset link. Please try again.');
            }
        }
    }

    const resendVerificationEmail = async (user) => {
        try {
            await sendEmailVerification(user, actionCodeSettings);
            toast.success('Verification email sent! Check your inbox.');
        } catch (error) {
            console.error("Error resending verification email:", error);
            toast.error("Failed to resend verification email. Please try again.");
        }
    }

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
        sendPasswordReset,
        resendVerificationEmail,
    };
}
