'use client'
import { assets } from '@/assets/assets'
import { useAppContext } from '@/context/AppContext'
import Image from 'next/image'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { verifyTransactionAction } from '@/app/actions/walletActions'

const VerifyWalletFunding = () => {
  const { router } = useAppContext();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Verifying Your Payment...");
  const [isSuccess, setIsSuccess] = useState(null);

  const verifyPayment = useCallback(async () => {
    const status = searchParams.get('status');
    const transaction_id = searchParams.get('transaction_id');

    if (status === 'cancelled') {
        toast.error("Payment was cancelled.");
        setMessage("Payment Cancelled.");
        setIsSuccess(false);
        return;
    }
    
    if (status === 'successful' && transaction_id) {
        try {
            const result = await verifyTransactionAction({ transaction_id });

            if (result.success) {
                toast.success("Payment successful! Your wallet has been updated.");
                setMessage("Payment Verified & Wallet Funded!");
                setIsSuccess(true);
            } else {
                toast.error(result.message || "Payment verification failed.");
                setMessage(result.message || "Payment Verification Failed.");
                setIsSuccess(false);
            }
        } catch (error) {
            toast.error("An error occurred during verification.");
            setMessage("Verification Error.");
            setIsSuccess(false);
        }
    } else {
        toast.error("Invalid transaction details.");
        setMessage("Invalid transaction details.");
        setIsSuccess(false);
    }
  }, [searchParams]);

  useEffect(() => {
    verifyPayment().finally(() => {
        setTimeout(() => {
            router.push('/wallet');
        }, 4000);
    });
  }, [verifyPayment, router]);

  return (
    <div className='h-screen flex flex-col justify-center items-center gap-5 text-center px-4'>
      <div className="relative flex justify-center items-center mb-4">
         <div className={`animate-spin rounded-full h-28 w-28 border-4 ${isSuccess === true ? 'border-t-green-500' : isSuccess === false ? 'border-t-red-500' : 'border-t-orange-400'} border-gray-200`}></div>
        <Image className="absolute p-5 h-20 w-20" src={assets.logo} alt='QuickCart Logo' />
      </div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{message}</h1>
      <p className="text-gray-600 max-w-md">
        Please wait while we confirm your transaction. You will be redirected shortly.
      </p>
      
      <p className="text-gray-500 mt-4">
        Redirecting you to <Link href="/wallet" className="text-orange-600 hover:underline font-medium">My Wallet</Link>...
      </p>
    </div>
  );
}

export default VerifyWalletFunding;
