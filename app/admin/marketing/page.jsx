'use client';
import { useState } from 'react';
import { useAppContext } from "@/context/AppContext";
import toast from 'react-hot-toast';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import Footer from "@/components/admin/Footer";
import EditBannerModal from '@/components/admin/EditBannerModal';
import Image from 'next/image';
import DeleteConfirmationModal from '@/components/admin/DeleteConfirmationModal';

const MarketingPage = () => {
    const { banners, addBanner, deleteBanner, updateBanner } = useAppContext();
    const [isAdding, setIsAdding] = useState(false);
    const [newBanner, setNewBanner] = useState({ title: '', link: '', buttonText: '', linkText: '' });
    const [editingBanner, setEditingBanner] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [bannerToDelete, setBannerToDelete] = useState(null);

    const handleAddBanner = (e) => {
        e.preventDefault();
        if (!newBanner.title || !newBanner.link || !newBanner.buttonText || !newBanner.linkText) {
            toast.error("Please fill out all fields for the new banner.");
            return;
        }
        addBanner(newBanner);
        setNewBanner({ title: '', link: '', buttonText: '', linkText: '' });
        setIsAdding(false);
    };

    const handleDeleteClick = (bannerId) => {
        setBannerToDelete(bannerId);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (bannerToDelete) {
            deleteBanner(bannerToDelete);
        }
        setShowDeleteModal(false);
        setBannerToDelete(null);
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setBannerToDelete(null);
    };

    const handleEditClick = (banner) => {
        setEditingBanner(banner);
    }

    const handleSaveBanner = (updatedBanner) => {
        updateBanner(updatedBanner);
        setEditingBanner(null);
    }
    
    return (
        <>
            <div className="flex-1 min-h-screen flex flex-col justify-between bg-gray-50">
                <div className="w-full md:p-10 p-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800">Marketing & Adverts</h2>
                        <button
                            onClick={() => setIsAdding(!isAdding)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700"
                        >
                            <PlusCircle className="w-4 h-4" />
                            <span>{isAdding ? 'Cancel' : 'Add Banner'}</span>
                        </button>
                    </div>
                    {isAdding && (
                        <div className="bg-white p-6 rounded-lg shadow-md mb-8 max-w-4xl">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Create New Banner</h3>
                            <form onSubmit={handleAddBanner} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Banner Title</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Holiday Special"
                                            className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                            value={newBanner.title}
                                            onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                                        <input
                                            type="text"
                                            placeholder="/all-products"
                                            className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                            value={newBanner.link}
                                            onChange={(e) => setNewBanner({ ...newBanner, link: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Shop Now"
                                            className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                            value={newBanner.buttonText}
                                            onChange={(e) => setNewBanner({ ...newBanner, buttonText: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Link Text</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Learn More"
                                            className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                            value={newBanner.linkText}
                                            onChange={(e) => setNewBanner({ ...newBanner, linkText: e.target.value })}
                                        />
                                    </div>
                                </div>
                            
                                <div className="flex justify-end">
                                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
                                        Save Banner
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Current Banners</h3>
                        
                        {/* Mobile View */}
                        <div className="md:hidden space-y-4">
                            {banners.map((banner) => (
                                <div key={banner.id} className="border rounded-lg p-4">
                                    <Image src={banner.image} alt={banner.title} width={500} height={300} className="w-full h-auto rounded-md mb-3" />
                                    <h4 className="font-semibold text-gray-800">{banner.title}</h4>
                                    <p className="text-xs text-gray-500"><strong>Link:</strong> {banner.link}</p>
                                    <p className="text-xs text-gray-500"><strong>Button:</strong> {banner.buttonText}</p>
                                    <p className="text-xs text-gray-500"><strong>Link Text:</strong> {banner.linkText}</p>
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${banner.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {banner.status}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleEditClick(banner)} className="text-blue-500 hover:text-blue-700 p-1.5">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteClick(banner.id)} className="text-red-500 hover:text-red-700 p-1.5">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="min-w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Title</th>
                                        <th scope="col" className="px-6 py-3">Image</th>
                                        <th scope="col" className="px-6 py-3">Link</th>
                                        <th scope="col" className="px-6 py-3">Button Text</th>
                                        <th scope="col" className="px-6 py-3">Link Text</th>
                                        <th scope="col" className="px-6 py-3">Status</th>
                                        <th scope="col" className="px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {banners.map((banner) => (
                                        <tr key={banner.id} className="bg-white border-b">
                                            <td className="px-6 py-4 font-medium text-gray-900">{banner.title}</td>
                                            <td className="px-6 py-4"><Image src={banner.image} alt={banner.title} width={128} height={72} className="w-32 h-auto rounded"/></td>
                                            <td className="px-6 py-4">{banner.link}</td>
                                            <td className="px-6 py-4">{banner.buttonText}</td>
                                            <td className="px-6 py-4">{banner.linkText}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${banner.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {banner.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 flex items-center gap-2">
                                                <button onClick={() => handleEditClick(banner)} className="text-blue-500 hover:text-blue-700">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDeleteClick(banner.id)} className="text-red-500 hover:text-red-700">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
            {editingBanner && (
                <EditBannerModal 
                    banner={editingBanner}
                    onSave={handleSaveBanner}
                    onCancel={() => setEditingBanner(null)}
                />
            )}
            {showDeleteModal && (
                <DeleteConfirmationModal
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                />
            )}
        </>
    );
};

export default MarketingPage;
