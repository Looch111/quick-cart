'use client';
import { useEffect, useState, useMemo } from 'react';
import { onSnapshot, doc, type DocumentData } from 'firebase/firestore';
import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

// This is a custom hook that we can use to listen to a document in
// Firestore. It returns the data, loading state, and error state.
export function useDoc<T = DocumentData>(path: string, id: string) {
  const firestore = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const memoizedDocRef = useMemo(
    () => doc(firestore, path, id),
    [firestore, path, id]
  );

  useEffect(() => {
    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        const permissionError = new FirestorePermissionError({
          path: `${path}/${id}`,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [memoizedDocRef, path, id]);

  return { data, loading, error };
}
