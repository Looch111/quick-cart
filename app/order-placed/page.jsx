'use client'
import { assets } from '@/assets/assets'
import { useAppContext } from '@/context/AppContext'
import Image from 'next/image'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const OrderPlaced = () => {
  const { router } = useAppContext();
  const searchParams = useSearchParams();
  const tx_ref = searchParams.get('tx_ref');

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/my-orders');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className='h-screen flex flex-col justify-center items-center gap-5 text-center px-4'>
      <div className="relative flex justify-center items-center mb-4">
        <div className="animate-spin rounded-full h-28 w-28 border-4 border-t-green-400 border-gray-200"></div>
        <Image className="absolute p-5 h-20 w-20" src={assets.checkmark} alt='Checkmark' />
      </div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Order Placed Successfully!</h1>
      <p className="text-gray-600 max-w-md">
        Thank you for your purchase. Your order is being processed. You will be redirected to your orders page shortly.
      </p>
      {tx_ref && (
        <p className="text-sm text-gray-500 mt-2">
          Transaction Reference: {tx_ref}
        </p>
      )}
      <p className="text-gray-500 mt-4">
        Redirecting you to <Link href="/my-orders" className="text-orange-600 hover:underline font-medium">My Orders</Link>...
      </p>
    </div>
  );
}

export default OrderPlaced
