'use client'
import SellerNavbar from '@/components/seller/Navbar'
import { useAppContext } from '@/context/AppContext'
import Loading from '@/components/Loading'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const Layout = ({ children }) => {
  const { isSeller, isAdmin, userData } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    // If userData is loaded and the user is neither a seller nor an admin, redirect them.
    if (userData !== undefined && !isSeller && !isAdmin) {
      router.push('/');
    }
  }, [userData, isSeller, isAdmin, router]);

  // If user data is not yet loaded, or if they don't have the right role, show a loading state
  if (userData === undefined || (userData && !isSeller && !isAdmin)) {
    return <Loading />;
  }

  // If user has the correct role, show the layout
  return (
    <div>
      <SellerNavbar />
      <div className='w-full pt-16'>
        {children}
      </div>
    </div>
  )
}

export default Layout
