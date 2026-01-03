'use client'
import React, { useState, useRef, useEffect } from "react";
import { assets, HomeIcon, BoxIcon, BagIcon, CartIcon } from "@/assets/assets";
import Link from "next/link"
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { Heart, ShoppingCart, User, Settings, LogOut, Package, Search, X, Wallet, ShieldCheck } from "lucide-react";

const Navbar = () => {

  const { isSeller, isAdmin, router, getWishlistCount, getCartCount, setShowLogin, userData, handleLogout } = useAppContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const wishlistCount = getWishlistCount();
  const cartCount = getCartCount();

  const handleAccountClick = () => {
    if (userData) {
      setIsDropdownOpen(prev => !prev);
    } else {
      setShowLogin(true);
    }
  }

  const onLogout = () => {
    handleLogout();
    setIsDropdownOpen(false);
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);


  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-32 py-3 border-b border-gray-300 text-gray-700 fixed w-full bg-white top-0 z-40">
      <Link href="/">
        <Image
          className="cursor-pointer w-28 md:w-32"
          src={assets.logo}
          alt="logo"
        />
      </Link>
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

      </div>

      <div className="flex items-center gap-4 md:gap-5">
        <Link href="/all-products?focus=search" className="hover:text-gray-900 transition">
          <Search className="w-5 h-5" />
        </Link>
        <Link href="/wishlist" className="relative">
          <Heart className="w-5 h-5" />
          {wishlistCount > 0 && <span className="absolute -top-1 -right-2 bg-orange-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">{wishlistCount}</span>}
        </Link>
        <Link href="/cart" className="relative">
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && <span className="absolute -top-1 -right-2 bg-orange-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">{cartCount}</span>}
        </Link>

        <div className="relative" ref={dropdownRef}>
          <button onClick={handleAccountClick} className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition">
            {userData ? (
                userData.name ? (
                    <span className="text-gray-600 font-medium">{userData.name[0]}</span>
                ) : userData.email ? (
                    <span className="text-gray-600 font-medium">{userData.email[0]}</span>
                ) : (
                    <User className="w-5 h-5 text-gray-600" />
                )
            ) : (
                <User className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {isDropdownOpen && userData && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200/80 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    {userData.name ? (
                        <span className="text-lg font-medium text-gray-600">{userData.name[0]}</span>
                    ) : userData.email ? (
                        <span className="text-lg font-medium text-gray-600">{userData.email[0]}</span>
                    ) : (
                        <User className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{userData.name || userData.email}</p>
                    <p className="text-xs text-gray-500">{userData.email}</p>
                  </div>
                </div>
                <button onClick={() => setIsDropdownOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                </button>
              </div>
              <div className="py-2">
                <Link onClick={() => setIsDropdownOpen(false)} href="/manage-account" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100">
                  <Settings className="w-5 h-5 text-gray-500" />
                  Manage account
                </Link>
                <Link onClick={() => setIsDropdownOpen(false)} href="/wallet" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100">
                  <Wallet className="w-5 h-5 text-gray-500" />
                  My Wallet
                </Link>
                <Link onClick={() => setIsDropdownOpen(false)} href="/" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 md:hidden">
                  <HomeIcon />
                  Home
                </Link>
                <Link onClick={() => setIsDropdownOpen(false)} href="/all-products" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 md:hidden">
                  <BoxIcon />
                  Products
                </Link>
                <Link onClick={() => setIsDropdownOpen(false)} href="/cart" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 md:hidden">
                  <CartIcon />
                  Cart
                </Link>
                <Link onClick={() => setIsDropdownOpen(false)} href="/my-orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100">
                  <BagIcon />
                  My Orders
                </Link>
                {isSeller &&
                  <Link onClick={() => setIsDropdownOpen(false)} href="/seller" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100">
                    <Package className="w-5 h-5 text-gray-500" />
                    Seller Dashboard
                  </Link>
                }
                 {isAdmin &&
                  <Link onClick={() => setIsDropdownOpen(false)} href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100">
                    <ShieldCheck className="w-5 h-5 text-gray-500" />
                    Admin Dashboard
                  </Link>
                }
              </div>
              <div className="border-t border-gray-200">
                <button onClick={onLogout} className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100">
                  <LogOut className="w-5 h-5 text-gray-500" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
