'use client';
import { useEffect } from 'react';
import { errorEmitter } from '@/src/firebase/error-emitter';
import { FirestorePermissionError } from '@/src/firebase/errors';
import toast from 'react-hot-toast';
import { XCircle } from 'lucide-react';

// This component listens for permission errors and displays a rich,
// contextual toast notification. This is invaluable for debugging security rules.
export default function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: unknown) => {
      if (error instanceof FirestorePermissionError) {
        // In a real app, you might want to log this to a service like Sentry
        console.error('Firestore Permission Error:', error, error.context);
        
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <XCircle className="h-10 w-10 text-red-500" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Firestore Permission Denied
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Operation <span className="font-mono bg-red-100 text-red-700 rounded px-1">{error.context.operation}</span> on path <span className="font-mono bg-red-100 text-red-700 rounded px-1">{error.context.path}</span> was denied. Check your security rules.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-200">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-orange-600 hover:text-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  Close
                </button>
              </div>
            </div>
          ),
          { duration: 10000 } // Keep the toast longer for debugging
        );
      }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  return null;
}
