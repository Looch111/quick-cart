
"use client"
import { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import React from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";

const StarRating = ({ rating, onRatingChange }) => {
    const [hoverRating, setHoverRating] = useState(0);

    const handleRating = (rate) => {
        onRatingChange(rate);
        toast.success(`You rated this product ${rate} stars. Thank you!`);
    };

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    onClick={() => handleRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none"
                >
                    <Image
                        className="h-5 w-5"
                        src={(hoverRating || rating) >= star ? assets.star_icon : assets.star_dull_icon}
                        alt="star icon"
                        width={20}
                        height={20}
                    />
                </button>
            ))}
        </div>
    );
};


const Product = () => {
    const params = useParams();
    const { products, router, addToCart, currency, openSizeModal } = useAppContext()

    const [mainImage, setMainImage] = useState(null);
    const [productData, setProductData] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [userRating, setUserRating] = useState(4);
    const [currentTime, setCurrentTime] = useState(new Date());


    const productId = params.id;

    useEffect(() => {
        const fetchProductData = async (id) => {
            const product = products.find(product => product._id === id);
            setProductData(product);
            if (product) {
                setMainImage(product.image[0]);
                if (product.sizes && typeof product.sizes === 'object' && Object.keys(product.sizes).length > 0) {
                    setSelectedSize(Object.keys(product.sizes)[0]);
                }
            }
        }

        if (productId && products.length > 0) {
            fetchProductData(productId);
        }
    }, [productId, products]);
    
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    if (!productData) {
        return <Loading />;
    }
    
    const isOutOfStock = productData && productData.stock === 0;
    const hasSizes = productData.sizes && typeof productData.sizes === 'object' && Object.keys(productData.sizes).length > 0;
    
    // Determine if flash sale is active
    const isFlashSaleActive = productData.flashSalePrice > 0 && productData.flashSaleEndDate && new Date(productData.flashSaleEndDate) > currentTime;

    // Determine current price and original price for display
    const currentPrice = isFlashSaleActive ? productData.flashSalePrice : productData.offerPrice;
    const originalPrice = isFlashSaleActive ? productData.price : (productData.offerPrice < productData.price ? productData.price : null);

    const handleAddToCart = () => {
        if (hasSizes) {
            openSizeModal(productData);
        } else {
            addToCart(productData._id);
        }
    };

    const handleBuyNow = () => {
        if (isOutOfStock) return;
        if (hasSizes) {
            openSizeModal(productData);
        } else {
            addToCart(productData._id);
            router.push('/cart');
        }
    };


    return (
    <>
        <Navbar />
        <div className="px-6 md:px-16 lg:px-32 pt-32 md:pt-28 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="px-5 lg:px-16 xl:px-20">
                    <div className="rounded-lg overflow-hidden bg-gray-500/10 mb-4 relative aspect-square">
                        <Image
                            src={mainImage}
                            alt={productData.name}
                            className="w-full h-full object-contain mix-blend-multiply"
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        {isOutOfStock && (
                            <div className="absolute top-4 left-4 bg-red-500 text-white text-sm px-3 py-1 rounded-full">
                                Out of Stock
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        {productData.image.map((image, index) => (
                            <div
                                key={index}
                                onClick={() => setMainImage(image)}
                                className={`cursor-pointer rounded-lg overflow-hidden bg-gray-500/10 aspect-square border-2 ${mainImage === image ? 'border-orange-500' : 'border-transparent'}`}
                            >
                                <Image
                                    src={image}
                                    alt={`${productData.name} thumbnail ${index + 1}`}
                                    className="w-full h-full object-contain mix-blend-multiply"
                                    width={100}
                                    height={100}
                                />
                            </div>

                        ))}
                    </div>
                </div>

                <div className="flex flex-col">
                    <h1 className="text-3xl font-medium text-gray-800/90 mb-4">
                        {productData.name}
                    </h1>
                    <div className="flex items-center gap-2">
                        <StarRating rating={userRating} onRatingChange={setUserRating} />
                        <p className="text-gray-600">({userRating}.0)</p>
                    </div>
                    <p className="text-gray-600 mt-3">
                        {productData.description}
                    </p>
                    <p className="text-3xl font-medium mt-6">
                        {currency}{currentPrice}
                        {originalPrice && (
                            <span className="text-base font-normal text-gray-800/60 line-through ml-2">
                                {currency}{originalPrice}
                            </span>
                        )}
                    </p>
                    {hasSizes && (
                        <div className="mt-6">
                            <p className="text-gray-600 font-medium mb-2">Size:</p>
                            <div className="flex gap-2 flex-wrap">
                                {Object.keys(productData.sizes).map(size => (
                                    <button 
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`px-4 py-2 border rounded-md ${selectedSize === size ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <hr className="bg-gray-600 my-6" />
                    <div className="overflow-x-auto">
                        <table className="table-auto border-collapse w-full max-w-72">
                            <tbody>
                                <tr>
                                    <td className="text-gray-600 font-medium pr-4 py-1">Brand</td>
                                    <td className="text-gray-800/50 py-1">Generic</td>
                                </tr>
                                <tr>
                                    <td className="text-gray-600 font-medium pr-4 py-1">Color</td>
                                    <td className="text-gray-800/50 py-1">Multi</td>
                                </tr>
                                <tr>
                                    <td className="text-gray-600 font-medium pr-4 py-1">Category</td>
                                    <td className="text-gray-800/50 py-1">
                                        {productData.category}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-gray-600 font-medium pr-4 py-1">Availability</td>
                                    <td className={`font-medium py-1 ${isOutOfStock ? 'text-red-500' : 'text-green-600'}`}>
                                        {isOutOfStock ? "Out of Stock" : "In Stock"}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center mt-10 gap-4">
                        <button 
                            onClick={handleAddToCart} 
                            disabled={isOutOfStock}
                            className="w-full py-3.5 bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition rounded-full disabled:bg-gray-200 disabled:cursor-not-allowed disabled:text-gray-400"
                        >
                            Add to Cart
                        </button>
                        <button 
                            onClick={handleBuyNow} 
                            disabled={isOutOfStock}
                            className="w-full py-3.5 bg-orange-500 text-white hover:bg-orange-600 transition rounded-full disabled:bg-orange-300 disabled:cursor-not-allowed"
                        >
                            Buy now
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-center">
                <div className="flex flex-col items-center mb-4 mt-16">
                    <p className="text-3xl font-medium">Related <span className="font-medium text-orange-600">Products</span></p>
                    <div className="w-28 h-0.5 bg-orange-600 mt-2"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 pb-14 w-full">
                    {products.filter(p => p.category === productData.category && p._id !== productData._id).slice(0, 5).map((product, index) => <ProductCard key={index} product={product} />)}
                </div>
                <button onClick={() => router.push('/all-products')} className="px-8 py-2 mb-16 border rounded text-gray-500/70 hover:bg-slate-50/90 transition">
                    See more
                </button>
            </div>
        </div>
        <Footer />
    </>
    )
};

export default Product;
