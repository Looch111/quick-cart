'use client'
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";
import { useCollection } from "@/src/firebase";
import { useMemo } from "react";

const Wishlist = () => {

    const { wishlistItems } = useAppContext();
    const {data: productsData, loading} = useCollection('products');

    const wishlistedProducts = useMemo(() => {
        if (!productsData || !wishlistItems) return [];
        return productsData
            .filter(product => wishlistItems[product.id])
            .map(p => ({...p, _id: p.id}));
    }, [productsData, wishlistItems]);

    return (
        <>
            <Navbar />
            <div className="flex flex-col items-start px-6 md:px-16 lg:px-32 min-h-screen pt-20">
                <div className="flex flex-col items-end pt-12">
                    <p className="text-2xl font-medium">Your Wishlist</p>
                    <div className="w-16 h-0.5 bg-orange-600 rounded-full"></div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 items-start gap-6 py-14 w-full">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-full h-72 bg-gray-200 rounded-lg animate-pulse"></div>
                        ))}
                    </div>
                ) : wishlistedProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 items-start gap-6 py-14 w-full">
                        {wishlistedProducts.map((product) => <ProductCard key={product._id} product={product} />)}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center w-full h-[50vh]">
                         <p className="text-lg text-gray-500">Your wishlist is empty.</p>
                         <p className="text-gray-400">Add items to your wishlist to see them here.</p>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default Wishlist;
