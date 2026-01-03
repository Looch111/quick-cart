
'use client'
import React from 'react'
import { assets } from '../../assets/assets'
import Image from 'next/image'
import { useAppContext } from '@/context/AppContext'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut } from 'lucide-react'

const Navbar = () => {

  const { router, handleLogout } = useAppContext()
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', path: '/seller' },
    { name: 'Add Product', path: '/seller/add-product' },
    { name: 'Product List', path: '/seller/product-list' },
    { name: 'Orders', path: '/seller/orders' },
    { name: 'Wallet', path: '/seller/wallet' },
  ];

  const onLogout = () => {
    handleLogout();
    router.push('/');
  }

  return (
    <div className='flex items-center px-4 md:px-8 py-3 justify-between border-b'>
      <Image onClick={() => router.push('/')} className='w-28 lg:w-32 cursor-pointer' src={assets.logo} alt="" />
      <div className='flex items-center gap-4 md:gap-8'>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link href={item.path} key={item.name} className={`hover:text-gray-900 transition ${isActive ? "text-orange-600 font-medium" : ""}`}>
              {item.name}
            </Link>
          )
        })}
      </div>
      <button onClick={onLogout} className='flex items-center gap-2 bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm'>
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </div>
  )
}

export default Navbar
