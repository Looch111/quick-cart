'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAppContext } from '@/context/AppContext';
import toast from 'react-hot-toast';
import { User, Mail, Save, PlusCircle, Home, Phone, Edit } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import AvatarSelectionModal from '@/components/AvatarSelectionModal';
import Loading from '@/components/Loading';

const ManageAccount = () => {
    const { userData, setShowLogin, userAddresses, router, updateUserField } = useAppContext();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

    useEffect(() => {
        if (userData === null) {
           router.push('/');
           setShowLogin(true);
        } else if (userData) {
            setName(userData.name || '');
            setEmail(userData.email);
        }
    }, [userData, setShowLogin, router]);

    const handleSaveChanges = (e) => {
        e.preventDefault();
        
        if (name !== userData.name) {
            updateUserField('name', name);
            toast.success("Account details updated successfully!");
        }
    };

    const handleAvatarSave = (newAvatarUrl) => {
        if (!userData) return;
        updateUserField('photoURL', newAvatarUrl);
        setIsAvatarModalOpen(false);
        toast.success("Avatar updated!");
    };

    if (userData === undefined) {
        return (
            <>
                <Navbar />
                <Loading />
                <Footer />
            </>
        )
    }

    if (!userData) {
        return null;
    }

    return (
        <>
            <Navbar />
            <div className="flex flex-col items-center justify-center px-6 md:px-16 lg:px-32 min-h-screen pt-28 pb-16">
                <div className="w-full max-w-4xl">
                    <div className="flex flex-col items-start mb-10">
                        <h1 className="text-3xl font-bold text-gray-800">Manage Account</h1>
                        <p className="text-gray-500 mt-1">Update your profile, account details, and addresses.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-white p-8 rounded-lg shadow-md border border-gray-200">
                            <form onSubmit={handleSaveChanges} className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                            {userData.photoURL ? (
                                                <Image src={userData.photoURL} alt={userData.name || 'User Avatar'} width={80} height={80} className="object-cover" />
                                            ) : userData.name ? (
                                                <span className="text-3xl font-medium text-gray-600">{userData.name[0].toUpperCase()}</span>
                                            ) : userData.email ? (
                                                <span className="text-3xl font-medium text-gray-600">{userData.email[0].toUpperCase()}</span>
                                            ) : (
                                                <User className="w-10 h-10 text-gray-500" />
                                            )}
                                        </div>
                                         <button type="button" onClick={() => setIsAvatarModalOpen(true)} className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full border shadow-sm hover:bg-gray-100">
                                            <Edit className="w-4 h-4 text-orange-600" />
                                        </button>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-semibold text-gray-900">{name || ''}</h2>
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
                                            placeholder="Enter your full name"
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
                                            readOnly
                                            disabled
                                        />
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

                         <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Shipping Addresses</h3>
                                <div className="space-y-4">
                                    {userAddresses.length > 0 ? userAddresses.map(addr => (
                                        <div key={addr._id} className="border-b pb-4">
                                            <p className="font-semibold">{addr.fullName}</p>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                                <Home className="w-4 h-4 text-gray-400" />
                                                <span>{`${addr.area}, ${addr.city}, ${addr.state} ${addr.pincode}`}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                <span>{addr.phoneNumber}</span>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-gray-500">No saved addresses.</p>
                                    )}
                                </div>
                                <Link href="/add-address" className="mt-6 w-full inline-flex items-center justify-center gap-2 py-2 px-4 border border-dashed border-gray-400 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                    <PlusCircle className="w-4 h-4" />
                                    Add New Address
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
            {isAvatarModalOpen && (
                <AvatarSelectionModal
                    currentAvatar={userData.photoURL}
                    onSave={handleAvatarSave}
                    onCancel={() => setIsAvatarModalOpen(false)}
                />
            )}
        </>
    );
};

export default ManageAccount;
