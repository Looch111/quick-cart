'use client'
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/admin/Footer";
import Loading from "@/components/Loading";
import { Edit, Trash2 } from "lucide-react";
import EditProductModal from "@/components/admin/EditProductModal";
import toast from "react-hot-toast";

const ProductList = () => {

  const { router, products, deleteProduct, productsLoading } = useAppContext()

  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!productsLoading) {
      setLoading(false);
    }
  }, [productsLoading])

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
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Are you sure you want to delete this product?</p>
        <div className="flex gap-2">
          <button
            className="w-full px-3 py-1.5 bg-red-600 text-white rounded-md text-sm"
            onClick={() => {
              deleteProduct(productId);
              toast.dismiss(t.id);
            }}
          >
            Delete
          </button>
          <button
            className="w-full px-3 py-1.5 bg-gray-200 text-gray-800 rounded-md text-sm"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 6000,
    });
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      {loading ? <Loading /> : <div className="w-full md:p-10 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">All Products</h2>
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
        <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
          <table className=" table-auto w-full overflow-hidden">
            <thead className="text-gray-900 text-sm text-left">
              <tr>
                <th className="w-2/3 md:w-2/5 px-4 py-3 font-medium truncate">Product</th>
                <th className="px-4 py-3 font-medium truncate max-sm:hidden">Category</th>
                <th className="px-4 py-3 font-medium truncate">
                  Price
                </th>
                <th className="px-4 py-3 font-medium truncate max-sm:hidden">
                  Stock
                </th>
                <th className="px-4 py-3 font-medium truncate">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {filteredProducts.map((product, index) => (
                <tr key={index} className="border-t border-gray-500/20">
                  <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                    <div className="bg-gray-500/10 rounded p-2">
                      <Image
                        src={product.image[0]}
                        alt="product Image"
                        className="w-16"
                        width={1280}
                        height={720}
                      />
                    </div>
                    <span className="truncate w-full">
                      {product.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-sm:hidden">{product.category}</td>
                  <td className="px-4 py-3">${product.offerPrice}</td>
                  <td className="px-4 py-3 max-sm:hidden">{product.stock > 0 ? product.stock : <span className="text-red-500">Out of Stock</span>}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                       <button onClick={() => handleEditClick(product)} className="text-blue-500 hover:text-blue-700">
                          <Edit className="w-4 h-4" />
                       </button>
                       <button onClick={() => handleDeleteClick(product._id)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                       </button>
                      <button onClick={() => router.push(`/product/${product._id}`)} className="flex items-center gap-1 px-1.5 md:px-3.5 py-2 bg-orange-600 text-white rounded-md text-xs">
                        <span className="hidden md:block">Visit</span>
                        <Image
                          className="h-3.5"
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
    </div>
  );
};

export default ProductList;
