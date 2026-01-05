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

const Product = () => {
    const params = useParams();
    const { products, router, addToCart, currency } = useAppContext()

    const [mainImage, setMainImage] = useState(null);
    const [productData, setProductData] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);

    const fetchProductData = async (productId) => {
        const product = products.find(product => product._id === productId);
        setProductData(product);
        if (product) {
            setMainImage(product.image[0]);
            if (product.sizes && product.sizes.length > 0) {
                setSelectedSize(product.sizes[0]);
            }
        }
    }

    useEffect(() => {
        const productId = params.id;
        if (productId && products.length > 0) {
            fetchProductData(productId);
        }
    }, [params.id, products]);

    const isOutOfStock = productData && productData.stock === 0;
    const isFlashSale = productData && productData.flashSaleEndDate && new Date(productData.flashSaleEndDate) > new Date();

    const currentPrice = productData ? (isFlashSale ? productData.offerPrice : productData.price) : 0;
    const originalPrice = productData ? (isFlashSale ? productData.price : null) : null;


    return productData ? (<>
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
                        <div className="flex items-center gap-0.5">
                            <Image className="h-4 w-4" src={assets.star_icon} alt="star_icon" />
                            <Image className="h-4 w-4" src={assets.star_icon} alt="star_icon" />
                            <Image className="h-4 w-4" src={assets.star_icon} alt="star_icon" />
                            <Image className="h-4 w-4" src={assets.star_icon} alt="star_icon" />
                            <Image
                                className="h-4 w-4"
                                src={assets.star_dull_icon}
                                alt="star_dull_icon"
                            />
                        </div>
                        <p>(4.5)</p>
                    </div>
                    <p className="text-gray-600 mt-3">
                        {productData.description}
                    </p>
                    <p className="text-3xl font-medium mt-6">
                        {currency}{currentPrice}
                        {originalPrice && originalPrice > currentPrice && (
                            <span className="text-base font-normal text-gray-800/60 line-through ml-2">
                                {currency}{originalPrice}
                            </span>
                        )}
                    </p>
                    {productData.sizes && productData.sizes.length > 0 && (
                        <div className="mt-6">
                            <p className="text-gray-600 font-medium mb-2">Size:</p>
                            <div className="flex gap-2">
                                {productData.sizes.map(size => (
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
                            onClick={() => addToCart(productData._id)} 
                            disabled={isOutOfStock}
                            className="w-full py-3.5 bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition rounded-full disabled:bg-gray-200 disabled:cursor-not-allowed disabled:text-gray-400"
                        >
                            Add to Cart
                        </button>
                        <button 
                            onClick={() => { if (!isOutOfStock) { addToCart(productData._id); router.push('/cart') } }} 
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
    ) : <Loading />
};

export default Product;
