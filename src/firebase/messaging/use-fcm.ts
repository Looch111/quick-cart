'use client';

import { useEffect } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { useFirebase, useAuth } from '../provider';
import toast from 'react-hot-toast';

export function useFCM() {
    const { messaging } = useFirebase();
    const { user } = useAuth();

    useEffect(() => {
        if (typeof window === 'undefined' || !messaging) return;

        const requestPermission = async () => {
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    await setupToken();
                } else {
                    console.warn('Notification permission denied.');
                }
            } catch (error) {
                console.error('Error requesting notification permission:', error);
            }
        };

        const setupToken = async () => {
            try {
                const fcmToken = await getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY });
                if (fcmToken) {
                    // Send the token to your server to associate it with the user
                    const idToken = await user.getIdToken();
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
            } catch (error) {
                console.error('An error occurred while retrieving token:', error);
            }
        };

        if (user) {
            requestPermission();
        }

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
