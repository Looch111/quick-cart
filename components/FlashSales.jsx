'use client'
import React, { useState, useEffect, useMemo } from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "@/context/AppContext";
import { useCollection } from "@/src/firebase";

const FlashSales = () => {
    const { router, userData } = useAppContext();
    const { data: allRawProducts, loading } = useCollection('products', {
        where: ['status', '==', 'approved'],
    });
    const [currentTime, setCurrentTime] = useState(null);

    useEffect(() => {
        setCurrentTime(new Date());
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const flashSaleProducts = useMemo(() => {
        if (!allRawProducts || !currentTime) return [];
        return allRawProducts
            .filter(p => p.flashSalePrice > 0 && p.flashSaleEndDate && new Date(p.flashSaleEndDate) > currentTime)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5)
            .map(p => ({ ...p, _id: p.id }));
    }, [allRawProducts, currentTime]);

    if (loading) {
        return (
             <div className="flex flex-col items-center pt-14">
                <div className="w-full flex justify-between items-end mb-4">
                    <div className="animate-pulse bg-gray-200 h-10 w-1/3 rounded-md"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 items-start gap-6 pb-14 w-full">
                     {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-full h-72 bg-gray-200 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            </div>
        )
    }

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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 items-start gap-6 pb-14 w-full">
                {flashSaleProducts.map((product) => <ProductCard key={product._id} product={product} />)}
            </div>
            <div className="flex items-center gap-4">
                <button onClick={() => { router.push('/all-products') }} className="px-6 md:px-12 py-2.5 border rounded text-gray-500/70 hover:bg-slate-50/90 transition">
                    View All Deals
                </button>
            </div>
        </div>
    );
};

export default FlashSales;
