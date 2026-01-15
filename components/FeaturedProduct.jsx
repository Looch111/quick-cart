
'use client';
import React, { useState, useEffect, useMemo } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import { useCollection } from "@/src/firebase";

const FeaturedProduct = () => {
  const { router, currency } = useAppContext();
  const { data: productsData, loading } = useCollection('products', { where: ['status', '==', 'approved'] });

  const featuredProduct = useMemo(() => {
    if (!productsData || productsData.length === 0) return null;
    
    // Find a specific product to feature.
    // In a real app, this could be fetched from a 'featured' flag in the CMS
    let productToFeature = productsData.find(p => p.name.includes("Venu 2S Smartwatch"));
    if (!productToFeature) {
        // Fallback to the first product if the specific one isn't found
        productToFeature = productsData[0];
    }
    return { ...productToFeature, _id: productToFeature.id };
  }, [productsData]);

  if (loading || !featuredProduct) {
    return null; // Don't render anything if there's no product to feature or still loading
  }

  const { _id, name, description, image, offerPrice } = featuredProduct;

  return (
    <div className="mt-14 py-12">
      <div className="flex flex-col items-center text-center">
        <p className="text-3xl font-medium">Product of the Month</p>
        <div className="w-32 h-0.5 bg-orange-600 mt-2"></div>
        <p className="text-gray-500 mt-2">Check out this month's featured product, picked just for you.</p>
      </div>

      <div className="grid grid-cols-5 md:grid-cols-2 gap-4 md:gap-8 items-center mt-12 bg-gray-50 rounded-lg p-4 md:p-8">
        <div className="col-span-2 md:col-span-1 bg-white rounded-lg p-2 md:p-6 flex items-center justify-center aspect-square">
            <Image
                src={image[0]}
                alt={name}
                className="group-hover:brightness-75 transition duration-300 w-full h-auto object-contain md:max-h-80"
                width={400}
                height={400}
            />
        </div>
        <div className="col-span-3 md:col-span-1 flex flex-col items-start text-left">
            <h2 className="text-xl md:text-4xl font-bold text-gray-800">{name}</h2>
            <p className="text-gray-600 my-2 md:my-4 text-xs md:text-base leading-relaxed line-clamp-3 md:line-clamp-none">
                {description}
            </p>
            <p className="text-2xl md:text-3xl font-semibold text-orange-600 mb-3 md:mb-6">{currency}{offerPrice}</p>
            <button 
              onClick={() => router.push(`/product/${_id}`)} 
              className="group flex items-center gap-2 bg-orange-600 px-4 py-2 md:px-8 md:py-3 rounded text-white font-semibold text-sm md:text-lg hover:bg-orange-700 transition"
            >
                Buy now 
                <Image className="group-hover:translate-x-1 transition h-3 w-3 md:h-4 md:w-4" src={assets.arrow_icon_white} alt="Arrow Icon" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProduct;
