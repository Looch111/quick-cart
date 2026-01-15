'use client';
import { useEffect, useState, useMemo } from 'react';
import {
  onSnapshot,
  query,
  collection,
  where,
  limit,
  startAfter,
  orderBy,
  endBefore,
  limitToLast,
  Query,
} from 'firebase/firestore';
import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

// This is a custom hook that we can use to listen to a collection in
// Firestore. It returns the data, loading state, and error state.
export function useCollection(
  pathOrQuery,
  {
    where: whereClause,
    limit: limitClause,
    orderBy: orderByClause,
  } = {}
) {
  const firestore = useFirestore();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const memoizedQuery = useMemo(() => {
    if (!firestore) return null;
    // If the path is null or undefined, it's a signal to not fetch yet.
    if (!pathOrQuery) return null;

    // Check if the user passed a pre-constructed query
    if (typeof pathOrQuery !== 'string') {
      return pathOrQuery as Query;
    }

    let q = collection(firestore, pathOrQuery);
    if (whereClause) q = query(q, where(...whereClause));
    if (orderByClause) q = query(q, orderBy(...orderByClause));
    if (limitClause) q = query(q, limit(limitClause));
    return q;
  }, [firestore, pathOrQuery, whereClause, orderByClause, limitClause]);

  useEffect(() => {
    // If the query isn't ready (e.g., waiting for user ID), do nothing.
    if (!memoizedQuery) {
      setLoading(false);
      setData([]); // Ensure data is cleared
      return;
    }
    setLoading(true);
    const unsubscribe = onSnapshot(
      memoizedQuery,
      (snapshot) => {
        const data = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() })
        );
        setData(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore Error in useCollection:", err);
        const permissionError = new FirestorePermissionError({
          path: 'path' in memoizedQuery ? memoizedQuery.path : 'unknown',
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(permissionError);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [memoizedQuery]);

  return { data, loading, error };
}
