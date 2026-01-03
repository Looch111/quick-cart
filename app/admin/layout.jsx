'use client'
import Navbar from '@/components/admin/Navbar'
import React from 'react'

const Layout = ({ children }) => {
  return (
    <div>
      <Navbar />
      <div className='w-full'>
        {children}
      </div>
    </div>
  )
}

export default Layout
