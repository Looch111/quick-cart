
"use client"
import { useEffect, useState, useMemo } from "react";
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
import { useCollection, useDoc } from "@/src/firebase";
import { User, Send, MessageSquare } from "lucide-react";

const StarRating = ({ rating, onRatingChange, isInteractive = true }) => {
    const [hoverRating, setHoverRating] = useState(0);

    const handleRating = (rate) => {
        if (isInteractive) onRatingChange(rate);
    };

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    onClick={() => handleRating(star)}
                    onMouseEnter={() => isInteractive && setHoverRating(star)}
                    onMouseLeave={() => isInteractive && setHoverRating(0)}
                    className={`focus:outline-none ${isInteractive ? 'cursor-pointer' : 'cursor-default'}`}
                    disabled={!isInteractive}
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

const ReviewForm = ({ productId }) => {
    const { addProductReview, userData } = useAppContext();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const hasPurchased = userData?.purchasedProducts?.includes(productId);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Please select a rating.");
            return;
        }
        if (!comment) {
            toast.error("Please enter a comment.");
            return;
        }
        setIsSubmitting(true);
        await addProductReview(productId, rating, comment);
        setRating(0);
        setComment("");
        setIsSubmitting(false);
    };

    if (!userData) {
        return <p className="text-sm text-gray-500 bg-gray-100 p-4 rounded-md">Please log in to write a review.</p>;
    }
    
    if (!hasPurchased) {
        return (
            <div className="text-sm text-gray-500 bg-gray-100 p-4 rounded-md">
                <p>You can only review products you have purchased.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded-lg bg-gray-50">
            <h3 className="font-semibold text-lg mb-2">Write a Review</h3>
            <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Rating</label>
                <StarRating rating={rating} onRatingChange={setRating} />
            </div>
            <div className="mb-4">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
                <textarea
                    className="w-full p-2 border rounded-md focus:ring-orange-500 focus:border-orange-500"
                    rows="3"
                    placeholder="Share your thoughts..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                ></textarea>
            </div>
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-orange-300"
            >
                <Send className="w-4 h-4" />
                {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
        </form>
    );
};

const ReviewsList = ({ productId }) => {
    const { data: reviews, loading } = useCollection(`products/${productId}/reviews`, {
        orderBy: ['createdAt', 'desc']
    });

    if (loading) return <p>Loading reviews...</p>;
    if (!reviews || reviews.length === 0) return <p className="text-sm text-gray-500">No reviews yet.</p>;

    return (
        <div className="space-y-6">
            {reviews.map(review => (
                <div key={review.id} className="flex gap-4 border-b pb-6 last:border-b-0">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                         {review.userPhotoURL ? (
                            <Image src={review.userPhotoURL} alt={review.userName} width={40} height={40} className="object-cover" />
                        ) : (
                            <User className="w-6 h-6 text-gray-500" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-4">
                            <p className="font-semibold">{review.userName}</p>
                            <p className="text-xs text-gray-400">{new Date(review.createdAt?.toDate()).toLocaleDateString()}</p>
                        </div>
                        <div className="my-1">
                            <StarRating rating={review.rating} isInteractive={false} />
                        </div>
                        <p className="text-gray-600 text-sm">{review.comment}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

const Product = () => {
    const params = useParams();
    const productId = params.id;
    const { router, addToCart, currency, openSizeModal, allRawProducts, buyNow } = useAppContext();

    const { data: product, loading: productLoading } = useDoc('products', productId);
    const { data: seller, loading: sellerLoading } = useDoc('users', product?.userId);
    const { data: relatedProductsData, loading: relatedLoading } = useCollection('products', {
        where: ['category', '==', product?.category],
        limit: 6
    });

    const [mainImage, setMainImage] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [currentTime, setCurrentTime] = useState(null);

    const productData = useMemo(() => product ? { ...product, _id: product.id } : null, [product]);

    useEffect(() => {
        if (productData && productData.image && productData.image.length > 0) {
            setMainImage(productData.image[0]);
            if (productData.sizes && typeof productData.sizes === 'object' && Object.keys(productData.sizes).length > 0) {
                setSelectedSize(Object.keys(productData.sizes)[0]);
            }
        }
    }, [productData]);
    
    useEffect(() => {
        setCurrentTime(new Date());
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (productLoading || !productData) {
        return <Loading />;
    }
    
    const isOutOfStock = productData && productData.stock === 0;
    const hasSizes = productData.sizes && typeof productData.sizes === 'object' && Object.keys(productData.sizes).length > 0;
    
    const isFlashSaleActive = currentTime && productData.flashSalePrice > 0 && productData.flashSaleEndDate && new Date(productData.flashSaleEndDate) > currentTime;
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
        buyNow(productData);
    };

    const relatedProducts = relatedProductsData
        .filter(p => p.id !== productId && p.status === 'approved')
        .slice(0, 5)
        .map(p => ({...p, _id: p.id}));

    return (
    <>
        <Navbar />
        <div className="px-6 md:px-16 lg:px-32 pt-32 md:pt-28 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="px-5 lg:px-16 xl:px-20">
                    <div className="rounded-lg overflow-hidden bg-gray-500/10 mb-4 relative aspect-square">
                        {mainImage && <Image
                            src={mainImage}
                            alt={productData.name}
                            className="w-full h-full object-cover"
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />}
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
                                    className="w-full h-full object-cover"
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
                        <StarRating rating={productData.averageRating || 0} isInteractive={false} />
                        <p className="text-gray-600">({productData.reviewCount || 0} reviews)</p>
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
                     {!sellerLoading && seller && (
                        <a href={`mailto:${seller.email}`} className="mt-6 flex items-center gap-2 text-sm text-orange-600 hover:underline">
                            <MessageSquare className="w-4 h-4"/>
                            Ask a question
                        </a>
                    )}
                    <hr className="bg-gray-600 my-6" />
                    <div className="overflow-x-auto">
                        <table className="table-auto border-collapse w-full max-w-sm">
                            <tbody>
                                <tr>
                                    <td className="text-gray-600 font-medium pr-4 py-1">Brand</td>
                                    <td className="text-gray-800/50 py-1">{productData.brand || 'Generic'}</td>
                                </tr>
                                <tr>
                                    <td className="text-gray-600 font-medium pr-4 py-1">Color</td>
                                    <td className="text-gray-800/50 py-1">{productData.color || 'Multi'}</td>
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
                                {productData.deliveryInfo && (
                                <tr>
                                    <td className="text-gray-600 font-medium pr-4 py-1">Delivery</td>
                                    <td className="font-medium text-gray-800/80 py-1">
                                       {productData.deliveryInfo}
                                    </td>
                                </tr>
                                )}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-10">
                <div>
                    <h2 className="text-2xl font-semibold mb-6">Customer Reviews</h2>
                    <ReviewsList productId={productId} />
                </div>
                <div>
                     <h2 className="text-2xl font-semibold mb-6">Leave a Review</h2>
                    <ReviewForm productId={productId} />
                </div>
            </div>

            <div className="flex flex-col items-center">
                <div className="flex flex-col items-center mb-4 mt-16">
                    <p className="text-3xl font-medium">Related <span className="font-medium text-orange-600">Products</span></p>
                    <div className="w-28 h-0.5 bg-orange-600 mt-2"></div>
                </div>
                {relatedLoading ? <p>Loading...</p> : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 pb-14 w-full">
                        {relatedProducts.map((product, index) => <ProductCard key={index} product={product} />)}
                    </div>
                )}
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
