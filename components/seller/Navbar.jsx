'use client'
import React, { useState, useRef, useEffect } from 'react'
import { assets } from '../../assets/assets'
import Image from 'next/image'
import { useAppContext } from '@/context/AppContext'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, Menu, X } from 'lucide-react'
import NotificationPanel from '../NotificationPanel'
import { useCollection } from '@/src/firebase'

const Navbar = () => {

  const { router, handleLogout, userData } = useAppContext()
  const { data: allOrders } = useCollection('orders');
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasNewOrders, setHasNewOrders] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (allOrders && userData) {
        const newSellerOrders = allOrders.some(order => 
            order.items.some(item => item.sellerId === userData._id && item.status === 'Processing')
        );
        setHasNewOrders(newSellerOrders);
    } else {
        setHasNewOrders(false);
    }
  }, [allOrders, userData]);

  const menuItems = [
    { name: 'Dashboard', path: '/seller' },
    { name: 'Add Product', path: '/seller/add-product' },
    { name: 'Product List', path: '/seller/product-list' },
    { name: 'Orders', path: '/seller/orders', notification: hasNewOrders },
    { name: 'Wallet', path: '/seller/wallet' },
  ];

  const onLogout = () => {
    handleLogout();
    router.push('/');
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  return (
    <div ref={menuRef} className='flex items-center px-4 md:px-8 py-3 justify-between border-b fixed top-0 left-0 w-full bg-white z-50'>
      <Link href="/">
        <Image className='cursor-pointer w-32 md:w-[170px]' src={assets.logo} alt="" width={170} height={45}/>
      </Link>
      
      {/* Desktop Menu */}
      <div className='hidden md:flex items-center gap-4 lg:gap-8'>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link href={item.path} key={item.name} className={`relative hover:text-gray-900 transition ${isActive ? "text-orange-600 font-medium" : ""}`}>
              {item.name}
              {item.notification && (
                <span className="absolute -top-0.5 -right-2.5 w-2 h-2 bg-red-500 rounded-full blinking-dot"></span>
              )}
            </Link>
          )
        })}
      </div>

      <div className='flex items-center gap-4'>
        <NotificationPanel />
        <button onClick={onLogout} className='flex items-center gap-2 bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm'>
          <LogOut className="w-4 h-4" />
          <span className='hidden sm:inline'>Logout</span>
        </button>

        {/* Mobile Menu Button */}
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 rounded-md hover:bg-gray-100 relative">
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          {hasNewOrders && !isMenuOpen && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full blinking-dot"></span>
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-lg md:hidden z-40 border-t">
            <div className='flex flex-col p-4 gap-2'>
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link 
                  href={item.path} 
                  key={item.name} 
                  onClick={() => setIsMenuOpen(false)}
                  className={`relative hover:text-gray-900 transition px-3 py-2 rounded-md text-base ${isActive ? "bg-orange-100 text-orange-600 font-medium" : ""}`}
                >
                  {item.name}
                  {item.notification && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full blinking-dot"></span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default Navbar
