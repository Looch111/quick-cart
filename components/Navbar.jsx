'use client'
import React, { useState, useEffect, useRef } from "react";
import { assets, HomeIcon, BoxIcon, CartIcon, BagIcon } from "@/assets/assets";
import Link from "next/link"
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { Settings, LogOut, Wallet } from "lucide-react";

const Navbar = () => {

  const { router, getCartCount, getWishlistCount, handleLogout, userData, setShowLogin } = useAppContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLoginClick = () => {
    setTimeout(() => {
        setShowLogin(true);
    }, 300);
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isSeller = userData?.role === 'seller';
  const isAdmin = userData?.role === 'admin';


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
        {isAdmin && <button onClick={() => router.push('/admin')} className="text-xs border px-4 py-1.5 rounded-full">Admin Panel</button>}

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
            <div className="relative" ref={dropdownRef}>
                <button onClick={() => setIsDropdownOpen(prev => !prev)} className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 transition">
                     <span className="text-sm font-medium text-gray-600">{userData.name?.[0]}</span>
                </button>
                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border rounded-md shadow-lg z-10">
                        <div className="p-4 border-b">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-lg font-medium text-gray-600">{userData.name?.[0]}</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">{userData.name}</p>
                                    <p className="text-xs text-gray-500">{userData.email}</p>
                                </div>
                            </div>
                        </div>
                        <ul className="py-2">
                             <li>
                                <Link href="/manage-account" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <Settings className="w-5 h-5 text-gray-600" />
                                    <span>Manage account</span>
                                </Link>
                            </li>
                             <li>
                                <Link href="/" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <HomeIcon />
                                    <span>Home</span>
                                </Link>
                            </li>
                             <li>
                                <Link href="/all-products" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <BoxIcon />
                                    <span>Products</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/cart" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <CartIcon />
                                    <span>Cart</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/my-orders" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <BagIcon />
                                    <span>My Orders</span>
                                </Link>
                            </li>
                            {isSeller && (
                                <li>
                                    <Link href="/seller/wallet" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        <Wallet className="w-5 h-5 text-gray-600" />
                                        <span>My Wallet</span>
                                    </Link>
                                </li>
                            )}
                            <div className="h-px bg-gray-200 my-2"></div>
                            <li>
                                <button onClick={() => { handleLogout(); setIsDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <LogOut className="w-5 h-5 text-gray-600" />
                                    <span>Sign out</span>
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        ) : (
            <button onClick={handleLoginClick} className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition">
                 <Image src={assets.user_icon} alt="user icon" className='w-4 h-4' />
            </button>
        )}
      </ul>

      <div className="flex items-center md:hidden gap-5">
        {isSeller && <button onClick={() => router.push('/seller')} className="text-xs border px-4 py-1.5 rounded-full">Seller Dashboard</button>}
        {isAdmin && <button onClick={() => router.push('/admin')} className="text-xs border px-4 py-1.5 rounded-full">Admin Panel</button>}
        <Link href={'/all-products?focus=search'}>
            <Image className="w-5 h-5 cursor-pointer" src={assets.search_icon} alt="search icon" />
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
            <div className="relative" ref={dropdownRef}>
                <button onClick={() => setIsDropdownOpen(prev => !prev)} className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 transition">
                     <span className="text-sm font-medium text-gray-600">{userData.name?.[0]}</span>
                </button>
                {isDropdownOpen && (
                     <div className="absolute right-0 mt-2 w-64 bg-white border rounded-md shadow-lg z-10">
                        <div className="p-4 border-b">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-lg font-medium text-gray-600">{userData.name?.[0]}</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">{userData.name}</p>
                                    <p className="text-xs text-gray-500">{userData.email}</p>
                                </div>
                            </div>
                        </div>
                        <ul className="py-2">
                             <li>
                                <Link href="/manage-account" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <Settings className="w-5 h-5 text-gray-600" />
                                    <span>Manage account</span>
                                </Link>
                            </li>
                             <li>
                                <Link href="/" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <HomeIcon />
                                    <span>Home</span>
                                </Link>
                            </li>
                             <li>
                                <Link href="/all-products" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <BoxIcon />
                                    <span>Products</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/cart" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <CartIcon />
                                    <span>Cart</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/my-orders" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <BagIcon />
                                    <span>My Orders</span>
                                </Link>
                            </li>
                            {isSeller && (
                                <li>
                                    <Link href="/seller/wallet" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        <Wallet className="w-5 h-5 text-gray-600" />
                                        <span>My Wallet</span>
                                    </Link>
                                </li>
                            )}
                            <div className="h-px bg-gray-200 my-2"></div>
                            <li>
                                <button onClick={() => { handleLogout(); setIsDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <LogOut className="w-5 h-5 text-gray-600" />
                                    <span>Sign out</span>
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        ) : (
             <button onClick={handleLoginClick} className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition">
                 <Image src={assets.user_icon} alt="user icon" className='w-4 h-4' />
            </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

    