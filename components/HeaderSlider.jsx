'use client'
import React, { useState, useEffect } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import { useCollection } from "@/src/firebase";

const HeaderSlider = () => {
    const { router, isAdmin } = useAppContext();
    const {data: banners, loading} = useCollection('banners');
    const [currentSlide, setCurrentSlide] = useState(0);

    const activeBanners = (banners || []).filter(b => b.status === 'active');

    useEffect(() => {
        if (activeBanners.length === 0) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [activeBanners.length]);

    const handleSlideChange = (index) => {
        setCurrentSlide(index);
    };

    if (loading) {
        return <div className="w-full h-64 bg-gray-200 mt-6 rounded-xl animate-pulse"></div>;
    }

    if (activeBanners.length === 0) {
        return null;
    }

    const currentBanner = activeBanners[currentSlide];

    return (
        <div className="overflow-hidden relative w-full">
            <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{
                    transform: `translateX(-${currentSlide * 100}%)`,
                }}
            >
                {activeBanners.map((slide, index) => (
                    <div
                        key={slide.id}
                        className="flex flex-col-reverse md:flex-row items-center justify-between bg-[#E6E9F2] py-8 md:px-14 px-5 mt-6 rounded-xl min-w-full"
                    >
                        <div className="md:pl-8 mt-6 md:mt-0">
                             <p 
                                className={`md:text-base text-orange-600 pb-1 ${isAdmin ? 'cursor-pointer hover:underline' : ''}`}
                                onClick={() => isAdmin && router.push('/admin/marketing')}
                            >
                                {slide.offerText || 'Limited Time Offer'}
                            </p>
                            <h1 className="max-w-lg md:text-[40px] md:leading-[48px] text-2xl font-semibold">
                                {slide.title}
                            </h1>
                            <div className="flex items-center mt-4 md:mt-6 ">
                                <button onClick={() => router.push(slide.link)} className="md:px-10 px-7 md:py-2.5 py-2 bg-orange-600 rounded-full text-white font-medium">
                                    {slide.buttonText || 'Shop now'}
                                </button>
                                <button onClick={() => router.push(slide.secondaryLink || '/all-products')} className="group flex items-center gap-2 px-6 py-2.5 font-medium">
                                    {slide.secondaryButtonText || 'Find more'}
                                    <Image className="group-hover:translate-x-1 transition" src={assets.arrow_icon} alt="arrow_icon" />
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center flex-1 justify-center">
                            <Image
                                className="md:w-72 w-48 object-contain"
                                src={slide.image}
                                alt={`Slide ${index + 1}`}
                                width={500}
                                height={500}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2">
                {activeBanners.map((_, index) => (
                    <div
                        key={index}
                        onClick={() => handleSlideChange(index)}
                        className={`h-2 rounded-full cursor-pointer transition-all duration-500 ${currentSlide === index ? "w-6 bg-orange-600" : "w-2 bg-gray-500/30"
                            }`}
                    ></div>
                ))}
            </div>
        </div>
    );
};

export default HeaderSlider;
