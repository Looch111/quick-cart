"use client"
import React, { useState } from "react";
import { assets} from "@/assets/assets";
import Link from "next/link"
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";

const Navbar = () => {

  const { isSeller, router, getCartCount, getWishlistCount, handleLogout, userData, setShowLogin } = useAppContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLoginClick = () => {
    setTimeout(() => {
        setShowLogin(true);
    }, 300);
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-16 lg:px-32 py-3 border-b border-gray-300 text-gray-700 bg-white shadow-sm">
      <Image
        className="cursor-pointer w-28 md:w-32"
        onClick={() => router.push('/')}
        src={assets.logo}
        alt="logo"
      />
      <div className="flex items-center gap-4 lg:gap-8 max-md:hidden">
        <Link href="/" className="hover:text-gray-900 transition">
          Home
        </Link>
        <Link href="/all-products" className="hover:text-gray-900 transition">
          Shop
        </Link>
        <Link href="/" className="hover:text-gray-900 transition">
          About Us
        </Link>
        <Link href="/" className="hover:text-gray-900 transition">
          Contact
        </Link>

        {isSeller && <button onClick={() => router.push('/seller')} className="text-xs border px-4 py-1.5 rounded-full">Seller Dashboard</button>}

      </div>

      <ul className="hidden md:flex items-center gap-6 ">
        <Link href={'/all-products?focus=search'}>
            <Image className="w-4 h-4 cursor-pointer" src={assets.search_icon} alt="search icon" />
        </Link>
        <Link href={'/wishlist'} className='relative'>
            <Image className="w-5 h-5" src={assets.heart_icon} alt="wishlist icon" />
            {getWishlistCount() > 0 && <div className='absolute -top-2 -right-2 bg-orange-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full'>{getWishlistCount()}</div>}
        </Link>
        <Link href={'/cart'} className='relative'>
          <Image className="w-5 h-5" src={assets.cart_icon} alt="cart icon" />
          {getCartCount() > 0 && <div className='absolute -top-2 -right-2 bg-orange-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full'>{getCartCount()}</div>}
        </Link>
        {userData ? (
            <div className="relative">
                <button onClick={() => setIsDropdownOpen(prev => !prev)} className="flex items-center gap-2 hover:text-gray-900 transition">
                    <Image src={assets.user_icon} alt="user icon" />
                    Account
                </button>
                {isDropdownOpen && (
                    <ul className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10">
                        <li>
                            <Link href="/my-orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Orders</Link>
                        </li>
                        <li>
                            <button onClick={() => { handleLogout(); setIsDropdownOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                        </li>
                    </ul>
                )}
            </div>
        ) : (
            <button onClick={handleLoginClick} className="flex items-center gap-2 hover:text-gray-900 transition">
                <Image src={assets.user_icon} alt="user icon" />
                Account
            </button>
        )}
      </ul>

      <div className="flex items-center md:hidden gap-5">
        {isSeller && <button onClick={() => router.push('/seller')} className="text-xs border px-4 py-1.5 rounded-full">Seller Dashboard</button>}
        <Link href={'/wishlist'} className='relative'>
            <Image className="w-5 h-5" src={assets.heart_icon} alt="wishlist icon" />
            {getWishlistCount() > 0 && <div className='absolute -top-2 -right-2 bg-orange-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full'>{getWishlistCount()}</div>}
        </Link>
        <Link href={'/cart'} className='relative'>
          <Image className="w-5 h-5" src={assets.cart_icon} alt="cart icon" />
          {getCartCount() > 0 && <div className='absolute -top-2 -right-2 bg-orange-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full'>{getCartCount()}</div>}
        </Link>
        {userData ? (
            <div className="relative">
                <button onClick={() => setIsDropdownOpen(prev => !prev)} className="flex items-center gap-2 hover:text-gray-900 transition">
                    <Image src={assets.user_icon} alt="user icon" />
                </button>
                {isDropdownOpen && (
                    <ul className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10">
                        <li>
                            <Link href="/my-orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Orders</Link>
                        </li>
                        <li>
                            <button onClick={() => { handleLogout(); setIsDropdownOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                        </li>
                    </ul>
                )}
            </div>
        ) : (
             <button onClick={handleLoginClick} className="flex items-center gap-2 hover:text-gray-900 transition">
                <Image src={assets.user_icon} alt="user icon" />
            </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
