'use client'
import React, { useEffect, useState } from 'react'
import { assets, orderDummyData } from '@/assets/assets'
import Image from 'next/image'
import { useAppContext } from '@/context/AppContext'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Navbar = () => {

  const { router } = useAppContext()
  const pathname = usePathname()
  const [hasOrders, setHasOrders] = useState(false);

  useEffect(() => {
    // In a real app, you'd fetch this from your backend.
    if (orderDummyData && orderDummyData.length > 0) {
      setHasOrders(true);
    }
  }, []);

  const menuItems = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Users', path: '/admin/users' },
    { name: 'Products', path: '/admin/products' },
    { name: 'Orders', path: '/admin/orders', notification: hasOrders },
    { name: 'Promotions', path: '/admin/promotions' },
    { name: 'Marketing', path: '/admin/marketing' },
    { name: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className='flex items-center px-4 md:px-8 py-3 justify-between border-b'>
      <Image onClick={() => router.push('/')} className='w-28 lg:w-32 cursor-pointer' src={assets.logo} alt="" />
      <div className='flex items-center gap-4 md:gap-8'>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link href={item.path} key={item.name} className={`relative hover:text-gray-900 transition ${isActive ? "text-orange-600 font-medium" : ""}`}>
              {item.name}
              {item.notification && (
                <span className="absolute top-0 right-[-10px] w-2 h-2 bg-red-500 rounded-full blinking-dot"></span>
              )}
            </Link>
          )
        })}
      </div>
      <button className='bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm'>Logout</button>
      {hasOrders && <audio src="https://cdn.pixabay.com/audio/2021/08/04/audio_9521327341.mp3" autoPlay ></audio>}
    </div>
  )
}

export default Navbar
