
'use client'
import React from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "@/context/AppContext";

const FlashSales = () => {
    const { products, router, userData } = useAppContext();

    const flashSaleProducts = products
        .filter(p => p.flashSalePrice > 0 && p.flashSaleEndDate && new Date(p.flashSaleEndDate) > new Date())
        .slice(0, 5);

    if (flashSaleProducts.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col items-center pt-14">
            <div className="w-full flex justify-between items-end mb-4">
                <div className="flex flex-col items-start">
                    <p className="text-3xl font-medium">Flash <span className="font-medium text-orange-600">Sales</span></p>
                    <div className="w-28 h-0.5 bg-orange-600 mt-2"></div>
                    <p className="text-gray-500 mt-4 mb-2">Grab the best deals before they're gone!</p>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-col items-center gap-6 pb-14 w-full">
                {flashSaleProducts.map((product, index) => <ProductCard key={index} product={product} />)}
            </div>
            <div className="flex items-center gap-4">
                <button onClick={() => { router.push('/all-products') }} className="px-6 md:px-12 py-2.5 border rounded text-gray-500/70 hover:bg-slate-50/90 transition">
                    View All Deals
                </button>
                {userData?.role === 'admin' && (
                    <button onClick={() => router.push('/admin/promotions')} className="px-6 md:px-12 py-2.5 border rounded text-white bg-orange-600 hover:bg-orange-700 transition">
                        Manage Promotions
                    </button>
                )}
            </div>
        </div>
    );
};

export default FlashSales;

    