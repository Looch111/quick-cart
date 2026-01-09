'use client';
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import { useFirestore } from "@/src/firebase";
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import toast from "react-hot-toast";
import DeleteConfirmationModal from "@/components/admin/DeleteConfirmationModal";


const getStatusClass = (status) => {
    switch (status) {
        case 'Delivered': return 'bg-blue-100 text-blue-800';
        case 'Completed': return 'bg-green-100 text-green-800';
        case 'Shipped': return 'bg-purple-100 text-purple-800';
        case 'Processing': return 'bg-yellow-100 text-yellow-800';
        case 'Disputed': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const Orders = () => {
    const { currency, userData, allOrders, productsLoading, updateItemStatus } = useAppContext();
    const [sellerItems, setSellerItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeliveredModal, setShowDeliveredModal] = useState(false);
    const [itemToUpdate, setItemToUpdate] = useState(null);

    useEffect(() => {
        if (!userData || productsLoading) {
            setLoading(true);
        } else if (allOrders) {
            const items = allOrders.flatMap(order => 
                order.items
                    .filter(item => item.sellerId === userData._id)
                    .map(item => ({ ...item, orderId: order._id, orderDate: order.date, address: order.address, orderAmount: order.amount, orderStatus: order.status }))
            ).sort((a,b) => new Date(b.orderDate) - new Date(a.orderDate));
            setSellerItems(items);
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, [allOrders, userData, productsLoading]);

    const handleStatusChange = (orderId, itemId, currentStatus, newStatus) => {
        if (newStatus === 'Delivered' && currentStatus !== 'Shipped') {
            toast.error("Item must be shipped before it can be marked as delivered.");
            return;
        }
        if (newStatus === 'Delivered') {
            setItemToUpdate({ orderId, itemId, newStatus });
            setShowDeliveredModal(true);
        } else {
            updateItemStatus(orderId, itemId, newStatus);
        }
    };
    
    const confirmDelivery = async () => {
        if (itemToUpdate) {
            // Here you would add logic to upload proof of delivery.
            // For now, we'll just update the status.
            await updateItemStatus(itemToUpdate.orderId, itemToUpdate.itemId, itemToUpdate.newStatus);
        }
        setShowDeliveredModal(false);
        setItemToUpdate(null);
    }

    return (
        <>
        <div className="flex-1 min-h-screen flex flex-col justify-between text-sm">
            {loading ? <Loading /> : <div className="md:p-10 p-4 space-y-5">
                <h2 className="text-lg font-medium">Your Items to Fulfill</h2>
                <div className="overflow-x-auto rounded-md bg-white shadow-md">
                    <table className="min-w-full table-auto">
                         <thead className="bg-gray-50 text-gray-600 text-sm text-left uppercase">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Order & Item</th>
                                    <th className="px-6 py-3 font-medium">Date</th>
                                    <th className="px-6 py-3 font-medium">Customer</th>
                                    <th className="px-6 py-3 font-medium">Item Price</th>
                                    <th className="px-6 py-3 font-medium">Item Status</th>
                                    <th className="px-6 py-3 font-medium text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-gray-700">
                               {sellerItems.length > 0 ? sellerItems.map((item) => (
                                    <tr key={`${item.orderId}-${item._id}`} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Image src={item.image[0]} alt={item.name} width={40} height={40} className="w-10 h-10 object-contain rounded bg-gray-100" />
                                                <div>
                                                    <p className="font-medium text-gray-800">{item.name} x{item.quantity}</p>
                                                    <p className="text-xs text-gray-500">Order #{item.orderId.slice(-6)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{new Date(item.orderDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium">{item.address.fullName}</p>
                                            <p className="text-xs text-gray-500">{item.address.hall}, Room {item.address.roomNumber}</p>
                                        </td>
                                        <td className="px-6 py-4 font-medium">{currency}{(item.offerPrice * item.quantity).toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusClass(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <select 
                                                onChange={(e) => handleStatusChange(item.orderId, item._id, item.status, e.target.value)} 
                                                value={item.status}
                                                className="border border-gray-300 p-2 rounded-md outline-none focus:ring-2 focus:ring-orange-300 text-xs"
                                                disabled={item.status === 'Completed' || item.status === 'Disputed'}
                                            >
                                                <option value="Processing">Processing</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                            </select>
                                        </td>
                                    </tr>
                               )) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-10 text-gray-500">You have no items to fulfill.</td>
                                </tr>
                               )}
                            </tbody>
                    </table>
                </div>
            </div>}
            <Footer />
        </div>
         {showDeliveredModal && (
            <DeleteConfirmationModal
                onConfirm={confirmDelivery}
                onCancel={() => setShowDeliveredModal(false)}
                title="Confirm Delivery?"
                message="Only mark as delivered if the order has been fully delivered to the customer. This will notify the buyer to confirm receipt. False claims may result in penalties."
                confirmText="Yes, Mark as Delivered"
            />
        )}
        </>
    );
};

export default Orders;
