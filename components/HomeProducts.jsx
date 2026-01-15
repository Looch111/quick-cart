
'use client'
import React, { useMemo } from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "@/context/AppContext";
import { useCollection } from "@/src/firebase";
import Loading from "./Loading";

const HomeProducts = () => {

  const { router } = useAppContext()
  const { data: productsData, loading } = useCollection('products', { where: ['status', '==', 'approved'] });

  const sortedProducts = useMemo(() => {
      if (!productsData) return [];
      // Sort products by date to show the newest ones first
      return [...productsData]
        .map(p => ({...p, _id: p.id, date: p.date?.toDate ? p.date.toDate() : new Date(p.date) }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [productsData]);


  if (loading) {
    return <div className="h-96"><Loading/></div>;
  }
  
  if (sortedProducts.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center pt-14">
      <p className="text-2xl font-medium text-left w-full">Popular products</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 items-start gap-6 mt-6 pb-14 w-full">
        {sortedProducts.slice(0, 10).map((product, index) => <ProductCard key={index} product={product} />)}
      </div>
      <button onClick={() => { router.push('/all-products') }} className="px-12 py-2.5 border rounded text-gray-500/70 hover:bg-slate-50/90 transition">
        See more
      </button>
    </div>
  );
};

export default HomeProducts;
