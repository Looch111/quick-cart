
'use client';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

const FloatingSupportButton = () => {
    return (
        <Link 
            href="/contact" 
            className="fixed bottom-8 right-8 bg-orange-600 text-white p-4 rounded-full shadow-lg hover:bg-orange-700 transition-transform hover:scale-110 z-30"
            aria-label="Contact support"
        >
            <MessageSquare className="w-6 h-6" />
        </Link>
    );
};

export default FloatingSupportButton;
