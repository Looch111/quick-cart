
'use client';
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import { Truck } from "lucide-react";
import { useRouter } from "next/navigation";

const MyOrders = () => {
    const { currency, userData, userOrders } = useAppContext();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (userData === null) {
            setLoading(false);
        }
        if (userOrders) {
            setOrders(userOrders.sort((a, b) => new Date(b.date) - new Date(a.date)));
            setLoading(false);
        }
    }, [userData, userOrders]);

    const getStatusClass = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-green-100 text-green-800';
            case 'Shipped': return 'bg-blue-100 text-blue-800';
            case 'Processing': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <Loading />
                <Footer />
            </>
        );
    }
    
    return (
        <>
            <Navbar />
            <div className="bg-gray-50/50 min-h-[calc(100vh-200px)]">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">My Orders</h1>
                        <p className="text-gray-500">{orders.length} {orders.length === 1 ? 'Order' : 'Orders'}</p>
                    </div>

                    {!userData ? (
                         <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                            <p className="text-gray-600">Please log in to see your orders.</p>
                         </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                            <p className="text-gray-600">You haven't placed any orders yet.</p>
                            <button onClick={() => router.push('/all-products')} className="mt-4 text-orange-600 hover:underline">
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => (
                                <div key={order._id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-3 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Order Placed</p>
                                                <p className="text-sm font-medium text-gray-800">{new Date(order.date).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Total</p>
                                                <p className="text-sm font-medium text-gray-800">{currency}{order.amount.toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Order ID</p>
                                                <p className="text-sm font-medium text-gray-600">#{order._id.slice(-8)}</p>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:mt-0">
                                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusClass(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4 sm:p-6 space-y-4">
                                        {order.items.map((item, itemIndex) => (
                                            <div key={itemIndex} className="flex items-start gap-4">
                                                <Image
                                                    src={item.image[0]}
                                                    alt={item.name}
                                                    width={80}
                                                    height={80}
                                                    className="w-20 h-20 object-contain rounded-md border bg-gray-50"
                                                />
                                                <div className="flex-grow">
                                                    <p className="font-semibold text-gray-800">{item.name}</p>
                                                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                    <p className="text-sm font-medium text-gray-700">{currency}{item.offerPrice.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:px-6 border-t border-gray-200">
                                        <button className="flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700">
                                            <Truck size={16} />
                                            Track Order
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default MyOrders;
