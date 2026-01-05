'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAppContext } from '@/context/AppContext';
import toast from 'react-hot-toast';
import { Wallet, History, PlusCircle } from 'lucide-react';
import Loading from '@/components/Loading';
import { fundWalletAction } from '@/app/actions/walletActions';

const WalletPage = () => {
    const { userData, walletBalance, walletTransactions, setShowLogin, router, currency } = useAppContext();
    const [topUpAmount, setTopUpAmount] = useState('');
    const [isFunding, setIsFunding] = useState(false);

    useEffect(() => {
        if (!userData) {
           router.push('/');
           setShowLogin(true);
        }
    }, [userData, router, setShowLogin]);

    const handleFundWallet = async (e) => {
        e.preventDefault();
        const amount = parseFloat(topUpAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid amount.");
            return;
        }

        if (!userData) {
            toast.error("Please log in to fund your wallet.");
            setShowLogin(true);
            return;
        }
        
        setIsFunding(true);
        try {
            const result = await fundWalletAction({
                amount,
                userId: userData._id,
                email: userData.email,
            });

            if (result.success && result.paymentLink) {
                router.push(result.paymentLink);
            } else {
                throw new Error(result.message || "Failed to create payment link.");
            }
        } catch (error) {
            toast.error(error.message || 'An error occurred while trying to fund your wallet.');
        } finally {
            setIsFunding(false);
            setTopUpAmount('');
        }
    };

     if (!userData) {
        return <Loading />;
    }

    return (
        <>
            <Navbar />
            <div className="flex flex-col items-center justify-center px-6 md:px-16 lg:px-32 min-h-screen pt-28 pb-16">
                <div className="w-full max-w-4xl">
                     <div className="flex flex-col items-start mb-10">
                        <h1 className="text-3xl font-bold text-gray-800">My Wallet</h1>
                        <p className="text-gray-500 mt-1">View your balance, top up, and see your transaction history.</p>
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
                                <form onSubmit={handleFundWallet} className="mt-8 space-y-4">
                                    <div>
                                        <label htmlFor="topup-amount" className="block text-sm font-medium text-gray-700">Top Up Wallet</label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500 sm:text-sm">{currency}</span>
                                            </div>
                                            <input
                                                type="number"
                                                name="topup-amount"
                                                id="topup-amount"
                                                className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                                                placeholder="0.00"
                                                value={topUpAmount}
                                                onChange={(e) => setTopUpAmount(e.target.value)}
                                                disabled={isFunding}
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300" disabled={isFunding}>
                                        <PlusCircle className="w-5 h-5" />
                                        {isFunding ? 'Processing...' : 'Add Funds via Flutterwave'}
                                    </button>
                                </form>
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
