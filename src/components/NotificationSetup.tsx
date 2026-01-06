'use client';

import { useFCM } from '@/src/firebase/messaging/use-fcm';

/**
 * A client component whose sole purpose is to initialize the
 * Firebase Cloud Messaging (FCM) listener. This isolates the hook
 * from layout components to prevent routing conflicts.
 */
export default function NotificationSetup() {
  useFCM();
  return null;
}
