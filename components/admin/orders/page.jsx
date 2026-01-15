
'use client';
import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";
import Image from "next/image";
import { RotateCcw } from "lucide-react";
import DeleteConfirmationModal from "@/components/admin/DeleteConfirmationModal";
import { useCollection } from "@/src/firebase";

const Orders = () => {

    const { currency, updateOrderStatus, reverseSellerPayouts } = useAppContext();
    const { data: allOrdersData, loading: productsLoading } = useCollection('orders');

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showReverseModal, setShowReverseModal] = useState(false);
    const [orderToReverse, setOrderToReverse] = useState(null);

    useEffect(() => {
        if (!productsLoading && allOrdersData) {
            const mappedOrders = allOrdersData.map(o => ({...o, _id: o.id, date: o.date?.toDate ? o.date.toDate() : new Date(o.date) }));
            setOrders(mappedOrders.sort((a, b) => new Date(b.date) - new Date(a.date)));
            setLoading(false);
        } else if (!productsLoading && !allOrdersData) {
            setOrders([]);
            setLoading(false);
        }
        else {
            setLoading(true);
        }
    }, [allOrdersData, productsLoading]);

    const handleStatusChange = async (orderId, newStatus) => {
        const success = await updateOrderStatus(orderId, newStatus);
        if (!success) {
            // Error toasts are handled within the context function
        }
    }

    const handleReverseClick = (order) => {
        setOrderToReverse(order);
        setShowReverseModal(true);
    };

    const confirmReverse = async () => {
        if (orderToReverse) {
            await reverseSellerPayouts(orderToReverse);
        }
        setShowReverseModal(false);
        setOrderToReverse(null);
    };

    const cancelReverse = () => {
        setShowReverseModal(false);
        setOrderToReverse(null);
    };

    const getItemStatusClass = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-green-100 text-green-800';
            case 'Shipped': return 'bg-blue-100 text-blue-800';
            case 'Processing': return 'bg-yellow-100 text-yellow-800';
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'Disputed': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    const getOverallStatusClass = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-blue-100 text-blue-800';
            case 'Shipped': return 'bg-purple-100 text-purple-800';
            case 'Partially Shipped': return 'bg-cyan-100 text-cyan-800';
            case 'Processing': return 'bg-yellow-100 text-yellow-800';
            case 'Order Placed': return 'bg-indigo-100 text-indigo-800';
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'Disputed': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-gray-100 text-gray-800';
            case 'failed': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };


    return (
        <>
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
            {loading ? <Loading /> :
            <>
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Orders</h1>
                 <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Mobile View */}
                    <div className="md:hidden">
                        <div className="p-4 bg-gray-50 font-medium text-gray-600">All Orders</div>
                        {orders.map((order) => (
                            <div key={order._id} className="border-t p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="font-medium text-gray-800">#{order._id.slice(-8)}</p>
                                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getOverallStatusClass(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600 space-y-2 my-4">
                                    {order.items.map(item => (
                                        <div key={item._id} className="flex justify-between items-center text-xs">
                                            <p className="truncate pr-2">{item.name} x{item.quantity}</p>
                                            <span className={`px-2 py-0.5 rounded-full ${getItemStatusClass(item.status)}`}>{item.status}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p><span className="font-medium text-gray-700">Customer:</span> {order.address.fullName}</p>
                                    <p><span className="font-medium text-gray-700">Date:</span> {new Date(order.date).toLocaleDateString()}</p>
                                    <p><span className="font-medium text-gray-700">Total:</span> {currency}{order.amount.toFixed(2)}</p>
                                </div>
                                <div className="mt-3 flex items-center gap-2">
                                     <select 
                                        onChange={(e) => handleStatusChange(order._id, e.target.value)} 
                                        value={order.status} 
                                        className="flex-grow border border-gray-300 p-2 rounded-md outline-none focus:ring-2 focus:ring-orange-300 text-sm"
                                        disabled={order.status === 'pending' || order.status === 'failed' || order.status === 'Completed'}
                                    >
                                        <option value="Order Placed">Order Placed</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Partially Shipped">Partially Shipped</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Completed">Complete & Pay Seller</option>
                                        <option value="Disputed">Disputed</option>
                                    </select>
                                    {order.status === 'Completed' && (
                                        <button onClick={() => handleReverseClick(order)} className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200" title="Reverse Payout">
                                            <RotateCcw className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                             <thead className="bg-gray-50 text-gray-600 text-sm text-left uppercase">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Order ID</th>
                                    <th className="px-6 py-3 font-medium">Date</th>
                                    <th className="px-6 py-3 font-medium">Items</th>
                                    <th className="px-6 py-3 font-medium">Customer</th>
                                    <th className="px-6 py-3 font-medium">Total</th>
                                    <th className="px-6 py-3 font-medium">Overall Status</th>
                                    <th className="px-6 py-3 font-medium text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-gray-700">
                                {orders.map((order) => (
                                    <tr key={order._id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-800">#{order._id.slice(-8)}</td>
                                        <td className="px-6 py-4">{new Date(order.date).toLocaleDateString()}</td>
                                         <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2">
                                                {order.items.map(item => (
                                                     <div key={item._id} className="flex items-center justify-between text-xs">
                                                        <div className="flex items-center gap-2">
                                                            <Image src={item.image[0]} alt={item.name} width={24} height={24} className="w-6 h-6 object-contain rounded bg-gray-100" />
                                                            <p className="truncate pr-2">{item.name} x{item.quantity}</p>
                                                        </div>
                                                        <span className={`px-2 py-0.5 rounded-full ${getItemStatusClass(item.status)}`}>{item.status}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-800">{order.address.fullName}</p>
                                                <p className="text-gray-500">{order.address.hall}, Room {order.address.roomNumber}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{currency}{order.amount.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                             <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getOverallStatusClass(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <select 
                                                    onChange={(e) => handleStatusChange(order._id, e.target.value)} 
                                                    value={order.status} 
                                                    className="border border-gray-300 p-2 rounded-md outline-none focus:ring-2 focus:ring-orange-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled={order.status === 'pending' || order.status === 'failed' || order.status === 'Completed'}
                                                >
                                                    <option value="Order Placed">Order Placed</option>
                                                    <option value="Processing">Processing</option>
                                                    <option value="Partially Shipped">Partially Shipped</option>
                                                    <option value="Shipped">Shipped</option>
                                                    <option value="Delivered">Delivered</option>
                                                    <option value="Completed">Complete & Pay Seller</option>
                                                    <option value="Disputed">Disputed</option>
                                                </select>
                                                {order.status === 'Completed' && (
                                                    <button onClick={() => handleReverseClick(order)} className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200" title="Reverse Payout">
                                                        <RotateCcw className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </>
            }
        </div>
         {showReverseModal && (
            <DeleteConfirmationModal
                onConfirm={confirmReverse}
                onCancel={cancelReverse}
                title="Reverse Payout?"
                message="This will reverse the seller payouts for this order and set the status to 'Shipped'. This action cannot be undone."
                confirmText="Yes, Reverse"
            />
        )}
        </>
    );
};

export default Orders;
