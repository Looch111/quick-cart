'use client'
import React, { useEffect, useState, useRef } from 'react'
import { assets } from '@/assets/assets'
import Image from 'next/image'
import { useAppContext } from '@/context/AppContext'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, Menu, X } from 'lucide-react'
import NotificationPanel from '../NotificationPanel'

const Navbar = () => {

  const { router, allOrders, handleLogout } = useAppContext()
  const pathname = usePathname()
  const [hasNewOrders, setHasNewOrders] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (allOrders.length > 0) {
      const newOrders = allOrders.filter(order => order.status === "Processing" || order.status === "Order Placed");
      setHasNewOrders(newOrders.length > 0);
    } else {
      setHasNewOrders(false);
    }
  }, [allOrders]);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  const menuItems = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Orders', path: '/admin/orders', notification: hasNewOrders },
    { name: 'Products', path: '/admin/products' },
    { name: 'Users', path: '/admin/users' },
    { name: 'Marketing', path: '/admin/marketing' },
    { name: 'Promotions', path: '/admin/promotions' },
    { name: 'Settings', path: '/admin/settings' },
  ];

  const onLogout = () => {
    handleLogout();
    router.push('/');
  }

  return (
    <div ref={menuRef} className='flex items-center px-4 md:px-8 py-3 justify-between border-b fixed top-0 left-0 w-full bg-white z-50'>
      <Link href="/">
        <Image className='cursor-pointer w-32 md:w-[170px]' src={assets.logo} alt="" width={170} height={45}/>
      </Link>
      
      {/* Desktop Menu */}
      <div className='hidden lg:flex items-center gap-1 xl:gap-3'>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link href={item.path} key={item.name} className={`relative hover:text-gray-900 transition px-2 py-1.5 rounded-md text-sm ${isActive ? "bg-orange-100 text-orange-600 font-medium" : ""}`}>
              {item.name}
              {item.notification && (
                <span className="absolute top-1 right-0 w-2 h-2 bg-red-500 rounded-full blinking-dot"></span>
              )}
            </Link>
          )
        })}
      </div>

      <div className="flex items-center gap-4">
        <NotificationPanel />
        <button onClick={onLogout} className='flex items-center gap-2 bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm'>
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>

        {/* Mobile Menu Button */}
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 rounded-md hover:bg-gray-100">
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md lg:hidden z-40">
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

      {hasNewOrders && <audio src="https://cdn.pixabay.com/audio/2021/08/04/audio_9521327341.mp3" autoPlay ></audio>}
    </div>
  )
}

export default Navbar
