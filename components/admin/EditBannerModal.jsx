'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { assets } from '@/assets/assets';

const EditBannerModal = ({ banner, onSave, onCancel }) => {
    const [bannerData, setBannerData] = useState({ ...banner });

    useEffect(() => {
        setBannerData({ ...banner });
    }, [banner]);

    if (!banner) return null;

    const handleSave = () => {
        onSave(bannerData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBannerData(prev => ({ ...prev, [name]: value }));
    }

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 px-4">
            <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg relative">
                <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Edit Banner</h1>
                <div className="space-y-4">
                    <div className='flex justify-center'>
                         <Image src={bannerData.image || assets.upload_area} alt={bannerData.title} width={200} height={200} className="w-auto h-32 object-contain rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Banner Title</label>
                        <input
                            type="text"
                            name="title"
                            className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={bannerData.title}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                        <input
                            type="text"
                            name="image"
                            className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={bannerData.image}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Offer Text</label>
                        <input
                            type="text"
                            name="offerText"
                            className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={bannerData.offerText}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Primary Button Text</label>
                        <input
                            type="text"
                            name="buttonText"
                            className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={bannerData.buttonText}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Primary Link URL</label>
                        <input
                            type="text"
                            name="link"
                            className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={bannerData.link}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Button Text</label>
                        <input
                            type="text"
                            name="secondaryButtonText"
                            className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={bannerData.secondaryButtonText}
                            onChange={handleChange}
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Link URL</label>
                        <input
                            type="text"
                            name="secondaryLink"
                            className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={bannerData.secondaryLink}
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onCancel} type="button" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                        Cancel
                    </button>
                    <button onClick={handleSave} type="button" className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md shadow-sm hover:bg-orange-700">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditBannerModal;
