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
  options = {}
) {
  const {
    where: whereClause,
    limit: limitClause,
    orderBy: orderByClause,
  } = options;

  const firestore = useFirestore();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const memoizedQuery = useMemo(() => {
    if (!firestore || !pathOrQuery) return null;

    // If a `where` clause is provided, ensure all its values are defined.
    // This prevents queries like `where('userId', '==', undefined)`.
    if (Array.isArray(whereClause) && whereClause.some(val => val === undefined)) {
      return null;
    }

    if (typeof pathOrQuery !== 'string') {
      return pathOrQuery as Query;
    }

    let q = collection(firestore, pathOrQuery);
    if (whereClause) q = query(q, where(...whereClause));
    if (orderByClause) q = query(q, orderBy(...orderByClause));
    if (limitClause) q = query(q, limit(limitClause));
    return q;
  }, [firestore, pathOrQuery, JSON.stringify(whereClause), JSON.stringify(orderByClause), limitClause]);


  useEffect(() => {
    if (!memoizedQuery) {
      setLoading(false);
      setData([]);
      setError(null);
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
        const permissionError = new FirestorePermissionError(
          {
            path: 'path' in (memoizedQuery as any) ? (memoizedQuery as any).path : 'unknown',
            operation: 'list',
          },
          err
        );
        errorEmitter.emit('permission-error', permissionError);
        setError(permissionError); // Set the custom error
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [memoizedQuery]);

  return { data, loading, error };
}
