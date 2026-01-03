'use client'
import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "@/context/AppContext";

const CountdownTimer = () => {
    const [timeLeft, setTimeLeft] = useState({
        days: '00',
        hours: '00',
        minutes: '00',
        seconds: '00',
    });

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            const distance = endOfDay - now;

            if (distance < 0) {
                clearInterval(interval);
                setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' });
            } else {
                const days = Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
                const seconds = Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0');
                setTimeLeft({ days, hours, minutes, seconds });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const TimerBlock = ({ value, label }) => (
        <div className="flex flex-col items-center">
            <span className="text-3xl font-semibold text-gray-800">{value}</span>
            <span className="text-xs text-gray-500">{label}</span>
        </div>
    );

    return (
        <div className="flex items-center gap-4">
            <TimerBlock value={timeLeft.days} label="Days" />
            <span className="text-3xl font-semibold text-gray-800">:</span>
            <TimerBlock value={timeLeft.hours} label="Hours" />
            <span className="text-3xl font-semibold text-gray-800">:</span>
            <TimerBlock value={timeLeft.minutes} label="Minutes" />
            <span className="text-3xl font-semibold text-gray-800">:</span>
            <TimerBlock value={timeLeft.seconds} label="Seconds" />
        </div>
    );
};


const FlashSales = () => {

  const { products, router, userData } = useAppContext()

  // Filter for products with a discount of 20% or more
  const flashSaleProducts = products.filter(p => p.price > 0 && ((p.price - p.offerPrice) / p.price) >= 0.2).slice(0, 5);

  if (flashSaleProducts.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center pt-14">
        <div className="w-full flex justify-between items-end mb-4">
            <div className="flex flex-col items-start">
                <p className="text-3xl font-medium">Flash <span className="font-medium text-orange-600">Sales</span></p>
                <div className="w-28 h-0.5 bg-orange-600 mt-2"></div>
                 <p className="text-gray-500 mt-4 mb-2">Grab the best deals before they're gone!</p>
            </div>
            <CountdownTimer />
        </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-col items-center gap-6 pb-14 w-full">
        {flashSaleProducts.map((product, index) => <ProductCard key={index} product={product} />)}
      </div>
       <div className="flex items-center gap-4">
            <button onClick={() => { router.push('/all-products') }} className="px-12 py-2.5 border rounded text-gray-500/70 hover:bg-slate-50/90 transition">
                View All Deals
            </button>
            {userData?.role === 'admin' && (
                <button onClick={() => router.push('/admin/promotions')} className="px-12 py-2.5 border rounded text-white bg-orange-600 hover:bg-orange-700 transition">
                    Manage Promotions
                </button>
            )}
        </div>
    </div>
  );
};

export default FlashSales;
