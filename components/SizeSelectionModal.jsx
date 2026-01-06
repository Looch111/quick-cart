
'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Plus, Minus } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

const SizeSelectionModal = () => {
    const { isSizeModalOpen, closeSizeModal, productForSizeSelection, addMultipleToCart, currency } = useAppContext();
    const [quantities, setQuantities] = useState({});

    useEffect(() => {
        if (productForSizeSelection) {
            const initialQuantities = {};
            productForSizeSelection.sizes.forEach(size => {
                initialQuantities[size] = 0;
            });
            setQuantities(initialQuantities);
        }
    }, [productForSizeSelection]);

    if (!isSizeModalOpen || !productForSizeSelection) {
        return null;
    }

    const handleQuantityChange = (size, delta) => {
        const newQuantity = (quantities[size] || 0) + delta;
        if (newQuantity >= 0) {
            setQuantities(prev => ({ ...prev, [size]: newQuantity }));
        }
    };
    
    const handleAddToCart = () => {
        const itemsToAdd = [];
        for (const size in quantities) {
            if (quantities[size] > 0) {
                // We need a unique ID for each size variant of the product.
                // A common convention is to use `productId_size`.
                const itemId = `${productForSizeSelection._id}_${size}`;
                itemsToAdd.push({ id: itemId, quantity: quantities[size] });
            }
        }
        if (itemsToAdd.length > 0) {
            addMultipleToCart(itemsToAdd);
        }
        closeSizeModal();
    };

    const totalQuantity = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 px-4">
            <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg relative">
                <button onClick={closeSizeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X className="h-6 w-6" />
                </button>

                <div className="flex gap-4 items-start">
                    <div className="w-24 h-24 bg-gray-100 rounded-md flex-shrink-0">
                         <Image
                            src={productForSizeSelection.image[0]}
                            alt={productForSizeSelection.name}
                            width={96}
                            height={96}
                            className="object-contain w-full h-full"
                        />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{productForSizeSelection.name}</h2>
                        <p className="text-gray-500 text-sm mt-1">{productForSizeSelection.category}</p>
                        <p className="text-lg font-semibold text-orange-600 mt-2">{currency}{productForSizeSelection.offerPrice}</p>
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="text-base font-semibold text-gray-700 mb-3">Select Size & Quantity</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {productForSizeSelection.sizes.map(size => (
                            <div key={size} className="flex justify-between items-center p-3 border rounded-md">
                                <span className="font-medium text-gray-800">{size}</span>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => handleQuantityChange(size, -1)} className="p-1.5 border rounded-full hover:bg-gray-100">
                                        <Minus className="w-4 h-4 text-gray-600" />
                                    </button>
                                    <span className="w-8 text-center font-medium text-lg">{quantities[size] || 0}</span>
                                    <button onClick={() => handleQuantityChange(size, 1)} className="p-1.5 border rounded-full hover:bg-gray-100">
                                        <Plus className="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={closeSizeModal} type="button" className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                        Cancel
                    </button>
                    <button 
                        onClick={handleAddToCart} 
                        type="button" 
                        className="px-6 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md shadow-sm hover:bg-orange-700 disabled:bg-orange-300"
                        disabled={totalQuantity === 0}
                    >
                        Add to Cart ({totalQuantity})
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SizeSelectionModal;
