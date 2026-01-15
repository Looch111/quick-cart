
'use client';
import { MessageSquare } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

const FloatingSupportButton = () => {
    const { openChatModal, userData, hasUnreadMessages } = useAppContext();

    if (!userData) return null;

    return (
        <button
            onClick={openChatModal}
            className="fixed bottom-8 right-8 bg-orange-600 text-white p-4 rounded-full shadow-lg hover:bg-orange-700 transition-transform hover:scale-110 z-30"
            aria-label="Contact support"
        >
            <MessageSquare className="w-6 h-6" />
            {hasUnreadMessages && (
                 <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full border-2 border-white"></span>
            )}
        </button>
    );
};

export default FloatingSupportButton;
