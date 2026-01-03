'use client'
import React, { useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";

const AddProduct = () => {

  const [imageUrls, setImageUrls] = useState(['', '', '', '']);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Earphone');
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [sizes, setSizes] = useState('');
  const [stock, setStock] = useState('');

  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = value;
    setImageUrls(newImageUrls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      <form onSubmit={handleSubmit} className="md:p-10 p-4 space-y-5 max-w-lg">
        <div>
          <p className="text-base font-medium">Product Image URLs</p>
          <div className="flex flex-col gap-3 mt-2">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Image
                  className="max-w-24 w-24 h-24 object-cover border rounded"
                  src={getImageUrl(imageUrls[index])}
                  alt={`Product image ${index + 1}`}
                  width={100}
                  height={100}
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
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setCategory(e.target.value)}
              defaultValue={category}
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
            <label className="text-base font-medium" htmlFor="product-price">
              Product Price
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
          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="offer-price">
              Offer Price
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
          ADD
        </button>
      </form>
      {/* <Footer /> */}
    </div>
  );
};

export default AddProduct;
