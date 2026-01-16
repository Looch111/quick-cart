'use client';
import { useState, useEffect, useRef } from 'react';
import { Bell, X } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useFirestore, useCollection } from '@/src/firebase';
import { doc, setDoc } from 'firebase/firestore';
import Link from 'next/link';

const NotificationPanel = () => {
    const { userData } = useAppContext();
    const firestore = useFirestore();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const { data: notifications, loading } = useCollection(
        userData ? `users/${userData._id}/notifications` : null,
        { orderBy: ['createdAt', 'desc'], limit: 10 }
    );

    const unreadCount = notifications ? notifications.filter(n => !n.read).length : 0;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = () => {
        setIsOpen(prev => !prev);
    };

    const handleMarkAsRead = async (id) => {
        if (!userData) return;
        const notifRef = doc(firestore, `users/${userData._id}/notifications`, id);
        await setDoc(notifRef, { read: true }, { merge: true });
    };

    const handleMarkAllAsRead = async () => {
        if (!userData || !notifications) return;
        const unreadNotifications = notifications.filter(n => !n.read);
        const batch = [];
        unreadNotifications.forEach(notif => {
            const notifRef = doc(firestore, `users/${userData._id}/notifications`, notif.id);
            batch.push(setDoc(notifRef, { read: true }, { merge: true }));
        });
        if (batch.length > 0) {
            await Promise.all(batch);
        }
    };

    const formatTimeAgo = (timestamp) => {
        if (!timestamp) return '';
        const now = new Date();
        const past = timestamp.toDate();
        const seconds = Math.floor((now - past) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return Math.floor(seconds) + "s ago";
    };

    if (!userData) return null;

    const panelContent = (
        <>
            <div className="px-4 py-3 border-b flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">Notifications</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                </button>
            </div>
            {loading ? (
                <p className="text-center py-4 text-gray-500 text-sm">Loading...</p>
            ) : notifications.length === 0 ? (
                <p className="text-center py-10 text-gray-500 text-sm">No notifications yet.</p>
            ) : (
                <div className="max-h-[70vh] md:max-h-96 overflow-y-auto">
                    {notifications.map(notif => (
                        <Link
                            href={notif.link || '#'}
                            key={notif.id}
                            className={`block px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 ${!notif.read ? 'bg-orange-50' : ''}`}
                            onClick={() => {
                                handleMarkAsRead(notif.id);
                                setIsOpen(false);
                            }}
                        >
                            <p className="text-sm text-gray-700">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(notif.createdAt)}</p>
                        </Link>
                    ))}
                </div>
            )}
            {notifications && notifications.length > 0 && (
                 <div className="px-4 py-2 border-t">
                    <button 
                        onClick={handleMarkAllAsRead} 
                        disabled={unreadCount === 0}
                        className="w-full text-center text-sm text-orange-600 font-medium disabled:text-gray-400 disabled:cursor-not-allowed">
                        Mark all as read
                    </button>
                </div>
            )}
        </>
    );

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={handleToggle} className="relative p-2 rounded-full hover:bg-gray-100">
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    {/* Mobile: Modal view */}
                    <div className="md:hidden">
                        <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setIsOpen(false)}></div>
                        <div className="fixed top-20 inset-x-4 z-50 bg-white rounded-lg shadow-xl overflow-hidden">
                           {panelContent}
                        </div>
                    </div>

                    {/* Desktop: Dropdown view */}
                    <div className="hidden md:block absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200/80 z-50 overflow-hidden">
                        {panelContent}
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationPanel;
