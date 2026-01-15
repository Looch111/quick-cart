
'use client'
import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { X } from "lucide-react";

const halls = ["Hall 1", "Hall 2", "Hall 3", "Hall 4", "Hall 5", "Hall 6", "Hall 7", "Hall 8"];

const AddAddressModal = () => {
    const { userData, addAddress, isAddressModalOpen, closeAddressModal, updateUserField } = useAppContext();

    const [address, setAddress] = useState({
        fullName: '',
        phoneNumber: '',
        hall: halls[0],
        roomNumber: '',
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isAddressModalOpen && userData) {
            setAddress(prev => ({ 
                ...prev, 
                fullName: userData.name || '',
                phoneNumber: '',
                hall: halls[0],
                roomNumber: '',
            }));
        }
    }, [isAddressModalOpen, userData]);

    if (!isAddressModalOpen) {
        return null;
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAddress(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        // If user's name doesn't exist, update it in the profile
        if (!userData.name && address.fullName) {
            await updateUserField('name', address.fullName);
        }

        await addAddress(address);
        setIsSaving(false);
        // Reset form for next time
        setAddress({
            fullName: '',
            phoneNumber: '',
            hall: halls[0],
            roomNumber: '',
        });
    };

    const isNameSet = userData && userData.name;

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 px-4">
            <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg relative">
                <button onClick={closeAddressModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X className="h-6 w-6" />
                </button>
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Add Delivery Address</h1>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            className="px-3 py-2.5 focus:border-orange-500 transition border border-gray-300 rounded-md outline-none w-full text-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            type="text"
                            name="fullName"
                            placeholder="Full name"
                            onChange={handleInputChange}
                            value={address.fullName}
                            required
                            disabled={isNameSet}
                        />
                        <input
                            className="px-3 py-2.5 focus:border-orange-500 transition border border-gray-300 rounded-md outline-none w-full text-gray-700"
                            type="tel"
                            name="phoneNumber"
                            placeholder="Phone number"
                            onChange={handleInputChange}
                            value={address.phoneNumber}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select
                            name="hall"
                            value={address.hall}
                            onChange={handleInputChange}
                            className="px-3 py-2.5 focus:border-orange-500 transition border border-gray-300 rounded-md outline-none w-full text-gray-700"
                            required
                        >
                            {halls.map(hall => (
                                <option key={hall} value={hall}>{hall}</option>
                            ))}
                        </select>
                        <input
                            className="px-3 py-2.5 focus:border-orange-500 transition border border-gray-300 rounded-md outline-none w-full text-gray-700"
                            type="text"
                            name="roomNumber"
                            placeholder="Room number"
                            onChange={handleInputChange}
                            value={address.roomNumber}
                            required
                        />
                    </div>
                     <div className="mt-6 flex justify-end gap-3">
                        <button onClick={closeAddressModal} type="button" className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit" className="px-6 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md shadow-sm hover:bg-orange-700 disabled:bg-orange-300" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Address'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAddressModal;

    