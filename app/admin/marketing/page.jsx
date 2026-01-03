'use client';
import { useState } from 'react';
import { useAppContext } from "@/context/AppContext";
import toast from 'react-hot-toast';
import { PlusCircle, Trash2, Upload } from 'lucide-react';
import Footer from "@/components/admin/Footer";

const MarketingPage = () => {
    const { banners, addBanner, deleteBanner } = useAppContext();
    const [isAdding, setIsAdding] = useState(false);
    const [newBanner, setNewBanner] = useState({ title: '', image: null, link: '' });

    const handleAddBanner = (e) => {
        e.preventDefault();
        if (!newBanner.title || !newBanner.image || !newBanner.link) {
            toast.error("Please fill out all fields for the new banner.");
            return;
        }
        addBanner(newBanner);
        setNewBanner({ title: '', image: null, link: '' });
        setIsAdding(false);
    };

    const handleDeleteBanner = (id) => {
        deleteBanner(id);
    }
    
    return (
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                         <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600">
                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500">
                                                <span>Upload a file</span>
                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => setNewBanner({...newBanner, image: e.target.files[0]})} accept="image/*"/>
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        {newBanner.image ? <p className="text-xs text-gray-500">{newBanner.image.name}</p> : <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>}
                                    </div>
                                </div>
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
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Title</th>
                                    <th scope="col" className="px-6 py-3">Image</th>
                                    <th scope="col" className="px-6 py-3">Link</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {banners.map((banner) => (
                                    <tr key={banner.id} className="bg-white border-b">
                                        <td className="px-6 py-4 font-medium text-gray-900">{banner.title}</td>
                                        <td className="px-6 py-4"><img src={banner.image} alt={banner.title} className="w-32 h-auto rounded"/></td>
                                        <td className="px-6 py-4">{banner.link}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${banner.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {banner.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => handleDeleteBanner(banner.id)} className="text-red-500 hover:text-red-700">
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

export default MarketingPage;
