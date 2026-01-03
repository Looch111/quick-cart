'use client'
import React from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "@/context/AppContext";

const FlashSales = () => {

  const { products, router } = useAppContext()

  // Filter for products with a discount of 20% or more
  const flashSaleProducts = products.filter(p => p.price > 0 && ((p.price - p.offerPrice) / p.price) >= 0.2).slice(0, 5);

  if (flashSaleProducts.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center pt-14">
        <div className="flex flex-col items-center mb-4">
            <p className="text-3xl font-medium">Flash <span className="font-medium text-orange-600">Sales</span></p>
            <div className="w-28 h-0.5 bg-orange-600 mt-2"></div>
        </div>
        <p className="text-gray-500 mb-8">Grab the best deals before they're gone!</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-col items-center gap-6 pb-14 w-full">
        {flashSaleProducts.map((product, index) => <ProductCard key={index} product={product} />)}
      </div>
      <button onClick={() => { router.push('/all-products') }} className="px-12 py-2.5 border rounded text-gray-500/70 hover:bg-slate-50/90 transition">
        View All Deals
      </button>
    </div>
  );
};

export default FlashSales;
