'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAppContext } from '@/context/AppContext';
import toast from 'react-hot-toast';
import { User, Mail, Key, Save } from 'lucide-react';

const ManageAccount = () => {
    const { userData, setUserData, setShowLogin } = useAppContext();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        if (userData) {
            setName(userData.name);
            setEmail(userData.email);
        } else {
            setShowLogin(true);
        }
    }, [userData, setShowLogin]);

    const handleSaveChanges = (e) => {
        e.preventDefault();
        if (password && password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        // In a real app, you would send this to your backend
        const updatedUserData = { ...userData, name, email };
        setUserData(updatedUserData);
        toast.success("Account details updated successfully!");

        if (password) {
            // "Update" password
            setPassword('');
            setConfirmPassword('');
            toast.success("Password updated!");
        }
    };

    if (!userData) {
        return null; // Or a loading spinner, while redirecting to login
    }

    return (
        <>
            <Navbar />
            <div className="flex flex-col items-center justify-center px-6 md:px-16 lg:px-32 min-h-screen pt-28 pb-16">
                <div className="w-full max-w-2xl">
                    <div className="flex flex-col items-start mb-10">
                        <h1 className="text-3xl font-bold text-gray-800">Manage Account</h1>
                        <p className="text-gray-500 mt-1">Update your profile and account details.</p>
                    </div>

                    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                        <form onSubmit={handleSaveChanges} className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-3xl font-medium text-gray-600">{name?.[0]}</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-semibold text-gray-900">{name}</h2>
                                    <p className="text-sm text-gray-500">{email}</p>
                                </div>
                            </div>
                            
                            <hr />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                 <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md bg-gray-50"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                     <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Key className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="password"
                                            placeholder="Leave blank to keep current"
                                            className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                     <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Key className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="password"
                                            placeholder="Confirm new password"
                                            className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button type="submit" className="inline-flex items-center gap-2 justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700">
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ManageAccount;
