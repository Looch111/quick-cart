'use client'
import { assets } from '@/assets/assets'
import { useAppContext } from '@/context/AppContext'
import Image from 'next/image'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

const VerifyWalletFunding = () => {
  const { router } = useAppContext();
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const tx_ref = searchParams.get('tx_ref');

  useEffect(() => {
    if (status === 'successful') {
        toast.success("Payment successful! Your wallet will be updated shortly.");
    } else {
        toast.error("Payment was not successful. Please try again.");
    }
    
    const timer = setTimeout(() => {
      router.push('/wallet');
    }, 4000);

    return () => clearTimeout(timer);
  }, [status, router]);

  return (
    <div className='h-screen flex flex-col justify-center items-center gap-5 text-center px-4'>
      <div className="relative flex justify-center items-center mb-4">
        <div className="animate-spin rounded-full h-28 w-28 border-4 border-t-orange-400 border-gray-200"></div>
        <Image className="absolute p-5 h-20 w-20" src={assets.logo} alt='QuickCart Logo' />
      </div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Verifying Your Payment...</h1>
      <p className="text-gray-600 max-w-md">
        Please wait while we confirm your transaction. Your wallet balance will be updated automatically upon successful verification.
      </p>
      
      <p className="text-gray-500 mt-4">
        Redirecting you to <Link href="/wallet" className="text-orange-600 hover:underline font-medium">My Wallet</Link>...
      </p>
    </div>
  );
}

export default VerifyWalletFunding;
