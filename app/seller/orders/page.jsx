'use client';
import React, { useEffect, useState, useCallback } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";

const Orders = () => {
    const { currency, userData, allOrders } = useAppContext();
    const [sellerOrders, setSellerOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const filterSellerOrders = useCallback(() => {
        if (userData && allOrders.length > 0) {
            const filteredOrders = allOrders.map(order => {
                const sellerItems = order.items.filter(item => item.userId === userData._id);
                if (sellerItems.length > 0) {
                    const sellerAmount = sellerItems.reduce((sum, item) => sum + item.offerPrice * item.quantity, 0);
                    return { ...order, items: sellerItems, amount: sellerAmount };
                }
                return null;
            }).filter(order => order !== null);
            setSellerOrders(filteredOrders.sort((a, b) => new Date(b.date) - new Date(a.date)));
        }
    }, [userData, allOrders]);

    useEffect(() => {
        if (!userData) {
            setLoading(true);
        } else if (allOrders) {
            filterSellerOrders();
            setLoading(false);
        }
    }, [allOrders, userData, filterSellerOrders]);


    return (
        <div className="flex-1 h-screen overflow-scroll flex flex-col justify-between text-sm">
            {loading ? <Loading /> : <div className="md:p-10 p-4 space-y-5">
                <h2 className="text-lg font-medium">Your Orders</h2>
                <div className="max-w-4xl rounded-md">
                    {sellerOrders.length > 0 ? sellerOrders.map((order, index) => (
                        <div key={index} className="flex flex-col md:flex-row gap-5 justify-between p-5 border-t border-gray-300">
                            <div className="flex-1 flex gap-5 max-w-80">
                                <Image
                                    className="max-w-16 max-h-16 object-cover"
                                    src={assets.box_icon}
                                    alt="box_icon"
                                />
                                <p className="flex flex-col gap-3">
                                    <span className="font-medium">
                                        {order.items.map((item) => item.name + ` x ${item.quantity}`).join(", ")}
                                    </span>
                                    <span>Items : {order.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                                </p>
                            </div>
                            <div>
                                <p>
                                    <span className="font-medium">{order.address.fullName}</span>
                                    <br />
                                    <span >{order.address.area}</span>
                                    <br />
                                    <span>{`${order.address.city}, ${order.address.state}`}</span>
                                    <br />
                                    <span>{order.address.phoneNumber}</span>
                                </p>
                            </div>
                            <p className="font-medium my-auto">{currency}{order.amount.toFixed(2)}</p>
                            <div>
                                <p className="flex flex-col">
                                    <span>Method : {order.paymentMethod.toUpperCase()}</span>
                                    <span>Date : {new Date(order.date).toLocaleDateString()}</span>
                                    <span className="text-green-600 font-medium">{order.status}</span>
                                </p>
                            </div>
                        </div>
                    )) : <p className="text-center p-5 text-gray-500">You have no orders yet.</p>}
                </div>
            </div>}
            <Footer />
        </div>
    );
};

export default Orders;
