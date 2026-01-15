
'use client';
import { useEffect, useState, useMemo } from 'react';
import { onSnapshot, doc, DocumentReference } from 'firebase/firestore';
import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

// This is a custom hook that we can use to listen to a document in
// Firestore. It returns the data, loading state, and error state.
export function useDoc(pathOrDocRef, id) {
  const firestore = useFirestore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const memoizedDocRef = useMemo(() => {
    if (!firestore || !pathOrDocRef) return null;
    if (typeof pathOrDocRef === 'string' && !id) return null;
    
    if (typeof pathOrDocRef !== 'string') {
        return pathOrDocRef as DocumentReference;
    }
    
    return doc(firestore, pathOrDocRef, id);

  }, [firestore, pathOrDocRef, id]);

  useEffect(() => {
    if (!memoizedDocRef) {
        setLoading(false);
        setData(null);
        setError(null);
        return;
    }
    setLoading(true);
    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() });
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore Error in useDoc:", err);
        const permissionError = new FirestorePermissionError({
          path: memoizedDocRef.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(permissionError); // Set the custom error
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [memoizedDocRef]);

  return { data, loading, error };
}
