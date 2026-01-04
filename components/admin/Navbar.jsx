'use client'
import React, { useEffect, useState } from 'react'
import { assets } from '@/assets/assets'
import Image from 'next/image'
import { useAppContext } from '@/context/AppContext'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut } from 'lucide-react'

const Navbar = () => {

  const { router, allOrders, handleLogout } = useAppContext()
  const pathname = usePathname()
  const [hasNewOrders, setHasNewOrders] = useState(false);

  useEffect(() => {
    if (allOrders.length > 0) {
      const newOrders = allOrders.filter(order => order.status === "Processing" || order.status === "Order Placed");
      setHasNewOrders(newOrders.length > 0);
    } else {
      setHasNewOrders(false);
    }
  }, [allOrders]);

  const menuItems = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Users', path: '/admin/users' },
    { name: 'Products', path: '/admin/products' },
    { name: 'Add Product', path: '/admin/add-product' },
    { name: 'Orders', path: '/admin/orders', notification: hasNewOrders },
    { name: 'Promotions', path: '/admin/promotions' },
    { name: 'Marketing', path: '/admin/marketing' },
    { name: 'Settings', path: '/admin/settings' },
  ];

  const onLogout = () => {
    handleLogout();
    router.push('/');
  }

  return (
    <div className='flex items-center px-4 md:px-8 py-3 justify-between border-b fixed top-0 left-0 w-full bg-white z-50'>
      <Link href="/">
        <Image className='w-28 lg:w-32 cursor-pointer' src={assets.logo} alt="" />
      </Link>
      <div className='hidden lg:flex items-center gap-4 md:gap-8'>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link href={item.path} key={item.name} className={`relative hover:text-gray-900 transition px-2 py-1 rounded-md ${isActive ? "bg-orange-100 text-orange-600 font-medium" : ""}`}>
              {item.name}
              {item.notification && (
                <span className="absolute top-0 right-[-2px] w-2 h-2 bg-red-500 rounded-full blinking-dot"></span>
              )}
            </Link>
          )
        })}
      </div>
      <button onClick={onLogout} className='flex items-center gap-2 bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm'>
        <LogOut className="w-4 h-4" />
        Logout
      </button>
      {hasNewOrders && <audio src="https://cdn.pixabay.com/audio/2021/08/04/audio_9521327341.mp3" autoPlay ></audio>}
    </div>
  )
}

export default Navbar
