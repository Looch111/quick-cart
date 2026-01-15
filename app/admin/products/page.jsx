
'use client'
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/admin/Footer";
import Loading from "@/components/Loading";
import { Edit, Trash2, CheckCircle, XCircle, Clock, User } from "lucide-react";
import EditProductModal from "@/components/admin/EditProductModal";
import toast from "react-hot-toast";
import DeleteConfirmationModal from "@/components/admin/DeleteConfirmationModal";
import { useCollection } from "@/src/firebase";

const StatusBadge = ({ status }) => {
    const statusMap = {
        approved: { icon: <CheckCircle className="w-4 h-4 text-green-600" />, text: 'Approved', bg: 'bg-green-100', text_color: 'text-green-800' },
        pending: { icon: <Clock className="w-4 h-4 text-yellow-600" />, text: 'Pending', bg: 'bg-yellow-100', text_color: 'text-yellow-800' },
        rejected: { icon: <XCircle className="w-4 h-4 text-red-600" />, text: 'Rejected', bg: 'bg-red-100', text_color: 'text-red-800' },
    };

    const currentStatus = statusMap[status] || { icon: null, text: 'Unknown', bg: 'bg-gray-100', text_color: 'text-gray-800' };

    return (
        <span className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${currentStatus.bg} ${currentStatus.text_color}`}>
            {currentStatus.icon}
            {currentStatus.text}
        </span>
    );
};

const UserAvatar = ({ user, size = 'sm' }) => {
    const dimensions = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
    const textSize = size === 'sm' ? 'text-sm' : 'text-lg';
    const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';

    if (!user) {
        return (
            <div className={`${dimensions} rounded-full bg-gray-200 flex items-center justify-center overflow-hidden`}>
                <User className={`${iconSize} text-gray-500`} />
            </div>
        )
    }

    return (
        <div className={`${dimensions} rounded-full bg-gray-200 flex items-center justify-center overflow-hidden`}>
            {user.photoURL ? (
                <Image src={user.photoURL} alt={user.name || 'User Avatar'} width={size === 'sm' ? 32 : 40} height={size === 'sm' ? 32 : 40} className="object-cover" />
            ) : user.name ? (
                <span className={`${textSize} font-medium text-gray-600`}>{user.name[0].toUpperCase()}</span>
            ) : user.email ? (
                <span className={`${textSize} font-medium text-gray-600`}>{user.email[0].toUpperCase()}</span>
            ) : (
                <User className={`${iconSize} text-gray-500`} />
            )}
        </div>
    );
};


const ProductList = () => {
    const { router, deleteProduct, productsLoading, updateProductStatus, currency, allRawProducts } = useAppContext();
    const { data: usersData, loading: usersLoading } = useCollection('users');

    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    useEffect(() => {
        if (!productsLoading && !usersLoading) {
            setLoading(false);
        }
    }, [productsLoading, usersLoading]);

    const handleEditClick = (product) => {
        setEditingProduct(product);
    };

    const handleSaveProduct = (updatedProduct) => {
        setEditingProduct(null);
    };

    const handleCancelEdit = () => {
        setEditingProduct(null);
    };

    const handleDeleteClick = (productId) => {
        setProductToDelete(productId);
        setShowDeleteModal(true);
    }

    const confirmDelete = () => {
        if (productToDelete) {
            deleteProduct(productToDelete);
        }
        setShowDeleteModal(false);
        setProductToDelete(null);
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setProductToDelete(null);
    };

    const usersMap = new Map((usersData || []).map(user => [user.id, user]));

    const filteredProducts = (allRawProducts || [])
        .map(product => ({
            ...product,
            _id: product.id,
            poster: usersMap.get(product.userId)
        }))
        .filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.poster && product.poster.name && product.poster.name.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => {
            const statusOrder = { 'pending': 0, 'approved': 1, 'rejected': 2 };
            if (statusOrder[a.status] !== statusOrder[b.status]) {
                return statusOrder[a.status] - statusOrder[b.status];
            }
            return (b.date?.seconds || 0) - (a.date?.seconds || 0);
        });

    return (
        <div className="flex-1 min-h-screen flex flex-col justify-between">
            {loading ? <Loading /> : <div className="w-full md:p-10 p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium">All Products</h2>
                    <div className="relative max-w-xs w-full">
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Image
                            src={assets.search_icon}
                            alt="search icon"
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                        />
                    </div>
                </div>

                {/* Mobile View: Cards */}
                <div className="md:hidden space-y-4">
                    {filteredProducts.map(product => (
                        <div key={product._id} className="bg-white border rounded-lg p-4 shadow-sm">
                            <div className="flex gap-4">
                                <Image
                                    src={product.image[0]}
                                    alt={product.name}
                                    width={80}
                                    height={80}
                                    className="w-20 h-20 object-contain rounded-md bg-gray-100"
                                />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800">{product.name}</h3>
                                    <p className="text-xs text-gray-500">{product.category}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <p className="text-sm font-semibold text-orange-600">{currency}{product.offerPrice}</p>
                                        <p className="text-xs text-gray-400 line-through">{currency}{product.price}</p>
                                    </div>
                                    <div className="mt-1">
                                        <StatusBadge status={product.status} />
                                    </div>
                                </div>
                            </div>
                            <div className="border-t mt-3 pt-3 text-xs text-gray-500">
                                <p>Posted by: <span className="font-medium text-gray-700">{product.poster?.name || 'N/A'} ({product.poster?.role})</span></p>
                                <p>Date: <span className="font-medium text-gray-700">{new Date(product.date?.toDate()).toLocaleDateString()}</span></p>
                            </div>
                            <div className="flex justify-end items-center gap-2 mt-3 pt-3 border-t">
                                <select onChange={(e) => updateProductStatus(product._id, e.target.value)} value={product.status} className="text-xs border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500">
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                                <button onClick={() => handleEditClick(product)} className="text-blue-500 hover:text-blue-700 p-2">
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteClick(product._id)} className="text-red-500 hover:text-red-700 p-2">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block overflow-x-auto rounded-md bg-white border border-gray-500/20">
                    <table className="min-w-full table-auto">
                        <thead className="text-gray-900 text-sm text-left bg-gray-500/10">
                            <tr>
                                <th className="px-4 py-3 font-medium">Product</th>
                                <th className="px-4 py-3 font-medium">Posted By</th>
                                <th className="px-4 py-3 font-medium">Price</th>
                                <th className="px-4 py-3 font-medium">Stock</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-500">
                            {filteredProducts.map((product, index) => (
                                <tr key={index} className="border-t border-gray-500/20">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-gray-100 rounded p-2 flex-shrink-0">
                                                <Image
                                                    src={product.image[0]}
                                                    alt="product Image"
                                                    className="w-12 h-12 object-contain"
                                                    width={48}
                                                    height={48}
                                                />
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-800">{product.name}</span>
                                                <p className="text-xs text-gray-500">{product.category}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                       <div className="flex items-center gap-2">
                                            <UserAvatar user={product.poster} />
                                            <div>
                                                <p className="font-medium text-gray-800">{product.poster?.name || 'Unknown'}</p>
                                                <p className="text-xs capitalize">{product.poster?.role || 'N/A'}</p>
                                                <p className="text-xs">{new Date(product.date?.toDate()).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">{currency}{product.offerPrice}</td>
                                    <td className="px-4 py-3">{product.stock > 0 ? product.stock : <span className="text-red-500 font-medium">Out of Stock</span>}</td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={product.status} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <select onChange={(e) => updateProductStatus(product._id, e.target.value)} value={product.status} className="text-xs border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500">
                                                <option value="pending">Pending</option>
                                                <option value="approved">Approved</option>
                                                <option value="rejected">Rejected</option>
                                            </select>
                                            <button onClick={() => handleEditClick(product)} className="text-blue-500 hover:text-blue-700 p-2">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteClick(product._id)} className="text-red-500 hover:text-red-700 p-2">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>}
            <Footer />
            {editingProduct && (
                <EditProductModal
                    product={editingProduct}
                    onSave={handleSaveProduct}
                    onCancel={handleCancelEdit}
                />
            )}
            {showDeleteModal && (
                <DeleteConfirmationModal
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                />
            )}
        </div>
    );
};

export default ProductList;
