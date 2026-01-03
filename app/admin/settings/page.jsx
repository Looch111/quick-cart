'use client';
import { useState } from 'react';
import Footer from '@/components/admin/Footer';
import toast from 'react-hot-toast';

const SettingsPage = () => {
    const [commission, setCommission] = useState(15); // Default 15%
    const [shippingFee, setShippingFee] = useState(5); // Default $5 shipping fee

    const handleSaveSettings = (e) => {
        e.preventDefault();
        // In a real app, you would save this to your backend
        console.log("Saving settings:", { commission, shippingFee });
        toast.success("Settings saved successfully!");
    };

    return (
        <div className="flex-1 min-h-screen flex flex-col justify-between bg-gray-50">
            <div className="w-full md:p-10 p-4">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Platform Settings</h2>

                <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl">
                    <form onSubmit={handleSaveSettings}>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Financial</h3>
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="commission" className="block text-sm font-medium text-gray-700">
                                    Seller Commission Percentage
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <input
                                        type="number"
                                        name="commission"
                                        id="commission"
                                        className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                                        placeholder="0.00"
                                        value={commission}
                                        onChange={(e) => setCommission(e.target.value)}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">%</span>
                                    </div>
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    The percentage you earn from each sale made by a seller.
                                </p>
                            </div>
                            <div>
                                <label htmlFor="shipping-fee" className="block text-sm font-medium text-gray-700">
                                    Default Shipping Fee
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        name="shipping-fee"
                                        id="shipping-fee"
                                        className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                                        placeholder="0.00"
                                        value={shippingFee}
                                        onChange={(e) => setShippingFee(e.target.value)}
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    The default shipping fee applied to orders.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 border-t border-gray-200 pt-5">
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                >
                                    Save Settings
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default SettingsPage;
