'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAppContext } from '@/context/AppContext';
import toast from 'react-hot-toast';
import { Wallet, History, DollarSign } from 'lucide-react';
import Loading from '@/components/Loading';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import PaymentCancellationModal from '@/components/PaymentCancellationModal';

const WalletPage = () => {
    const { userData, walletBalance, walletTransactions, setShowLogin, router, currency, verifyFlutterwaveTransaction } = useAppContext();
    const [amount, setAmount] = useState('');
    const [isDepositing, setIsDepositing] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

    useEffect(() => {
        if (userData === null) {
           router.push('/');
           setShowLogin(true);
        }
    }, [userData, router, setShowLogin]);
    
    const flutterwaveConfig = {
        public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
        tx_ref: `QUICKCART-WALLET-${userData?._id}-${Date.now()}`,
        amount: Number(amount),
        currency: 'NGN',
        payment_options: 'card,mobilemoney,ussd',
        customer: {
            email: userData?.email,
            name: userData?.name,
        },
        meta: {
            user_id: userData?._id,
            type: 'wallet-funding'
        },
        customizations: {
            title: 'Wallet Deposit',
            description: 'Add funds to your QuickCart wallet',
            logo: 'https://st2.depositphotos.com/4403291/7418/v/450/depositphotos_74189661-stock-illustration-online-shop-log.jpg',
        },
    };

    const handleFlutterwavePayment = useFlutterwave(flutterwaveConfig);

    const executeDeposit = () => {
        handleFlutterwavePayment({
            callback: async (response) => {
                setIsDepositing(true);
                toast.loading('Verifying your payment...');

                const verificationResponse = await verifyFlutterwaveTransaction(response.transaction_id, userData._id);
                
                toast.dismiss();

                if (verificationResponse.success && verificationResponse.data.status === 'successful') {
                     if (verificationResponse.data.amount === Number(amount)) {
                        toast.success('Payment successful! Your balance has been updated.');
                        setAmount('');
                    } else {
                        toast.error('Payment amount mismatch. Please contact support.');
                    }
                } else {
                    toast.error(verificationResponse.message || 'Payment verification failed. Please contact support if you were charged.');
                }
                closePaymentModal();
                setIsDepositing(false);
            },
            onClose: () => {
                setIsDepositing(false);
                if(!isDepositing) { // Avoid showing modal if callback is processing
                    setShowCancelModal(true);
                }
            },
        });
    }

    const handleDeposit = () => {
        const depositAmount = Number(amount);
        if (!depositAmount || depositAmount <= 0) {
            toast.error('Please enter a valid amount.');
            return;
        }
        executeDeposit();
    };

     if (userData === undefined) {
        return <Loading />;
    }

    const sortedTransactions = [...walletTransactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <>
            <Navbar />
            <div className="flex flex-col items-center justify-center px-4 md:px-16 lg:px-32 min-h-screen pt-28 pb-16 bg-gray-50">
                <div className="w-full max-w-5xl">
                     <div className="flex flex-col items-start mb-10">
                        <h1 className="text-3xl font-bold text-gray-800">My Wallet</h1>
                        <p className="text-gray-500 mt-1">View your balance and transaction history.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="bg-green-100 text-green-600 p-4 rounded-full">
                                    <Wallet className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700">Current Balance</h3>
                                    <p className="text-3xl lg:text-4xl font-bold text-gray-900">{currency}{walletBalance.toFixed(2)}</p>
                                </div>
                            </div>
                            
                            <hr className="my-6" />

                            <h2 className="text-lg font-semibold text-gray-700 mb-4">Deposit Funds</h2>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="amount" className="text-sm font-medium text-gray-700">
                                        Amount ({flutterwaveConfig.currency})
                                    </label>
                                    <div className="relative mt-1">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="h-5 w-5 text-gray-400">{currency}</span>
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
                                    className="w-full bg-orange-600 text-white py-2.5 rounded-md hover:bg-orange-700 transition font-semibold disabled:bg-orange-400"
                                    disabled={isDepositing}
                                >
                                    {isDepositing ? 'Processing...' : 'Deposit with Flutterwave'}
                                </button>
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

                                {/* Mobile View: Cards */}
                                <div className="space-y-4 md:hidden">
                                     {sortedTransactions.length > 0 ? sortedTransactions.map(tx => (
                                        <div key={tx.id} className="flex justify-between items-center border-b pb-3 last:border-b-0">
                                            <div>
                                                <p className={`font-medium capitalize ${tx.type === 'Payment' ? 'text-red-600' : 'text-green-600'}`}>{tx.type}</p>
                                                <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleString()}</p>
                                            </div>
                                            <p className={`font-semibold text-lg ${tx.type === 'Payment' ? 'text-red-600' : 'text-green-600'}`}>
                                                {tx.type === 'Payment' ? '-' : '+'}{currency}{Math.abs(tx.amount).toFixed(2)}
                                            </p>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-gray-500 text-center py-4">No transactions yet.</p>
                                    )}
                                </div>
                                
                                {/* Desktop View: Table */}
                                <div className="hidden md:block max-h-96 overflow-y-auto">
                                    {sortedTransactions.length > 0 ? (
                                        <table className="min-w-full text-sm text-left">
                                            <tbody>
                                                {sortedTransactions.map(tx => (
                                                    <tr key={tx.id} className="border-b last:border-b-0">
                                                        <td className="py-2">
                                                            <p className={`font-medium capitalize ${tx.type === 'Payment' ? 'text-red-600' : 'text-green-600'}`}>{tx.type}</p>
                                                            <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString()}</p>
                                                        </td>
                                                        <td className={`py-2 text-right font-semibold ${tx.type === 'Payment' ? 'text-red-600' : 'text-green-600'}`}>
                                                          {tx.type === 'Payment' ? '-' : '+'}{currency}{Math.abs(tx.amount).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="text-sm text-gray-500 text-center py-4">No transactions yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
            <PaymentCancellationModal
                show={showCancelModal}
                onCancel={() => setShowCancelModal(false)}
                onResume={() => {
                    setShowCancelModal(false);
                    handleDeposit();
                }}
            />
        </>
    );
};

export default WalletPage;
