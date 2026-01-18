'use client'
import Image from "next/image";
import { User } from "lucide-react";

const UserAvatar = ({ user, size = 'md' }) => {
    const dimensions = size === 'md' ? 'w-10 h-10' : size === 'sm' ? 'w-8 h-8' : 'w-12 h-12';
    const textSize = size === 'md' ? 'text-lg' : size === 'sm' ? 'text-sm' : 'text-xl';
    const iconSize = size === 'md' ? 'w-6 h-6' : size === 'sm' ? 'w-4 h-4' : 'w-7 h-7';

    if (!user) {
        return (
            <div className={`${dimensions} rounded-full bg-gray-200 flex items-center justify-center overflow-hidden`}>
                <User className={`${iconSize} text-gray-500`} />
            </div>
        )
    }

    return (
        <div className={`${dimensions} rounded-full bg-gray-200 flex items-center justify-center overflow-hidden`}>
            {user.photoURL ? (
                <Image src={user.photoURL} alt={user.name || 'User Avatar'} width={size === 'md' ? 40 : size === 'sm' ? 32 : 48} height={size === 'md' ? 40 : size === 'sm' ? 32 : 48} className="object-cover" />
            ) : user.name ? (
                <span className={`${textSize} font-medium text-gray-600`}>{user.name[0].toUpperCase()}</span>
            ) : user.email ? (
                <span className={`${textSize} font-medium text-gray-600`}>{user.email[0].toUpperCase()}</span>
            ) : (
                <User className={`${iconSize} text-gray-500`} />
            )}
        </div>
    );
};

export default UserAvatar;
