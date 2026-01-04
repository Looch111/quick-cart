'use client';
import React, { useEffect, useState, useCallback } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";

const Orders = () => {
    const { currency, userData, allOrders, products, productsLoading } = useAppContext();
    const [sellerOrders, setSellerOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const filterSellerOrders = useCallback(() => {
        if (userData && allOrders.length > 0 && products.length > 0) {
            const sellerProductIds = products.filter(p => p.userId === userData._id).map(p => p.id);
            
            const filteredOrders = allOrders.map(order => {
                const sellerItems = order.items.filter(item => sellerProductIds.includes(item.id));
                if (sellerItems.length > 0) {
                    const sellerAmount = sellerItems.reduce((sum, item) => sum + item.offerPrice * item.quantity, 0);
                    return { ...order, items: sellerItems, amount: sellerAmount };
                }
                return null;
            }).filter(order => order !== null);
            
            setSellerOrders(filteredOrders.sort((a, b) => new Date(b.date) - new Date(a.date)));
        }
    }, [userData, allOrders, products]);

    useEffect(() => {
        if (!userData || productsLoading) {
            setLoading(true);
        } else if (allOrders && products) {
            filterSellerOrders();
            setLoading(false);
        } else {
             setLoading(false);
        }
    }, [allOrders, userData, products, filterSellerOrders, productsLoading]);


    return (
        <div className="flex-1 min-h-screen flex flex-col justify-between text-sm">
            {loading ? <Loading /> : <div className="md:p-10 p-4 space-y-5">
                <h2 className="text-lg font-medium">Your Orders</h2>
                <div className="max-w-4xl rounded-md bg-white shadow-md">
                    {sellerOrders.length > 0 ? sellerOrders.map((order, index) => (
                        <div key={index} className="flex flex-col md:flex-row gap-5 justify-between p-5 border-b last:border-b-0">
                            <div className="flex-1 flex gap-5 max-w-sm">
                                <Image
                                    className="max-w-16 max-h-16 object-contain self-start"
                                    src={assets.box_icon}
                                    alt="box_icon"
                                />
                                <div className="flex flex-col gap-1">
                                    <p className="font-medium">
                                        {order.items.map((item) => `${item.name} x ${item.quantity}`).join(", ")}
                                    </p>
                                    <p className="text-xs text-gray-500">Items: {order.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
                                    <p className="text-xs text-gray-500">Order ID: #{order._id.slice(-6)}</p>
                                </div>
                            </div>
                            <div className='flex-shrink-0 w-48'>
                                <p className='font-medium'>{order.address.fullName}</p>
                                <p className='text-gray-600'>{order.address.area}</p>
                                <p className='text-gray-600'>{`${order.address.city}, ${order.address.state}`}</p>
                                <p className='text-gray-600'>{order.address.phoneNumber}</p>
                            </div>
                            <div className="flex-shrink-0 w-32 flex flex-col justify-center">
                               <p className="font-semibold text-base">{currency}{order.amount.toFixed(2)}</p>
                               <p className="text-xs text-gray-500">{order.paymentMethod.toUpperCase()}</p>
                            </div>
                            <div className="flex-shrink-0 w-32 flex flex-col justify-center items-start">
                                <p className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                                <span className="text-green-600 font-medium mt-1 px-2 py-0.5 bg-green-100 rounded-full text-xs">{order.status}</span>
                            </div>
                        </div>
                    )) : <p className="text-center p-10 text-gray-500">You have no orders yet.</p>}
                </div>
            </div>}
            <Footer />
        </div>
    );
};

export default Orders;
