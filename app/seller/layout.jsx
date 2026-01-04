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

  // Determine which navbar to show.
  // If the user is an admin and not a seller, show the admin navbar.
  // This allows admins to access seller pages like 'add-product' without being a seller.
  // Otherwise, default to the seller navbar.
  const NavbarToShow = isAdmin && !isSeller ? AdminNavbar : SellerNavbar;

  return (
    <div>
      <NavbarToShow />
      <div className='w-full'>
        {children}
      </div>
    </div>
  )
}

export default Layout
