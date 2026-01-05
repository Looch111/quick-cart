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
} from 'firebase/firestore';
import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

// This is a custom hook that we can use to listen to a collection in
// Firestore. It returns the data, loading state, and error state.
export function useCollection(
  path,
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
    let q = collection(firestore, path);
    if (whereClause) q = query(q, where(...whereClause));
    if (orderByClause) q = query(q, orderBy(...orderByClause));
    if (limitClause) q = query(q, limit(limitClause));
    return q;
  }, [firestore, path, whereClause, orderByClause, limitClause]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      memoizedQuery,
      (snapshot) => {
        const data = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() })
        );
        setData(data);
        setLoading(false);
      },
      (err) => {
        const permissionError = new FirestorePermissionError({
          path: path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [memoizedQuery, path]);

  return { data, loading, error };
}
