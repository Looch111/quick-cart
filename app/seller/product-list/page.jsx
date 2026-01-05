'use client'
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import { Edit, Trash2, CheckCircle, XCircle, Clock } from "lucide-react";
import EditProductModal from "@/components/admin/EditProductModal";
import toast from "react-hot-toast";
import DeleteConfirmationModal from "@/components/admin/DeleteConfirmationModal";

const StatusBadge = ({ status }) => {
    const statusMap = {
        approved: { icon: <CheckCircle className="w-3 h-3 text-green-600" />, text: 'Approved', bg: 'bg-green-100', text_color: 'text-green-800' },
        pending: { icon: <Clock className="w-3 h-3 text-yellow-600" />, text: 'Pending', bg: 'bg-yellow-100', text_color: 'text-yellow-800' },
        rejected: { icon: <XCircle className="w-3 h-3 text-red-600" />, text: 'Rejected', bg: 'bg-red-100', text_color: 'text-red-800' },
    };

    const currentStatus = statusMap[status] || { icon: null, text: 'Unknown', bg: 'bg-gray-100', text_color: 'text-gray-800' };

    return (
        <span className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${currentStatus.bg} ${currentStatus.text_color}`}>
            {currentStatus.icon}
            {currentStatus.text}
        </span>
    );
};

const ProductList = () => {

  const { router, allRawProducts, userData, deleteProduct, productsLoading, currency } = useAppContext()

  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sellerProducts, setSellerProducts] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    if (userData && !productsLoading) {
      setSellerProducts(allRawProducts.filter(p => p.userId === userData._id));
      setLoading(false);
    } else if (userData === null && !productsLoading) {
      setLoading(false);
    }
  }, [allRawProducts, userData, productsLoading])

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

  const filteredProducts = sellerProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      {loading ? <Loading /> : <div className="w-full md:p-10 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Your Products</h2>
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-4 pr-10 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm"
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
        <div className="overflow-x-auto rounded-md bg-white border border-gray-200 shadow-sm">
          <table className="min-w-full table-auto text-sm">
            <thead className="text-gray-700 bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Category</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Price</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              {filteredProducts.map((product, index) => (
                <tr key={index} className="border-t border-gray-200">
                  <td className="px-4 py-3 flex items-center gap-3">
                    <div className="bg-gray-100 rounded p-1 flex-shrink-0">
                      <Image
                        src={product.image[0]}
                        alt={product.name}
                        className="w-12 h-12 object-contain"
                        width={48}
                        height={48}
                      />
                    </div>
                    <span className="font-medium text-gray-800 truncate">{product.name}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">{product.category}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">{currency}{product.offerPrice}</td>
                  <td className="px-4 py-3 hidden md:table-cell">{product.stock > 0 ? product.stock : <span className="text-red-500">Out of Stock</span>}</td>
                  <td className="px-4 py-3">
                      <StatusBadge status={product.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                       <button onClick={() => handleEditClick(product)} className="text-blue-500 hover:text-blue-700 p-1.5 rounded-full hover:bg-blue-50">
                          <Edit className="w-4 h-4" />
                       </button>
                       <button onClick={() => handleDeleteClick(product._id)} className="text-red-500 hover:text-red-700 p-1.5 rounded-full hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                       </button>
                      <button onClick={() => router.push(`/product/${product._id}`)} className="p-1.5 text-gray-500 rounded-full hover:bg-gray-100">
                        <Image
                          className="h-4 w-4"
                          src={assets.redirect_icon}
                          alt="redirect_icon"
                        />
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
