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
    const handleError = (error: FirestorePermissionError) => {
      console.error('Firestore Permission Error:', error.context);
      toast.error(
        `Permission denied. Check security rules for ${error.context.operation} on ${error.context.path}`
      );
      // In a real app, you might want to log this to a service like Sentry
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  return null;
}
