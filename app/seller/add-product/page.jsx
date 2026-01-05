'use client'
import React, { useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";

const AddProduct = () => {

  const { addProduct, isAdmin } = useAppContext()

  const [imageUrls, setImageUrls] = useState(['', '', '', '']);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Earphone');
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [flashSalePrice, setFlashSalePrice] = useState('');
  const [sizes, setSizes] = useState('');
  const [stock, setStock] = useState('');
  const [flashSaleEndDate, setFlashSaleEndDate] = useState('');

  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = value;
    setImageUrls(newImageUrls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const productData = {
        name,
        description,
        category,
        price: Number(price),
        offerPrice: Number(offerPrice),
        flashSalePrice: Number(flashSalePrice) || null,
        image: imageUrls.filter(url => url).map(url => getImageUrl(url)),
        stock: Number(stock),
        sizes: sizes.split(',').map(s => s.trim()).filter(s => s),
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
    setSizes('');
    setStock('');
    setFlashSaleEndDate('');
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

        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex flex-col gap-1 w-40">
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
          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="stock-quantity">
              Stock Quantity
            </label>
            <input
              id="stock-quantity"
              type="number"
              placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setStock(e.target.value)}
              value={stock}
              required
            />
          </div>
        </div>
         <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="product-sizes">
            Sizes (comma-separated)
          </label>
          <input
            id="product-sizes"
            type="text"
            placeholder="e.g. S, M, L, XL"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            onChange={(e) => setSizes(e.target.value)}
            value={sizes}
          />
        </div>
        <button type="submit" className="px-8 py-2.5 bg-orange-600 text-white font-medium rounded">
          {isAdmin ? 'Add & Approve Product' : 'Submit for Approval'}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
