'use client'
import React from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "@/context/AppContext";
import { useCollection } from "@/src/firebase";

const HomeProducts = () => {

  const { router } = useAppContext();
  const { data: productsData, loading: productsLoading } = useCollection('products', {
    where: ['status', '==', 'approved'],
    orderBy: ['date', 'desc'],
    limit: 10
  });

  if (productsLoading) {
    return (
        <div className="flex flex-col items-center pt-14">
            <p className="text-2xl font-medium text-left w-full">Popular products</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 items-start gap-6 mt-6 pb-14 w-full">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-full h-72 bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
            </div>
        </div>
    )
  }

  const products = productsData.map(p => ({...p, _id: p.id}));

  return (
    <div className="flex flex-col items-center pt-14">
      <p className="text-2xl font-medium text-left w-full">Popular products</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 items-start gap-6 mt-6 pb-14 w-full">
        {products.map((product) => <ProductCard key={product._id} product={product} />)}
      </div>
      <button onClick={() => { router.push('/all-products') }} className="px-12 py-2.5 border rounded text-gray-500/70 hover:bg-slate-50/90 transition">
        See more
      </button>
    </div>
  );
};

export default HomeProducts;
