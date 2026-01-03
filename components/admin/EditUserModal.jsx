'use client';
import { useState, useEffect } from 'react';

const EditUserModal = ({ user, onSave, onCancel }) => {
    const [role, setRole] = useState(user?.role || 'buyer');

    useEffect(() => {
        if (user) {
            setRole(user.role);
        }
    }, [user]);

    if (!user) return null;

    const handleSave = () => {
        onSave({ ...user, role });
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 px-4">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg relative">
                <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800">Edit User</h1>
                    <p className="text-gray-500 mt-2 text-sm">Editing user: {user.name}</p>
                </div>
                <div className="mt-6 space-y-4">
                    <div>
                        <label htmlFor="role-select" className="block text-sm font-medium text-gray-700">Role</label>
                        <select
                            id="role-select"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
                        >
                            <option value="buyer">Buyer</option>
                            <option value="seller">Seller</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onCancel} type="button" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                        Cancel
                    </button>
                    <button onClick={handleSave} type="button" className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditUserModal;
