'use client'
import SellerNavbar from '@/components/seller/Navbar'
import AdminNavbar from '@/components/admin/Navbar'
import { useAppContext } from '@/context/AppContext'
import Loading from '@/components/Loading'

const Layout = ({ children }) => {
  const { isSeller, isAdmin, userData } = useAppContext();

  // If user data is not yet loaded, show a loading state
  if (userData === undefined) {
    return <Loading />;
  }

  return (
    <div>
      <SellerNavbar />
      <div className='w-full'>
        {children}
      </div>
    </div>
  )
}

export default Layout
