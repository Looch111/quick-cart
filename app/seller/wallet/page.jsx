
'use client';
import { useState, useEffect } from 'react';
import Footer from '@/components/seller/Footer';
import toast from 'react-hot-toast';
import { Wallet, Banknote, History, Edit, Save } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import Loading from '@/components/Loading';

const WalletPage = () => {
    const { userData, sellerWalletBalance, sellerWalletTransactions, setShowLogin, router, currency, updateSellerBankDetails, requestWithdrawal } = useAppContext();
    const [withdrawalAmount, setWithdrawalAmount] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [bankDetails, setBankDetails] = useState({
        accountHolder: '',
        accountNumber: '',
        bankName: '',
        ifscCode: ''
    });

    useEffect(() => {
        if (userData === null) {
           router.push('/');
           setShowLogin(true);
        } else if (userData?.sellerWallet?.bankDetails) {
            setBankDetails(userData.sellerWallet.bankDetails);
        }
    }, [userData, router, setShowLogin]);

    const handleWithdrawal = async (e) => {
        e.preventDefault();
        const amount = parseFloat(withdrawalAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid withdrawal amount.");
            return;
        }
        if (amount > sellerWalletBalance) {
            toast.error("Insufficient balance.");
            return;
        }
        if (!bankDetails.accountNumber || !bankDetails.bankName) {
            toast.error("Please complete your bank details before withdrawing.");
            return;
        }

        setIsWithdrawing(true);
        const success = await requestWithdrawal(amount, bankDetails);
        if (success) {
            setWithdrawalAmount('');
        }
        setIsWithdrawing(false);
    };
    
    const handleBankDetailsSave = () => {
        if (!bankDetails.accountHolder || !bankDetails.accountNumber || !bankDetails.bankName || !bankDetails.ifscCode) {
            toast.error("Please fill all bank detail fields.");
            return;
        }
        updateSellerBankDetails(bankDetails);
        setIsEditing(false);
    }

    if (userData === undefined) {
        return <Loading />;
    }

    const sortedTransactions = [...sellerWalletTransactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="flex-1 min-h-screen flex flex-col justify-between bg-gray-50">
            <div className="w-full md:p-10 p-4">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Seller Wallet</h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                             <div className="flex items-center gap-4 mb-4">
                                <div className="bg-green-100 text-green-600 p-3 rounded-full">
                                    <Wallet className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700">Available for Withdrawal</h3>
                                    <p className="text-3xl font-bold text-gray-900">{currency}{sellerWalletBalance.toFixed(2)}</p>
                                </div>
                            </div>
                            <form onSubmit={handleWithdrawal} className="mt-6 space-y-4">
                                <div>
                                    <label htmlFor="withdrawal-amount" className="block text-sm font-medium text-gray-700">Request Withdrawal</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">{currency}</span>
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
                                <button type="submit" className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400" disabled={isWithdrawing}>
                                    {isWithdrawing ? 'Processing...' : 'Request Withdrawal'}
                                </button>
                            </form>
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
                                    <History className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-700">Earnings History</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">Date</th>
                                            <th scope="col" className="px-6 py-3">Type</th>
                                            <th scope="col" className="px-6 py-3 text-right">Gross Sale</th>
                                            <th scope="col" className="px-6 py-3 text-right">Commission</th>
                                            <th scope="col" className="px-6 py-3 text-right">Net Earnings</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedTransactions.map(tx => (
                                            <tr key={tx.id} className="bg-white border-b">
                                                <td className="px-6 py-4">{new Date(tx.date).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 capitalize">{tx.type}</td>
                                                 {tx.type === 'Sale' ? (
                                                    <>
                                                        <td className="px-6 py-4 text-right">{currency}{(tx.grossSale || 0).toFixed(2)}</td>
                                                        <td className="px-6 py-4 text-right text-red-500">-{currency}{(tx.commission || 0).toFixed(2)}</td>
                                                        <td className="px-6 py-4 font-medium text-right text-green-600">+{currency}{(tx.netEarnings || 0).toFixed(2)}</td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td colSpan="2" className='px-6 py-4 text-right'></td>
                                                        <td className="px-6 py-4 font-medium text-right text-red-600">-{currency}{Math.abs(tx.amount || 0).toFixed(2)}</td>
                                                    </>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center justify-between gap-4 mb-4">
                               <div className="flex items-center gap-4">
                                 <div className="bg-purple-100 text-purple-600 p-3 rounded-full">
                                    <Banknote className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-700">Withdrawal Details</h3>
                               </div>
                                {isEditing ? (
                                    <button onClick={handleBankDetailsSave} className="p-2 rounded-full hover:bg-green-100 text-green-600">
                                        <Save className='w-5 h-5' />
                                    </button>
                                ) : (
                                    <button onClick={() => setIsEditing(true)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                                        <Edit className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                            <div className="space-y-4 text-sm">
                                <div>
                                    <label className="font-medium text-gray-500">Account Holder</label>
                                    <input type="text" value={bankDetails.accountHolder} onChange={e => setBankDetails({...bankDetails, accountHolder: e.target.value})} disabled={!isEditing} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"/>
                                </div>
                                 <div>
                                    <label className="font-medium text-gray-500">Account Number</label>
                                    <input type="text" value={bankDetails.accountNumber} onChange={e => setBankDetails({...bankDetails, accountNumber: e.target.value})} disabled={!isEditing} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"/>
                                </div>
                                 <div>
                                    <label className="font-medium text-gray-500">Bank Name</label>
                                    <input type="text" value={bankDetails.bankName} onChange={e => setBankDetails({...bankDetails, bankName: e.target.value})} disabled={!isEditing} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"/>
                                </div>
                                 <div>
                                    <label className="font-medium text-gray-500">IFSC Code</label>
                                    <input type="text" value={bankDetails.ifscCode} onChange={e => setBankDetails({...bankDetails, ifscCode: e.target.value})} disabled={!isEditing} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default WalletPage;

    

    