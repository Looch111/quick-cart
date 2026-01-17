
'use client'
import React, { useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";
import { Plus, Trash2, UploadCloud } from "lucide-react";

const AddProduct = () => {

  const { addProduct, isAdmin } = useAppContext()

  const [images, setImages] = useState(Array(4).fill(null));
  const [imagePreviews, setImagePreviews] = useState(Array(4).fill(null));
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Earphone');
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [flashSalePrice, setFlashSalePrice] = useState('');
  const [sizes, setSizes] = useState([{ size: '', stock: '' }]);
  const [flashSaleEndDate, setFlashSaleEndDate] = useState('');
  const [hasSizes, setHasSizes] = useState(false);
  const [totalStock, setTotalStock] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState('');

  const handleImageChange = (index, file) => {
    if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error("File is too large. Max size is 5MB.");
            return;
        }
        const newImages = [...images];
        newImages[index] = file;
        setImages(newImages);

        const newPreviews = [...imagePreviews];
        newPreviews[index] = URL.createObjectURL(file);
        setImagePreviews(newPreviews);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);

    const newPreviews = [...imagePreviews];
    if (newPreviews[index] && newPreviews[index].startsWith('blob:')) {
        URL.revokeObjectURL(newPreviews[index]);
    }
    newPreviews[index] = null;
    setImagePreviews(newPreviews);
  }

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Number(price) > 0 && Number(price) <= Number(offerPrice)) {
        toast.error("The Original Price must be higher than the Selling Price to show a discount.");
        return;
    }
    
    let productSizes = {};
    let stock = 0;

    if (hasSizes) {
        sizes.forEach(s => {
            if (s.size && s.stock) {
                productSizes[s.size.trim()] = Number(s.stock);
                stock += Number(s.stock);
            }
        });
        if (Object.keys(productSizes).length === 0) {
          toast.error("Please add at least one size with stock.");
          return;
        }
    } else {
        stock = Number(totalStock);
        if(stock <= 0) {
          toast.error("Please enter a valid stock quantity.");
          return;
        }
    }

    if (flashSaleEndDate && (!flashSalePrice || Number(flashSalePrice) <= 0)) {
        toast.error("Please set a Flash Sale Price if you set a Flash Sale End Date.");
        return;
    }
    
    const imageFiles = images.filter(img => img !== null);

    if(imageFiles.length === 0) {
        toast.error("Please provide at least one image.");
        return;
    }

    const productData = {
        name,
        description,
        category,
        price: Number(price),
        offerPrice: Number(offerPrice),
        flashSalePrice: Number(flashSalePrice) || null,
        image: imageFiles,
        stock: stock,
        sizes: productSizes,
        flashSaleEndDate: flashSaleEndDate || null,
        deliveryInfo: deliveryInfo,
        reviewCount: 0,
        averageRating: 0
    }

    await addProduct(productData);

    // Reset form
    setImages(Array(4).fill(null));
    setImagePreviews(Array(4).fill(null));
    setName('');
    setDescription('');
    setCategory('Earphone');
    setPrice('');
    setOfferPrice('');
    setFlashSalePrice('');
    setSizes([{ size: '', stock: '' }]);
    setTotalStock('');
    setFlashSaleEndDate('');
    setHasSizes(false);
    setDeliveryInfo('');
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      <form onSubmit={handleSubmit} className="md:p-10 p-4 space-y-5 max-w-4xl">
        <div>
          <p className="text-base font-medium">Upload Product Images</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="relative aspect-square border-2 border-dashed rounded-lg flex items-center justify-center text-gray-400">
                {imagePreviews[index] ? (
                    <>
                        <Image
                            src={imagePreviews[index]}
                            alt={`Preview ${index + 1}`}
                            fill
                            className="object-contain rounded-lg p-2"
                        />
                         <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full z-10">
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </>
                ) : (
                    <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
                        <UploadCloud className="w-8 h-8" />
                        <span className="text-xs mt-2 text-center">Click to upload</span>
                        <input
                            type="file"
                            className="hidden"
                            accept="image/png, image/jpeg, image/gif"
                            onChange={(e) => handleImageChange(index, e.target.files[0])}
                        />
                    </label>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="product-name">
            Product Name
          </label>
          <input
            id="product-name"
            type="text"
            placeholder="Type here"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-300"
            onChange={(e) => setName(e.target.value)}
            value={name}
            required
          />
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label
            className="text-base font-medium"
            htmlFor="product-description"
          >
            Product Description
          </label>
          <textarea
            id="product-description"
            rows={4}
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-300 resize-none"
            placeholder="Type here"
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            required
          ></textarea>
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="delivery-info">
            Delivery Information
          </label>
          <input
            id="delivery-info"
            type="text"
            placeholder="e.g., 2-3 business days"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-300"
            onChange={(e) => setDeliveryInfo(e.target.value)}
            value={deliveryInfo}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pricing */}
            <div className='space-y-4 border p-4 rounded-md'>
                <h3 className='font-semibold text-lg'>Pricing</h3>
                <div className="flex flex-col gap-1 w-full">
                    <label className="text-base font-medium" htmlFor="product-price">
                    Original Price <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input
                    id="product-price"
                    type="number"
                    placeholder="e.g., 100"
                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-300"
                    onChange={(e) => setPrice(e.target.value)}
                    value={price}
                    />
                </div>
                <div className="flex flex-col gap-1 w-full">
                    <label className="text-base font-medium" htmlFor="offer-price">
                    Selling Price
                    </label>
                    <input
                    id="offer-price"
                    type="number"
                    placeholder="e.g., 80"
                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-300"
                    onChange={(e) => setOfferPrice(e.target.value)}
                    value={offerPrice}
                    required
                    />
                </div>
            </div>

            {/* Flash Sale Pricing */}
            <div className='space-y-4 border p-4 rounded-md'>
                <h3 className='font-semibold text-lg'>Flash Sale (Optional)</h3>
                <div className="flex flex-col gap-1 w-full">
                    <label className="text-base font-medium" htmlFor="flash-sale-price">
                    Flash Sale Price
                    </label>
                    <input
                    id="flash-sale-price"
                    type="number"
                    placeholder="0"
                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-300"
                    onChange={(e) => setFlashSalePrice(e.target.value)}
                    value={flashSalePrice}
                    />
                </div>
                <div className="flex flex-col gap-1 w-full">
                    <label className="text-base font-medium" htmlFor="flash-sale-date">
                    Flash Sale End Date
                    </label>
                    <input
                    id="flash-sale-date"
                    type="datetime-local"
                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-300"
                    onChange={(e) => setFlashSaleEndDate(e.target.value)}
                    value={flashSaleEndDate}
                    />
                </div>
            </div>
        </div>

         <div className="max-w-md">
            <div className="flex flex-col gap-1 mb-4">
              <label className="text-base font-medium" htmlFor="category">
                Category
              </label>
              <select
                id="category"
                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-300"
                onChange={(e) => setCategory(e.target.value)}
                value={category}
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
            
            <div className="flex items-center gap-4 mb-4">
                <input type="checkbox" id="has-sizes" checked={hasSizes} onChange={(e) => setHasSizes(e.target.checked)} className="h-4 w-4 rounded text-orange-600 focus:ring-orange-500" />
                <label htmlFor="has-sizes" className="text-base font-medium">This product has multiple sizes</label>
            </div>

            {hasSizes ? (
                <div className="space-y-2 border p-4 rounded-md">
                    <label className="text-base font-medium">Sizes & Stock</label>
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
                    <label className="text-base font-medium" htmlFor="stock-quantity">
                        Total Stock Quantity
                    </label>
                    <input
                        id="stock-quantity"
                        type="number"
                        placeholder="0"
                        className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-300"
                        onChange={(e) => setTotalStock(e.target.value)}
                        value={totalStock}
                        required
                    />
                </div>
            )}
        </div>

        <button type="submit" className="px-8 py-2.5 bg-orange-600 text-white font-medium rounded">
          {isAdmin ? 'Add & Approve Product' : 'Submit for Approval'}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
