
'use client';
import { useState, useEffect } from 'react';
import Footer from '@/components/admin/Footer';
import toast from 'react-hot-toast';
import { useAppContext } from '@/context/AppContext';
import Loading from '@/components/Loading';
import { useDoc } from '@/src/firebase';

const SettingsPage = () => {
    const { updateSettings, currency } = useAppContext();
    const { data: platformSettingsData, loading: settingsLoading } = useDoc('settings', 'platform');
    
    const [commission, setCommission] = useState(0);
    const [shippingFee, setShippingFee] = useState(0);
    const [freeShippingThreshold, setFreeShippingThreshold] = useState(0);
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');

    useEffect(() => {
        if (platformSettingsData) {
            setCommission(platformSettingsData.commission || 0);
            setShippingFee(platformSettingsData.shippingFee || 0);
            setFreeShippingThreshold(platformSettingsData.freeShippingThreshold || 0);
            setContactEmail(platformSettingsData.contactEmail || '');
            setContactPhone(platformSettingsData.contactPhone || '');
        }
    }, [platformSettingsData]);

    const handleSaveSettings = (e) => {
        e.preventDefault();
        const newSettings = {
            commission: Number(commission),
            shippingFee: Number(shippingFee),
            freeShippingThreshold: Number(freeShippingThreshold),
            contactEmail: contactEmail,
            contactPhone: contactPhone,
        };
        updateSettings(newSettings);
    };

    if (settingsLoading) {
        return <Loading />
    }

    return (
        <div className="flex-1 min-h-screen flex flex-col justify-between bg-gray-50">
            <div className="w-full md:p-10 p-4">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Platform Settings</h2>

                <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl">
                    <form onSubmit={handleSaveSettings}>
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-700">Financial</h3>
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
                                        <span className="text-gray-500 sm:text-sm">{currency}</span>
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
                            <div>
                                <label htmlFor="free-shipping-threshold" className="block text-sm font-medium text-gray-700">
                                    Free Shipping Threshold
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">{currency}</span>
                                    </div>
                                    <input
                                        type="number"
                                        name="free-shipping-threshold"
                                        id="free-shipping-threshold"
                                        className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                                        placeholder="0.00"
                                        value={freeShippingThreshold}
                                        onChange={(e) => setFreeShippingThreshold(e.target.value)}
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    The minimum order amount to qualify for free shipping.
                                </p>
                            </div>

                             <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-700">Contact Information</h3>
                                <div>
                                    <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mt-4">
                                        Contact Phone
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            name="contact-phone"
                                            id="contact-phone"
                                            className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                            placeholder="+1-234-567-890"
                                            value={contactPhone}
                                            onChange={(e) => setContactPhone(e.target.value)}
                                        />
                                    </div>
                                </div>
                                 <div>
                                    <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mt-4">
                                        Contact Email
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="email"
                                            name="contact-email"
                                            id="contact-email"
                                            className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                            placeholder="contact@example.com"
                                            value={contactEmail}
                                            onChange={(e) => setContactEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
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
