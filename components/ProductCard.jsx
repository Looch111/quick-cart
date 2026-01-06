
import React, { useEffect, useState } from 'react'
import { assets } from '@/assets/assets'
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';

const CountdownTimer = ({ endDate }) => {
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        if (!endDate) return;

        // Function to calculate time remaining
        const calculateTimeLeft = () => {
            const now = new Date();
            const end = new Date(endDate);
            const distance = end - now;

            if (distance < 0) {
                return null;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
            const seconds = Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0');
            return { days, hours, minutes, seconds };
        };

        // Set initial time on client mount
        setTimeLeft(calculateTimeLeft());
        
        const interval = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(interval);
    }, [endDate]);

    if (!timeLeft) {
        return null;
    }

    return (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[95%] bg-white/80 backdrop-blur-sm rounded-md p-1.5 text-xs">
            <p className='text-center font-medium text-red-600 mb-1'>Sale Ends In:</p>
            <div className="flex items-center justify-center gap-1 text-gray-800">
                <div className='flex flex-col items-center'><span className='font-bold'>{timeLeft.days}</span><span className='text-[10px]'>d</span></div>
                <div>:</div>
                <div className='flex flex-col items-center'><span className='font-bold'>{timeLeft.hours}</span><span className='text-[10px]'>h</span></div>
                <div>:</div>
                <div className='flex flex-col items-center'><span className='font-bold'>{timeLeft.minutes}</span><span className='text-[10px]'>m</span></div>
                <div>:</div>
                <div className='flex flex-col items-center'><span className='font-bold'>{timeLeft.seconds}</span><span className='text-[10px]'>s</span></div>
            </div>
        </div>
    );
};


const ProductCard = ({ product }) => {

    const { currency, router, wishlistItems, toggleWishlist, addToCart, openSizeModal } = useAppContext()
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        // This timer ensures the component re-renders every second,
        // which re-evaluates the isFlashSaleActive condition.
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const isWishlisted = wishlistItems[product._id];
    const isOutOfStock = !product.stock || product.stock <= 0;

    const isFlashSaleActive = product.flashSalePrice > 0 && product.flashSaleEndDate && new Date(product.flashSaleEndDate) > currentTime;

    const currentPrice = isFlashSaleActive ? product.flashSalePrice : product.offerPrice;
    const originalPrice = isFlashSaleActive ? product.price : (product.offerPrice < product.price ? product.price : null);

    const handleWishlistClick = (e) => {
        e.stopPropagation();
        toggleWishlist(product._id);
    }

    const handleAddToCartClick = (e) => {
        e.stopPropagation();
        if (isOutOfStock) return;
        if (product.sizes && product.sizes.length > 0) {
            openSizeModal(product);
        } else {
            addToCart(product._id);
        }
    }
    
    const handleBuyNowClick = (e) => {
        e.stopPropagation();
        if (isOutOfStock) return;
        
        if (product.sizes && product.sizes.length > 0) {
            openSizeModal(product);
        } else {
            addToCart(product._id);
            router.push('/cart');
        }
    }

    return (
        <div
            onClick={() => { router.push('/product/' + product._id); scrollTo(0, 0) }}
            className="flex flex-col w-full cursor-pointer group h-full"
        >
            <div className="relative bg-gray-500/10 rounded-lg w-full h-44 md:h-52 flex items-center justify-center p-2 overflow-hidden">
                <Image
                    src={product.image[0]}
                    alt={product.name}
                    className="group-hover:scale-105 transition-transform duration-300 object-contain w-full h-full"
                    width={200}
                    height={200}
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
                {isFlashSaleActive && <CountdownTimer endDate={product.flashSaleEndDate} />}
            </div>

            <div className='flex flex-col justify-between flex-grow mt-2'>
                <div>
                    <p className="md:text-base font-medium w-full truncate">{product.name}</p>
                    <p className="w-full text-xs text-gray-500/70 max-sm:hidden truncate">{product.description}</p>
                    <div className="flex items-center gap-2 mt-1">
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
                </div>

                <div className="flex items-end justify-between w-full mt-2">
                    <div className="flex items-center flex-wrap gap-x-2">
                        <p className="text-base font-medium text-orange-600">{currency}{currentPrice}</p>
                        {originalPrice && <p className="text-sm line-through text-gray-400">{currency}{originalPrice}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleAddToCartClick} 
                            disabled={isOutOfStock}
                            className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full text-gray-500 text-lg border border-gray-500/20 disabled:cursor-not-allowed disabled:bg-gray-200"
                        >
                            +
                        </button>
                        <button 
                            onClick={handleBuyNowClick}
                            disabled={isOutOfStock}
                            className=" max-sm:hidden px-4 py-1.5 text-gray-500 border border-gray-500/20 rounded-full text-xs hover:bg-slate-50 transition disabled:cursor-not-allowed disabled:bg-gray-200"
                        >
                            Buy now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductCard
