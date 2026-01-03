'use client'
import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";

const Wishlist = () => {

    const { products, wishlistItems } = useAppContext();

    const wishlistedProducts = products.filter(product => wishlistItems[product._id]);

    return (
        <>
            <Navbar />
            <div className="flex flex-col items-start px-6 md:px-16 lg:px-32 min-h-screen pt-20">
                <div className="flex flex-col items-end pt-12">
                    <p className="text-2xl font-medium">Your Wishlist</p>
                    <div className="w-16 h-0.5 bg-orange-600 rounded-full"></div>
                </div>

                {wishlistedProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-col items-center gap-6 py-14 w-full">
                        {wishlistedProducts.map((product, index) => <ProductCard key={index} product={product} />)}
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
