'use client'
import Navbar from '@/components/admin/Navbar'
import React, { useEffect } from 'react'
import { useAppContext } from '@/context/AppContext'
import Loading from '@/components/Loading'
import { useRouter } from 'next/navigation'

const Layout = ({ children }) => {
  const { isAdmin, userData } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    // If userData is loaded and the user is not an admin, redirect them.
    if (userData !== undefined && userData !== null && !isAdmin) {
      router.push('/');
    }
  }, [userData, isAdmin, router]);

  // If user data is not yet loaded, show a loading state
  if (userData === undefined || (userData && !isAdmin)) {
    return <Loading />;
  }

  // If user is not logged in at all
  if (!userData) {
      router.push('/');
      return <Loading />;
  }

  return (
    <div>
      <Navbar />
      <div className='w-full pt-16'>
        {children}
      </div>
    </div>
  )
}

export default Layout
