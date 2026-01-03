'use client';
import { useState } from 'react';
import Footer from '@/components/admin/Footer';
import toast from 'react-hot-toast';
import { PlusCircle, Trash2 } from 'lucide-react';

const PromotionsPage = () => {
    const [promotions, setPromotions] = useState([
        { id: 1, code: 'SUMMER20', type: 'percentage', value: 20, status: 'active' },
        { id: 2, code: 'FREESHIP', type: 'shipping', value: 0, status: 'active' },
        { id: 3, code: 'SAVE10', type: 'fixed', value: 10, status: 'expired' },
    ]);
    const [newPromo, setNewPromo] = useState({ code: '', type: 'percentage', value: '' });
    const [isAdding, setIsAdding] = useState(false);

    const handleAddPromotion = (e) => {
        e.preventDefault();
        if (!newPromo.code || !newPromo.value) {
            toast.error("Please fill out all fields for the new promotion.");
            return;
        }
        const newPromotion = {
            id: promotions.length + 1,
            ...newPromo,
            status: 'active'
        };
        setPromotions([...promotions, newPromotion]);
        setNewPromo({ code: '', type: 'percentage', value: '' });
        setIsAdding(false);
        toast.success("Promotion added successfully!");
    };

    const handleDeletePromotion = (id) => {
        setPromotions(promotions.filter(p => p.id !== id));
        toast.success("Promotion deleted.");
    }

    return (
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
                        <form onSubmit={handleAddPromotion} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                type="text"
                                placeholder="Promo Code (e.g., WINTER30)"
                                className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                value={newPromo.code}
                                onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                            />
                            <select
                                className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                value={newPromo.type}
                                onChange={(e) => setNewPromo({ ...newPromo, type: e.target.value })}
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount ($)</option>
                                <option value="shipping">Free Shipping</option>
                            </select>
                            <input
                                type="number"
                                placeholder="Value"
                                className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                value={newPromo.value}
                                onChange={(e) => setNewPromo({ ...newPromo, value: e.target.value })}
                                disabled={newPromo.type === 'shipping'}
                            />
                            <div className="md:col-span-3 flex justify-end">
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
                                    Save Promotion
                                </button>
                            </div>
                        </form>
                    </div>
                )}


                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Active Promotions</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Code</th>
                                    <th scope="col" className="px-6 py-3">Type</th>
                                    <th scope="col" className="px-6 py-3">Value</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {promotions.map((promo) => (
                                    <tr key={promo.id} className="bg-white border-b">
                                        <td className="px-6 py-4 font-medium text-gray-900">{promo.code}</td>
                                        <td className="px-6 py-4 capitalize">{promo.type}</td>
                                        <td className="px-6 py-4">
                                            {promo.type === 'percentage' ? `${promo.value}%` :
                                             promo.type === 'fixed' ? `$${promo.value}` : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${promo.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {promo.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => handleDeletePromotion(promo.id)} className="text-red-500 hover:text-red-700">
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
    );
};

export default PromotionsPage;