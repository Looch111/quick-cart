
'use client';
import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image';
import { assets } from '@/assets/assets';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const EditProductModal = ({ product, onSave, onCancel }) => {
    const { updateProduct } = useAppContext();
    const [productData, setProductData] = useState({ ...product });
    const [imageUrls, setImageUrls] = useState(['', '', '', '']);
    const [sizes, setSizes] = useState([{ size: '', stock: '' }]);
    const [hasSizes, setHasSizes] = useState(false);
    const [totalStock, setTotalStock] = useState('');

    useEffect(() => {
        const data = { ...product };
        if (data.flashSaleEndDate) {
            const d = new Date(data.flashSaleEndDate);
            data.flashSaleEndDate = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        } else {
            data.flashSaleEndDate = '';
        }
        if (data.image && Array.isArray(data.image)) {
            const urls = [...data.image];
            while (urls.length < 4) {
                urls.push('');
            }
            setImageUrls(urls.slice(0, 4));
        }

        if (data.sizes && typeof data.sizes === 'object' && Object.keys(data.sizes).length > 0) {
            setHasSizes(true);
            const sizeArray = Object.entries(data.sizes).map(([size, stock]) => ({ size, stock }));
            setSizes(sizeArray);
        } else {
            setHasSizes(false);
            setTotalStock(data.stock || '');
            setSizes([{ size: '', stock: '' }])
        }

        setProductData(data);
    }, [product]);

    if (!product) return null;

    const getImageUrl = (url) => {
        if (!url) return assets.upload_area;
        let correctedUrl = url;
        if (correctedUrl.includes('imgur.com') && !correctedUrl.includes('i.imgur.com')) {
            correctedUrl = correctedUrl.replace('imgur.com', 'i.imgur.com');
        }
        if (correctedUrl.startsWith('https://i.imgur.com/') && !/\.(png|jpg|jpeg|gif)$/.test(correctedUrl)) {
            return `${correctedUrl}.png`;
        }
        return correctedUrl;
    };

    const handleImageUrlChange = (index, value) => {
        const newImageUrls = [...imageUrls];
        newImageUrls[index] = value;
        setImageUrls(newImageUrls);
    };

    const handleSizeChange = (index, field, value) => {
        const newSizes = [...sizes];
        newSizes[index][field] = value;
        setSizes(newSizes);
    };

    const addSizeField = () => {
        setSizes([...sizes, { size: '', stock: '' }]);
    };

    const removeSizeField = (index) => {
        const newSizes = sizes.filter((_, i) => i !== index);
        setSizes(newSizes);
    };

    const handleSave = () => {
        const dataToSave = { ...productData };
        
        if (dataToSave.flashSaleEndDate && (!dataToSave.flashSalePrice || Number(dataToSave.flashSalePrice) <= 0)) {
            toast.error("Please set a Flash Sale Price if you set a Flash Sale End Date.");
            return;
        }

        dataToSave.price = Number(dataToSave.price) || 0;
        dataToSave.offerPrice = Number(dataToSave.offerPrice) || 0;
        dataToSave.flashSalePrice = Number(dataToSave.flashSalePrice) || null;
        
        let productSizes = {};
        let stock = 0;

        if (hasSizes) {
            sizes.forEach(s => {
                if (s.size && s.stock) {
                    productSizes[s.size.trim()] = Number(s.stock);
                    stock += Number(s.stock);
                }
            });
        } else {
            stock = Number(totalStock);
        }
        dataToSave.stock = stock;
        dataToSave.sizes = hasSizes ? productSizes : {};

        if (!dataToSave.flashSaleEndDate) {
            dataToSave.flashSaleEndDate = null;
        } else {
            dataToSave.flashSaleEndDate = new Date(dataToSave.flashSaleEndDate).toISOString();
        }
        dataToSave.image = imageUrls.map(url => getImageUrl(url)).filter(url => url !== assets.upload_area);
        
        updateProduct(dataToSave);
        onSave(dataToSave);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData(prev => ({ ...prev, [name]: value }));
    }

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 px-4">
            <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-lg relative max-h-[90vh] overflow-y-auto">
                <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Edit Product</h1>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Image URLs</label>
                        <div className="flex flex-col gap-3 mt-2">
                            {[...Array(4)].map((_, index) => (
                                <div key={index} className="flex items-center gap-3">
                                <Image
                                    className="w-24 h-24 object-contain border rounded bg-gray-100"
                                    src={getImageUrl(imageUrls[index])}
                                    alt={`Product image ${index + 1}`}
                                    width={100}
                                    height={100}
                                    onError={(e) => e.currentTarget.src = assets.upload_area.src}
                                />
                                <input
                                    type="text"
                                    placeholder={`Image URL ${index + 1}`}
                                    className="outline-none w-full md:py-2.5 py-2 px-3 rounded border border-gray-300"
                                    onChange={(e) => handleImageUrlChange(index, e.target.value)}
                                    value={imageUrls[index]}
                                />
                                </div>
                            ))}
                        </div>
                    </div>
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
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Information</label>
                        <input
                            type="text"
                            name="deliveryInfo"
                            placeholder="e.g., 2-3 business days"
                            className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={productData.deliveryInfo}
                            onChange={handleChange}
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className='space-y-4 border p-4 rounded-md'>
                            <h3 className='font-semibold text-lg'>Standard Pricing</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
                                <input
                                    type="number"
                                    name="price"
                                    className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    value={productData.price}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Standard Offer Price</label>
                                <input
                                    type="number"
                                    name="offerPrice"
                                    className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    value={productData.offerPrice}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                         <div className='space-y-4 border p-4 rounded-md'>
                            <h3 className='font-semibold text-lg'>Flash Sale Pricing</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Flash Sale Price</label>
                                <input
                                    type="number"
                                    name="flashSalePrice"
                                    className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    value={productData.flashSalePrice || ''}
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div className="flex items-center gap-4 pt-6">
                            <input type="checkbox" id="has-sizes-edit" checked={hasSizes} onChange={(e) => setHasSizes(e.target.checked)} className="h-4 w-4 rounded text-orange-600 focus:ring-orange-500" />
                            <label htmlFor="has-sizes-edit" className="text-sm font-medium">This product has multiple sizes</label>
                        </div>
                    </div>
                     <div>
                        {hasSizes ? (
                            <div className="space-y-2 border p-4 rounded-md">
                                <label className="text-sm font-medium text-gray-700">Sizes & Stock</label>
                                {sizes.map((s, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            placeholder="Size (e.g., M)"
                                            value={s.size}
                                            onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                                            className="outline-none w-full py-2 px-3 rounded border border-gray-300"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Stock"
                                            value={s.stock}
                                            onChange={(e) => handleSizeChange(index, 'stock', e.target.value)}
                                            className="outline-none w-full py-2 px-3 rounded border border-gray-300"
                                        />
                                        <button type="button" onClick={() => removeSizeField(index)} className="p-2 text-red-500">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={addSizeField} className="flex items-center gap-2 text-sm text-orange-600 font-medium mt-2">
                                    <Plus className="w-4 h-4" /> Add another size
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-gray-700" htmlFor="stock-quantity-edit">
                                    Total Stock Quantity
                                </label>
                                <input
                                    id="stock-quantity-edit"
                                    type="number"
                                    placeholder="0"
                                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-300"
                                    onChange={(e) => setTotalStock(e.target.value)}
                                    value={totalStock}
                                />
                            </div>
                        )}
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
