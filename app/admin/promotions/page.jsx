'use client';
import { useState } from 'react';
import Footer from '@/components/admin/Footer';
import toast from 'react-hot-toast';
import { PlusCircle, Trash2 } from 'lucide-react';
import DeleteConfirmationModal from '@/components/admin/DeleteConfirmationModal';
import { useAppContext } from '@/context/AppContext';

const Switch = ({ checked, onChange }) => {
    return (
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-orange-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
        </label>
    );
};

const PromotionsPage = () => {
    const { promotions, addPromotion, deletePromotion, updatePromotionStatus } = useAppContext();
    const [newPromo, setNewPromo] = useState({ code: '', type: 'percentage', value: '', expiryDate: '' });
    const [isAdding, setIsAdding] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [promoToDelete, setPromoToDelete] = useState(null);

    const handleAddPromotion = (e) => {
        e.preventDefault();
        if (!newPromo.code || !newPromo.value || !newPromo.expiryDate) {
            toast.error("Please fill out all fields for the new promotion.");
            return;
        }
        addPromotion(newPromo);
        setNewPromo({ code: '', type: 'percentage', value: '', expiryDate: '' });
        setIsAdding(false);
    };

    const handleDeleteClick = (promoId) => {
        setPromoToDelete(promoId);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (promoToDelete) {
            deletePromotion(promoToDelete);
        }
        setShowDeleteModal(false);
        setPromoToDelete(null);
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setPromoToDelete(null);
    };
    
    const getPromoValue = (promo) => {
        if (promo.type === 'percentage') return `${promo.value}%`;
        if (promo.type === 'fixed') return `₦${promo.value}`;
        if (promo.type === 'shipping') return 'Free Shipping';
        return 'N/A';
    }

    const handleStatusToggle = (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        updatePromotionStatus(id, newStatus);
    };

    return (
        <>
            <div className="flex-1 min-h-screen flex flex-col justify-between bg-gray-50">
                <div className="w-full md:p-10 p-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800">Promotions & Discounts</h2>
                        <button
                            onClick={() => setIsAdding(!isAdding)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700"
                        >
                            <PlusCircle className="w-4 h-4" />
                            <span>{isAdding ? 'Cancel' : 'Add Promotion'}</span>
                        </button>
                    </div>

                    {isAdding && (
                        <div className="bg-white p-6 rounded-lg shadow-md mb-8 max-w-4xl">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Create New Promotion</h3>
                            <form onSubmit={handleAddPromotion} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Promo Code</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., WINTER30"
                                        className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                        value={newPromo.code}
                                        onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                        value={newPromo.type}
                                        onChange={(e) => setNewPromo({ ...newPromo, type: e.target.value, value: e.target.value === 'shipping' ? 0 : '' })}
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (₦)</option>
                                        <option value="shipping">Free Shipping</option>
                                    </select>
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                                    <input
                                        type="number"
                                        placeholder="Value"
                                        className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                        value={newPromo.value}
                                        onChange={(e) => setNewPromo({ ...newPromo, value: e.target.value })}
                                        disabled={newPromo.type === 'shipping'}
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                    <input
                                        type="date"
                                        className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                        value={newPromo.expiryDate}
                                        onChange={(e) => setNewPromo({ ...newPromo, expiryDate: e.target.value })}
                                    />
                                </div>
                                <div className="lg:col-span-4 flex justify-end">
                                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
                                        Save Promotion
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}


                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Active Promotions</h3>

                        {/* Mobile View */}
                        <div className="md:hidden space-y-4">
                            {promotions.map((promo) => (
                                <div key={promo.id} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-lg text-gray-800 bg-gray-100 px-2 py-1 inline-block rounded">{promo.code}</h4>
                                            <p className="text-sm text-gray-600 mt-2"><span className="font-medium">Type:</span> {promo.type}</p>
                                            <p className="text-sm text-gray-600"><span className="font-medium">Value:</span> {getPromoValue(promo)}</p>
                                            <p className="text-sm text-gray-600"><span className="font-medium">Expires:</span> {new Date(promo.expiryDate).toLocaleDateString()}</p>
                                        </div>
                                        <button onClick={() => handleDeleteClick(promo.id)} className="text-red-500 hover:text-red-700 p-1.5">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="mt-3 pt-3 border-t flex justify-between items-center">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${promo.status === 'active' && new Date(promo.expiryDate) > new Date() ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {promo.status === 'active' && new Date(promo.expiryDate) > new Date() ? 'Active' : 'Inactive/Expired'}
                                        </span>
                                        <Switch checked={promo.status === 'active'} onChange={() => handleStatusToggle(promo.id, promo.status)} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="min-w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Code</th>
                                        <th scope="col" className="px-6 py-3">Type</th>
                                        <th scope="col" className="px-6 py-3">Value</th>
                                        <th scope="col" className="px-6 py-3">Expiry Date</th>
                                        <th scope="col" className="px-6 py-3">Status</th>
                                        <th scope="col" className="px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {promotions.map((promo) => (
                                        <tr key={promo.id} className="bg-white border-b">
                                            <td className="px-6 py-4 font-medium text-gray-900">{promo.code}</td>
                                            <td className="px-6 py-4 capitalize">{promo.type}</td>
                                            <td className="px-6 py-4">{getPromoValue(promo)}</td>
                                            <td className="px-6 py-4">{new Date(promo.expiryDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Switch checked={promo.status === 'active'} onChange={() => handleStatusToggle(promo.id, promo.status)} />
                                                     <span className={`text-xs font-medium ${promo.status === 'active' ? 'text-green-800' : 'text-gray-600'}`}>
                                                        {promo.status === 'active' ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button onClick={() => handleDeleteClick(promo.id)} className="text-red-500 hover:text-red-700">
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
            {showDeleteModal && (
                <DeleteConfirmationModal
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                />
            )}
        </>
    );
};

export default PromotionsPage;
