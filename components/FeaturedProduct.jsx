
'use client';
import React, { useState, useEffect } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";

const FeaturedProduct = () => {
  const { router, products, currency } = useAppContext();
  const [featuredProduct, setFeaturedProduct] = useState(null);

  useEffect(() => {
    // Find a specific product to feature.
    // In a real app, this could be fetched from a 'featured' flag in the CMS
    const productToFeature = products.find(p => p.name.includes("Venu 2S Smartwatch"));
    if (productToFeature) {
        setFeaturedProduct(productToFeature);
    } else if (products.length > 0) {
        // Fallback to the first product if the specific one isn't found
        setFeaturedProduct(products[0]);
    }
  }, [products]);

  if (!featuredProduct) {
    return null; // Don't render anything if there's no product to feature
  }

  const { _id, name, description, image, offerPrice } = featuredProduct;

  return (
    <div className="mt-14 py-12">
      <div className="flex flex-col items-center text-center">
        <p className="text-3xl font-medium">Product of the Month</p>
        <div className="w-32 h-0.5 bg-orange-600 mt-2"></div>
        <p className="text-gray-500 mt-2">Check out this month's featured product, picked just for you.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-12 bg-gray-50 rounded-lg p-8">
        <div className="bg-white rounded-lg p-6 flex items-center justify-center aspect-square">
            <Image
                src={image[0]}
                alt={name}
                className="group-hover:brightness-75 transition duration-300 w-full h-auto object-contain max-h-80"
                width={400}
                height={400}
            />
        </div>
        <div className="flex flex-col items-start text-left">
            <h2 className="text-4xl font-bold text-gray-800">{name}</h2>
            <p className="text-gray-600 my-4 text-base leading-relaxed">
                {description}
            </p>
            <p className="text-3xl font-semibold text-orange-600 mb-6">{currency}{offerPrice}</p>
            <button 
              onClick={() => router.push(`/product/${_id}`)} 
              className="group flex items-center gap-2 bg-orange-600 px-8 py-3 rounded text-white font-semibold text-lg hover:bg-orange-700 transition"
            >
                Buy now 
                <Image className="group-hover:translate-x-1 transition h-4 w-4" src={assets.arrow_icon_white} alt="Arrow Icon" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProduct;
