'use client';
import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";

const Orders = () => {

    const { currency, updateOrderStatus, allOrders, productsLoading } = useAppContext();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!productsLoading) {
            setOrders(allOrders.sort((a, b) => new Date(b.date) - new Date(a.date)));
            setLoading(false);
        } else {
            setLoading(true);
        }
    }, [allOrders, productsLoading]);

    const handleStatusChange = async (orderId, newStatus) => {
        const success = await updateOrderStatus(orderId, newStatus);
        if (success) {
            toast.success("Order status updated");
        } else {
            toast.error("Failed to update status");
        }
    }

    const getStatusClass = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-green-100 text-green-800';
            case 'Shipped': return 'bg-blue-100 text-blue-800';
            case 'Processing': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };


    return (
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
            {loading ? <Loading /> :
            <>
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Orders</h1>
                 <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                             <thead className="bg-gray-50 text-gray-600 text-sm text-left uppercase">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Order ID</th>
                                    <th className="px-6 py-3 font-medium">Date</th>
                                    <th className="px-6 py-3 font-medium">Customer</th>
                                    <th className="px-6 py-3 font-medium">Total</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                    <th className="px-6 py-3 font-medium text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-gray-700">
                                {orders.map((order) => (
                                    <tr key={order._id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-800">#{order._id.slice(-8)}</td>
                                        <td className="px-6 py-4">{new Date(order.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-800">{order.address.fullName}</p>
                                                <p className="text-gray-500">{order.address.city}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{currency}{order.amount.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                             <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusClass(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <select 
                                                onChange={(e) => handleStatusChange(order._id, e.target.value)} 
                                                value={order.status} 
                                                className="border border-gray-300 p-2 rounded-md outline-none focus:ring-2 focus:ring-orange-300"
                                            >
                                                <option value="Order Placed">Order Placed</option>
                                                <option value="Processing">Processing</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                            </select>
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
    );
};

export default Orders;
