'use client';
import { useEffect } from 'react';
import { errorEmitter } from '@/src/firebase/error-emitter';
import { FirestorePermissionError } from '@/src/firebase/errors';
import toast from 'react-hot-toast';

// This component listens for permission errors and displays a toast
// notification when one occurs. It also logs the error to the console.
// This is useful for debugging security rules.
export default function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error) => {
      // Check if the error is our custom permission error and has context
      if (error instanceof FirestorePermissionError && error.context) {
        // Log the detailed context for debugging
        console.error('Firestore Permission Error:', error.context);
        
        // Show a helpful toast message to the user
        toast.error(
          `Permission denied. Check security rules for ${error.context.operation} on ${error.context.path}`
        );
      } else {
        // Fallback for generic errors that might not be instances of our custom error
        console.error('An unknown permission error occurred:', error);
        toast.error(error.message || 'An unexpected permission error occurred.');
      }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  return null;
}
