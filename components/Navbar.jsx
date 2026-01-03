'use client'
import React from "react";
import { assets} from "@/assets/assets";
import Link from "next/link"
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { Heart, ShoppingCart } from "lucide-react";

const Navbar = () => {

  const { isSeller, router, getWishlistCount, getCartCount, setShowLogin, userData } = useAppContext();

  const wishlistCount = getWishlistCount();
  const cartCount = getCartCount();

  const handleAccountClick = () => {
    if (userData) {
      router.push('/manage-account');
    } else {
      setShowLogin(true);
    }
  }

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

      <div className="flex items-center gap-4 md:gap-6">
         {isSeller && <button onClick={() => router.push('/seller')} className="hidden md:block text-xs border px-4 py-1.5 rounded-full hover:bg-gray-50">Seller Dashboard</button>}
        <Link href="/wishlist" className="relative hidden md:block">
          <Heart className="w-5 h-5" />
          {wishlistCount > 0 && <span className="absolute -top-1 -right-2 bg-orange-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">{wishlistCount}</span>}
        </Link>
         <Link href="/cart" className="relative hidden md:block">
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && <span className="absolute -top-1 -right-2 bg-orange-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">{cartCount}</span>}
        </Link>
        <button onClick={handleAccountClick} className="hidden md:flex items-center gap-2 hover:text-gray-900 transition">
          <Image src={assets.user_icon} alt="user icon" />
          Account
        </button>

         {/* Mobile View */}
        <div className="flex items-center gap-3 md:hidden">
          {isSeller && <button onClick={() => router.push('/seller')} className="text-xs border px-4 py-1.5 rounded-full">Seller</button>}
          <Link href="/wishlist" className="relative">
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && <span className="absolute -top-1 -right-2 bg-orange-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">{wishlistCount}</span>}
          </Link>
          <Link href="/cart" className="relative">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && <span className="absolute -top-1 -right-2 bg-orange-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">{cartCount}</span>}
          </Link>
          <button onClick={handleAccountClick} className="flex items-center gap-2 hover:text-gray-900 transition">
            <Image src={assets.user_icon} alt="user icon" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
