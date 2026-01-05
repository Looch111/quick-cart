'use client'
import { useState, useEffect, useRef } from "react";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

const SearchFocus = ({ searchInputRef }) => {
    const searchParams = useSearchParams();
    const focus = searchParams.get('focus');

    useEffect(() => {
        if (focus === 'search' && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [focus, searchInputRef]);

    return null;
}

const AllProducts = () => {

    const { products } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const searchInputRef = useRef(null);
    
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Navbar />
            <div className="flex flex-col items-start px-6 md:px-16 lg:px-32 pt-20">
                <SearchFocus searchInputRef={searchInputRef} />
                <div className="flex flex-col items-end pt-12">
                    <p className="text-2xl font-medium">All products</p>
                    <div className="w-16 h-0.5 bg-orange-600 rounded-full"></div>
                </div>

                <div className="relative w-full max-w-sm my-8">
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search for products..."
                        className="w-full pl-4 pr-10 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Image
                        src={assets.search_icon}
                        alt="search icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                    />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-col items-center gap-6 pb-14 w-full">
                    {filteredProducts.map((product, index) => <ProductCard key={index} product={product} />)}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default AllProducts;
