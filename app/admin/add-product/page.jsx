'use client'
import React, { useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";

const AddProduct = () => {

  const { addProduct } = useAppContext()

  const [imageUrls, setImageUrls] = useState(['', '', '', '']);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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

    const productData = {
        name,
        description,
        category,
        price: Number(price),
        offerPrice: Number(offerPrice),
        flashSalePrice: Number(flashSalePrice) || null,
        image: imageUrls.filter(url => url).map(url => getImageUrl(url)),
        stock: stock,
        sizes: productSizes,
        flashSaleEndDate: flashSaleEndDate || null,
    }

    if(productData.image.length === 0) {
        toast.error("Please provide at least one image URL.");
        return;
    }

    addProduct(productData);

    // Reset form
    setImageUrls(['', '', '', '']);
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
  };
  
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

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      <form onSubmit={handleSubmit} className="md:p-10 p-4 space-y-5 max-w-4xl">
        <div>
          <p className="text-base font-medium">Product Image URLs</p>
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
                  className="outline-none w-full md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                  onChange={(e) => handleImageUrlChange(index, e.target.value)}
                  value={imageUrls[index]}
                />
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
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
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
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
            placeholder="Type here"
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            required
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Standard Pricing */}
            <div className='space-y-4 border p-4 rounded-md'>
                <h3 className='font-semibold text-lg'>Standard Pricing</h3>
                <div className="flex flex-col gap-1 w-full">
                    <label className="text-base font-medium" htmlFor="product-price">
                    Original Price
                    </label>
                    <input
                    id="product-price"
                    type="number"
                    placeholder="0"
                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                    onChange={(e) => setPrice(e.target.value)}
                    value={price}
                    required
                    />
                </div>
                <div className="flex flex-col gap-1 w-full">
                    <label className="text-base font-medium" htmlFor="offer-price">
                    Standard Offer Price
                    </label>
                    <input
                    id="offer-price"
                    type="number"
                    placeholder="0"
                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
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
                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
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
                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
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
                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
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
                                className="outline-none w-full py-2 px-3 rounded border border-gray-500/40"
                            />
                            <input
                                type="number"
                                placeholder="Stock"
                                value={s.stock}
                                onChange={(e) => handleSizeChange(index, 'stock', e.target.value)}
                                className="outline-none w-full py-2 px-3 rounded border border-gray-500/40"
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
                        className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                        onChange={(e) => setTotalStock(e.target.value)}
                        value={totalStock}
                        required
                    />
                </div>
            )}
        </div>

        <button type="submit" className="px-8 py-2.5 bg-orange-600 text-white font-medium rounded">
          ADD
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
