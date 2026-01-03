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
  type DocumentData,
  type Query,
} from 'firebase/firestore';
import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

// This is a custom hook that we can use to listen to a collection in
// Firestore. It returns the data, loading state, and error state.
export function useCollection<T = DocumentData>(
  path: string,
  {
    where: whereClause,
    limit: limitClause,
    orderBy: orderByClause,
  }: {
    where?: [string, any, any];
    limit?: number;
    orderBy?: [string, 'asc' | 'desc'];
  } = {}
) {
  const firestore = useFirestore();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const memoizedQuery = useMemo(() => {
    let q: Query = collection(firestore, path);
    if (whereClause) q = query(q, where(...whereClause));
    if (orderByClause) q = query(q, orderBy(...orderByClause));
    if (limitClause) q = query(q, limit(limitClause));
    return q;
  }, [firestore, path, whereClause, orderByClause, limitClause]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      memoizedQuery,
      (snapshot) => {
        const data: T[] = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as T)
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
