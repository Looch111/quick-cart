
'use client';
import { useState, useEffect } from 'react';
import Footer from '@/components/seller/Footer';
import toast from 'react-hot-toast';
import { Wallet, Banknote, History } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import Loading from '@/components/Loading';

const WalletPage = () => {
    const { userData, walletBalance, walletTransactions, setShowLogin, router } = useAppContext();
    const [withdrawalAmount, setWithdrawalAmount] = useState('');
    const [bankDetails, setBankDetails] = useState({
        accountHolder: 'GreatStack',
        accountNumber: '**** **** **** 1234',
        bankName: 'Global Commerce Bank',
        ifscCode: 'GCB0001234'
    });

    useEffect(() => {
        if (!userData) {
           router.push('/');
           setShowLogin(true);
        }
    }, [userData, router, setShowLogin]);

    const handleWithdrawal = (e) => {
        e.preventDefault();
        const amount = parseFloat(withdrawalAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid withdrawal amount.");
            return;
        }
        if (amount > walletBalance) {
            toast.error("Insufficient balance.");
            return;
        }

        // In a real app, you would process the withdrawal here and update the balance/transactions via context
        console.log(`Withdrawal request for $${amount}`);
        toast.success(`Successfully requested withdrawal of $${amount.toFixed(2)}`);
        setWithdrawalAmount('');
    };
    
    if (!userData) {
        return <Loading />;
    }

    return (
        <div className="flex-1 min-h-screen flex flex-col justify-between bg-gray-50">
            <div className="w-full md:p-10 p-4">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">My Wallet</h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Side: Balance & Withdrawal */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                             <div className="flex items-center gap-4 mb-4">
                                <div className="bg-green-100 text-green-600 p-3 rounded-full">
                                    <Wallet className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700">Current Balance</h3>
                                    <p className="text-3xl font-bold text-gray-900">${walletBalance.toFixed(2)}</p>
                                </div>
                            </div>
                            <form onSubmit={handleWithdrawal} className="mt-6 space-y-4">
                                <div>
                                    <label htmlFor="withdrawal-amount" className="block text-sm font-medium text-gray-700">Request Withdrawal</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            name="withdrawal-amount"
                                            id="withdrawal-amount"
                                            className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                                            placeholder="0.00"
                                            value={withdrawalAmount}
                                            onChange={(e) => setWithdrawalAmount(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700">
                                    Request Withdrawal
                                </button>
                            </form>
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
                                    <History className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-700">Transaction History</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">Date</th>
                                            <th scope="col" className="px-6 py-3">Type</th>
                                            <th scope="col" className="px-6 py-3">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {walletTransactions.map(tx => (
                                            <tr key={tx.id} className="bg-white border-b">
                                                <td className="px-6 py-4">{new Date(tx.date).toLocaleDateString()}</td>
                                                <td className="px-6 py-4">{tx.type}</td>
                                                <td className={`px-6 py-4 font-medium ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {tx.amount > 0 ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Bank Details */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-purple-100 text-purple-600 p-3 rounded-full">
                                    <Banknote className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-700">Withdrawal Details</h3>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="font-medium text-gray-500">Account Holder</p>
                                    <p className="text-gray-900">{bankDetails.accountHolder}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-500">Account Number</p>
                                    <p className="text-gray-900">{bankDetails.accountNumber}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-500">Bank Name</p>
                                    <p className="text-gray-900">{bankDetails.bankName}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-500">IFSC Code</p>
                                    <p className="text-gray-900">{bankDetails.ifscCode}</p>
                                </div>
                            </div>
                            <button className="mt-6 w-full py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                Edit Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default WalletPage;
