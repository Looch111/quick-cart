import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";

const Banner = () => {
  const { router } = useAppContext();
  return (
    <div className="flex flex-col md:flex-row items-center justify-between md:pl-20 py-14 bg-[#E6E9F2] my-16 rounded-xl overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-center w-full">
        <div className="flex md:flex-col items-center justify-center gap-4 md:gap-0">
          <Image
            className="max-w-40 md:max-w-56"
            src={assets.jbl_soundbox_image}
            alt="jbl_soundbox_image"
          />
          <Image
            className="block md:hidden max-w-40"
            src={assets.sm_controller_image}
            alt="sm_controller_image"
          />
        </div>
        <div className="flex flex-col items-center justify-center text-center space-y-2 px-4 mt-6 md:mt-0 md:px-0">
          <h2 className="text-2xl md:text-3xl font-semibold max-w-[290px]">
            Level Up Your Gaming Experience
          </h2>
          <p className="max-w-[343px] font-medium text-gray-800/60">
            From immersive sound to precise controls—everything you need to win
          </p>
          <button onClick={() => router.push('/all-products')} className="group flex items-center justify-center gap-1 px-12 py-2.5 bg-orange-600 rounded text-white">
            Buy now
            <Image className="group-hover:translate-x-1 transition" src={assets.arrow_icon_white} alt="arrow_icon_white" />
          </button>
        </div>
      </div>
      <Image
        className="hidden md:block max-w-80"
        src={assets.md_controller_image}
        alt="md_controller_image"
      />
    </div>
  );
};

export default Banner;
