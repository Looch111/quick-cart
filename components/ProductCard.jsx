import React from 'react'
import { assets } from '@/assets/assets'
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';

const ProductCard = ({ product }) => {

    const { currency, router, wishlistItems, toggleWishlist, addToCart } = useAppContext()
    const isWishlisted = wishlistItems[product._id];
    const isOutOfStock = product.stock === 0;

    const handleWishlistClick = (e) => {
        e.stopPropagation();
        toggleWishlist(product._id);
    }

    const handleAddToCartClick = (e) => {
        e.stopPropagation();
        if (isOutOfStock) return;
        addToCart(product._id);
    }

    return (
        <div
            onClick={() => { router.push('/product/' + product._id); scrollTo(0, 0) }}
            className="flex flex-col items-start gap-0.5 max-w-[200px] w-full cursor-pointer"
        >
            <div className="cursor-pointer group relative bg-gray-500/10 rounded-lg w-full h-44 md:h-52 flex items-center justify-center p-2">
                <Image
                    src={product.image[0]}
                    alt={product.name}
                    className="group-hover:scale-105 transition object-contain w-full h-full"
                    width={800}
                    height={800}
                />
                <button onClick={handleWishlistClick} className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md">
                    <Image
                        className="h-3 w-3"
                        src={isWishlisted ? assets.heart_icon_red : assets.heart_icon}
                        alt="heart_icon"
                    />
                </button>
                {isOutOfStock && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                        Out of Stock
                    </div>
                )}
            </div>

            <p className="md:text-base font-medium pt-2 w-full truncate">{product.name}</p>
            <p className="w-full text-xs text-gray-500/70 max-sm:hidden truncate">{product.description}</p>
            <div className="flex items-center gap-2">
                <p className="text-xs">{4.5}</p>
                <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Image
                            key={index}
                            className="h-3 w-3"
                            src={
                                index < Math.floor(4)
                                    ? assets.star_icon
                                    : assets.star_dull_icon
                            }
                            alt="star_icon"
                        />
                    ))}
                </div>
            </div>

            <div className="flex items-end justify-between w-full mt-1">
                <p className="text-base font-medium">{currency}{product.offerPrice}</p>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleAddToCartClick} 
                        disabled={isOutOfStock}
                        className="w-6 h-6 flex items-center justify-center rounded-full text-gray-500 text-lg border border-gray-500/20 disabled:cursor-not-allowed disabled:bg-gray-200"
                    >
                        +
                    </button>
                    <button 
                        disabled={isOutOfStock}
                        className=" max-sm:hidden px-4 py-1.5 text-gray-500 border border-gray-500/20 rounded-full text-xs hover:bg-slate-50 transition disabled:cursor-not-allowed disabled:bg-gray-200"
                    >
                        Buy now
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ProductCard

    