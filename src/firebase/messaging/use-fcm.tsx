'use client';

import { useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { useFirebase } from '../provider';
import { useUser } from '../auth/use-user';
import toast from 'react-hot-toast';

export function useFCM() {
    const { messaging } = useFirebase();
    const { user } = useUser();

    useEffect(() => {
        if (typeof window === 'undefined' || !messaging || !user) return;

        const requestPermissionAndSetupToken = async () => {
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    const fcmToken = await getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY });
                    if (fcmToken) {
                        const idToken = await user.getIdToken();
                        // Send the token to your server to associate it with the user
                        await fetch('/api/register-fcm-token', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${idToken}`,
                            },
                            body: JSON.stringify({ token: fcmToken }),
                        });
                    } else {
                        console.warn('No registration token available. Request permission to generate one.');
                    }
                } else {
                    console.warn('Notification permission denied.');
                }
            } catch (error) {
                console.error('An error occurred while retrieving token or requesting permission:', error);
            }
        };

        requestPermissionAndSetupToken();

        const unsubscribe = onMessage(messaging, (payload) => {
            console.log('Foreground message received:', payload);
            toast.custom((t) => (
                <div
                  className={`${
                    t.visible ? 'animate-enter' : 'animate-leave'
                  } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
                >
                  <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {payload.notification?.title}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {payload.notification?.body}
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
              ));
        });

        return () => unsubscribe();
    }, [messaging, user]);
}
