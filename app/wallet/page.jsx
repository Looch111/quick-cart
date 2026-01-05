'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAppContext } from '@/context/AppContext';
import toast from 'react-hot-toast';
import { Wallet, History, DollarSign } from 'lucide-react';
import Loading from '@/components/Loading';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';

const WalletPage = () => {
    const { userData, walletBalance, walletTransactions, setShowLogin, router, currency, verifyFlutterwaveTransaction, depositToWallet } = useAppContext();
    const [amount, setAmount] = useState('');

    useEffect(() => {
        if (userData === null) {
           router.push('/');
           setShowLogin(true);
        }
    }, [userData, router, setShowLogin]);

    const config = {
        public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
        tx_ref: `QUICKCART-WALLET-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        currency: 'NGN',
        payment_options: 'card,mobilemoney,ussd',
        customer: {
            email: userData?.email,
            name: userData?.name,
        },
        customizations: {
            title: 'Wallet Deposit',
            description: 'Add funds to your QuickCart wallet',
            logo: 'https://st2.depositphotos.com/4403291/7418/v/450/depositphotos_74189661-stock-illustration-online-shop-log.jpg',
        },
    };

    const handleFlutterwavePayment = useFlutterwave(config);

    const handleDeposit = () => {
        if (!amount || Number(amount) <= 0) {
            toast.error('Please enter a valid amount.');
            return;
        }

        handleFlutterwavePayment({
            callback: async (response) => {
                const verificationResponse = await verifyFlutterwaveTransaction(response.transaction_id);

                if (verificationResponse.success && verificationResponse.data.status === 'successful') {
                    if (verificationResponse.data.amount === Number(amount)) {
                        const depositResponse = await depositToWallet(Number(amount), response.transaction_id);
                        if (depositResponse.success) {
                            toast.success('Funds deposited successfully!');
                            setAmount('');
                        } else {
                            toast.error(depositResponse.message || 'Failed to update wallet balance.');
                        }
                    } else {
                        toast.error('Payment amount mismatch. Please contact support.');
                    }
                } else {
                    toast.error('Payment verification failed.');
                }
                closePaymentModal();
            },
            onClose: () => {},
            amount: Number(amount),
        });
    };

     if (userData === undefined) {
        return <Loading />;
    }

    return (
        <>
            <Navbar />
            <div className="flex flex-col items-center justify-center px-6 md:px-16 lg:px-32 min-h-screen pt-28 pb-16">
                <div className="w-full max-w-4xl">
                     <div className="flex flex-col items-start mb-10">
                        <h1 className="text-3xl font-bold text-gray-800">My Wallet</h1>
                        <p className="text-gray-500 mt-1">View your balance and transaction history.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="bg-green-100 text-green-600 p-4 rounded-full">
                                        <Wallet className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-700">Current Balance</h3>
                                        <p className="text-4xl font-bold text-gray-900">{currency}{walletBalance.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h2 className="text-lg font-semibold text-gray-700 mb-4">Deposit Funds</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="amount" className="text-sm font-medium text-gray-700">
                                            Amount (NGN)
                                        </label>
                                        <div className="relative mt-1">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <DollarSign className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="number"
                                                name="amount"
                                                id="amount"
                                                className="block w-full rounded-md border-gray-300 pl-10 focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                                                placeholder="0.00"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleDeposit}
                                        className="w-full bg-orange-600 text-white py-2.5 rounded-md hover:bg-orange-700 transition font-semibold"
                                    >
                                        Deposit with Flutterwave
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
                                        <History className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-700">Transaction History</h3>
                                </div>
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {walletTransactions.length > 0 ? walletTransactions.map(tx => (
                                        <div key={tx.id} className="flex justify-between items-center border-b pb-2">
                                            <div>
                                                <p className={`font-medium ${tx.type === 'Payment' ? 'text-red-600' : 'text-green-600'}`}>{tx.type}</p>
                                                <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleString()}</p>
                                            </div>
                                            <p className={`font-semibold ${tx.type === 'Payment' ? 'text-red-600' : 'text-green-600'}`}>
                                                {tx.type === 'Payment' ? '-' : '+'}{currency}{Math.abs(tx.amount).toFixed(2)}
                                            </p>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-gray-500 text-center py-4">No transactions yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default WalletPage;
