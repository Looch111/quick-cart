'use client';
import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';

const EditProductModal = ({ product, onSave, onCancel }) => {
    const { updateProduct } = useAppContext();
    const [productData, setProductData] = useState({ ...product });

    useEffect(() => {
        const data = { ...product };
        if (data.sizes && Array.isArray(data.sizes)) {
            data.sizes = data.sizes.join(', ');
        }
        if (data.flashSaleEndDate) {
            // Format for datetime-local input
            const d = new Date(data.flashSaleEndDate);
            data.flashSaleEndDate = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        } else {
            data.flashSaleEndDate = '';
        }
        setProductData(data);
    }, [product]);

    if (!product) return null;

    const handleSave = () => {
        const dataToSave = { ...productData };
        if (typeof dataToSave.sizes === 'string') {
            dataToSave.sizes = dataToSave.sizes.split(',').map(s => s.trim()).filter(s => s);
        }
        if (!dataToSave.flashSaleEndDate) {
            dataToSave.flashSaleEndDate = null;
        }
        updateProduct(dataToSave);
        onSave(dataToSave);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData(prev => ({ ...prev, [name]: value }));
    }

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 px-4">
            <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg relative max-h-[90vh] overflow-y-auto">
                <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Edit Product</h1>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                        <input
                            type="text"
                            name="name"
                            className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={productData.name}
                            onChange={handleChange}
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            rows={4}
                            className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={productData.description}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                name="category"
                                className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                value={productData.category}
                                onChange={handleChange}
                            >
                                <option value="Earphone">Earphone</option>
                                <option value="Headphone">Headphone</option>
                                <option value="Watch">Watch</option>
                                <option value="Smartphone">Smartphone</option>
                                <option value="Laptop">Laptop</option>
                                <option value="Camera">Camera</option>
                                <option value="Accessories">Accessories</option>
                                <option value="Clothes">Clothes</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                            <input
                                type="number"
                                name="price"
                                className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                value={productData.price}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Offer Price</label>
                            <input
                                type="number"
                                name="offerPrice"
                                className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                value={productData.offerPrice}
                                onChange={handleChange}
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                            <input
                                type="number"
                                name="stock"
                                className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                value={productData.stock}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sizes (comma-separated)</label>
                        <input
                            type="text"
                            name="sizes"
                            placeholder="e.g. S, M, L, XL"
                            className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={productData.sizes}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Flash Sale End Date</label>
                        <input
                            type="datetime-local"
                            name="flashSaleEndDate"
                            className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={productData.flashSaleEndDate || ''}
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onCancel} type="button" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                        Cancel
                    </button>
                    <button onClick={handleSave} type="button" className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md shadow-sm hover:bg-orange-700">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProductModal;

    