'use client';
import { FirebaseProvider } from './provider';

// FirebaseClientProvider is a wrapper around the FirebaseProvider that
// ensures that the Firebase app is only initialized on the client.
export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FirebaseProvider>{children}</FirebaseProvider>;
}
