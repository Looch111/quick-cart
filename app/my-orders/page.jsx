'use client';
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import { Truck, CheckCircle, PackageCheck, FileWarning, MessageSquareWarning } from "lucide-react";
import { useRouter } from "next/navigation";
import DeleteConfirmationModal from "@/components/admin/DeleteConfirmationModal";
import DisputeModal from "@/components/DisputeModal";

const OrderStatusTracker = ({ status }) => {
    const statuses = ["Order Placed", "Processing", "Shipped", "Delivered"];
    const currentStatusIndex = statuses.indexOf(status);

    return (
        <div className="flex items-center justify-between w-full mt-4">
            {statuses.map((s, index) => (
                <React.Fragment key={s}>
                    <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index <= currentStatusIndex ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {index <= currentStatusIndex ? <CheckCircle size={18} /> : <div className="w-2 h-2 bg-gray-400 rounded-full"></div>}
                        </div>
                        <p className={`mt-2 text-xs text-center ${index <= currentStatusIndex ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>{s}</p>
                    </div>
                    {index < statuses.length - 1 && (
                        <div className={`flex-1 h-1 mx-2 ${index < currentStatusIndex ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};


const MyOrders = () => {
    const { currency, userData, userOrders, setShowLogin, confirmOrderDelivery, openDisputeModal } = useAppContext();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        if (userData === undefined) {
            setLoading(true);
        } else if (userData === null) {
            if (router && setShowLogin) {
                router.push('/');
                setShowLogin(true);
            }
        } else if (userOrders) {
            setOrders(userOrders.sort((a, b) => new Date(b.date) - new Date(a.date)));
            setLoading(false);
        }
    }, [userData, userOrders, router, setShowLogin]);

    const handleConfirmClick = (order) => {
        setSelectedOrder(order);
        setShowConfirmModal(true);
    };

    const handleDisputeClick = (order) => {
        openDisputeModal(order);
    };

    const executeConfirm = async () => {
        if (selectedOrder) {
            await confirmOrderDelivery(selectedOrder._id);
        }
        setShowConfirmModal(false);
        setSelectedOrder(null);
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'Delivered': return 'bg-blue-100 text-blue-800';
            case 'Shipped': return 'bg-purple-100 text-purple-800';
            case 'Processing': return 'bg-yellow-100 text-yellow-800';
            case 'Order Placed': return 'bg-gray-100 text-gray-800';
            case 'Disputed': return 'bg-red-100 text-red-800';
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
            <div className="bg-gray-50/50 min-h-[calc(100vh-200px)] pt-28">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                     <div className="flex flex-col items-start mb-10">
                        <h1 className="text-3xl font-bold text-gray-800">My <span className="text-orange-600">Orders</span></h1>
                        <div className="w-24 h-1 bg-orange-500 mt-1 self-start"></div>
                    </div>

                    {!userData ? (
                         <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                            <p className="text-gray-600">Please log in to see your orders.</p>
                         </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                            <Truck className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
                            <p className="mt-1 text-sm text-gray-500">You haven't placed any orders with us. Let's change that!</p>
                            <div className="mt-6">
                                <button onClick={() => router.push('/all-products')} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700">
                                    Start Shopping
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => (
                                <div key={order._id} className="relative bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                     
                                    <div className={order.status === 'Completed' ? 'animate-blur-content' : ''}>
                                        <div className="bg-gray-50 px-4 py-3 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                            <div className="flex flex-wrap gap-x-6 gap-y-2">
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase">Order Placed</p>
                                                    <p className="text-sm font-medium text-gray-800">{new Date(order.date).toLocaleDateString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase">Total</p>
                                                    <p className="text-sm font-medium text-gray-800">{currency}{Number(order.amount).toFixed(2)}</p>
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
                                            <div className='pb-4'>
                                                <OrderStatusTracker status={order.status} />
                                            </div>
                                            {order.items.map((item, itemIndex) => (
                                                <div key={itemIndex} className="flex items-start gap-4 pt-4 border-t">
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
                                                        <p className="text-sm font-medium text-gray-700">{currency}{Number(item.offerPrice).toFixed(2)}</p>
                                                         <div className={`mt-2 px-2 py-1 text-xs font-medium rounded-full inline-flex items-center gap-1.5 ${getStatusClass(item.status)}`}>
                                                            {item.status}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {(order.status === 'Shipped' || order.status === 'Partially Shipped') && (
                                                <div className="border-t pt-4 mt-4 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
                                                    <p className="text-sm text-gray-600 font-medium">Have you received your order?</p>
                                                    <div className="flex gap-3">
                                                        <button onClick={() => handleConfirmClick(order)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
                                                            <PackageCheck className="w-4 h-4"/>
                                                            Yes, I've Received It
                                                        </button>
                                                        <button onClick={() => handleDisputeClick(order)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200">
                                                             <FileWarning className="w-4 h-4"/>
                                                            Report an Issue
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {order.status === 'Disputed' && (
                                                <div className="border-t pt-4 mt-4 flex items-center justify-center gap-2 text-center p-3 bg-yellow-50 rounded-md">
                                                    <MessageSquareWarning className="w-5 h-5 text-yellow-600 flex-shrink-0"/>
                                                    <p className="text-sm text-yellow-800">Your issue has been reported. Our admin team will review it and get back to you shortly.</p>
                                                </div>
                                            )}
                                            {order.status === 'Delivered' && (
                                                 <div className="border-t pt-4 mt-4 flex items-center justify-center gap-2 text-center p-3 bg-blue-50 rounded-md">
                                                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0"/>
                                                    <p className="text-sm text-blue-800">You've confirmed delivery. The admin team will now process the final payment to the seller.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {order.status === 'Completed' && (
                                        <div className="absolute inset-0 flex justify-center items-center overflow-hidden pointer-events-none">
                                            <Truck className="w-24 h-24 text-orange-500 absolute animate-drive-by-blur" />
                                            <div className="absolute w-full h-full flex items-center justify-center animate-fade-in-check-blur">
                                                <CheckCircle className="w-24 h-24 text-green-500" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
            {showConfirmModal && (
                <DeleteConfirmationModal
                    onConfirm={executeConfirm}
                    onCancel={() => setShowConfirmModal(false)}
                    title="Confirm Delivery"
                    message={<>By confirming, you agree that you have received your order. The admin will be notified to release payment to the seller.</>}
                    confirmText="Yes, I Have Received It"
                />
            )}
        </>
    );
};

export default MyOrders;
