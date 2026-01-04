'use client';
import { useState } from 'react';
import Image from 'next/image';
import { X, Check } from 'lucide-react';

const avatarSeeds = [
    'Gizmo', 'Leo', 'Shadow', 'Misty', 'Jasper', 'Zoe', 'Cali',
    'Max', 'Coco', 'Oscar', 'Loki', 'Toby', 'Rocky', 'Bandit', 'Milo'
];

const AvatarSelectionModal = ({ currentAvatar, onSave, onCancel }) => {
    const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);

    const handleSave = () => {
        onSave(selectedAvatar);
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 px-4">
            <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-lg relative">
                <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X className="h-6 w-6" />
                </button>
                <h1 className="text-2xl font-bold text-gray-800 mb-1">Choose Your Avatar</h1>
                <p className="text-gray-500 mb-6 text-sm">Select an avatar that best describes you.</p>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 max-h-[60vh] overflow-y-auto p-2">
                    {avatarSeeds.map(seed => {
                        const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;
                        const isSelected = selectedAvatar === avatarUrl;
                        return (
                            <div
                                key={seed}
                                className={`relative rounded-full cursor-pointer border-4 ${isSelected ? 'border-orange-500' : 'border-transparent'}`}
                                onClick={() => setSelectedAvatar(avatarUrl)}
                            >
                                <Image
                                    src={avatarUrl}
                                    alt={`Avatar ${seed}`}
                                    width={100}
                                    height={100}
                                    className="rounded-full bg-gray-100"
                                />
                                {isSelected && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                                        <Check className="w-8 h-8 text-white" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onCancel} type="button" className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                        Cancel
                    </button>
                    <button onClick={handleSave} type="button" className="px-6 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md shadow-sm hover:bg-orange-700">
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AvatarSelectionModal;
