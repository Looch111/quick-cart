'use client';
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";

const MyOrders = () => {
    const { currency, userData, setShowLogin, router } = useAppContext();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userData) {
            router.push('/');
            setShowLogin(true);
            return;
        }

        const fetchOrders = async () => {
            // In a real app, you would fetch orders for the logged-in user
            // We are using a method from context that simulates this
            const userOrders = await Promise.resolve(JSON.parse(localStorage.getItem('allOrders')) || []);
            setOrders(userOrders.filter(order => order.userId === userData._id));
            setLoading(false);
        };

        fetchOrders();
    }, [userData, router, setShowLogin]);

    if (!userData) {
        return <Loading />;
    }

    return (
        <>
            <Navbar />
            <div className="flex flex-col justify-between px-6 md:px-16 lg:px-32 py-6 min-h-screen pt-28">
                <div className="space-y-5">
                    <h2 className="text-lg font-medium mt-6">My Orders</h2>
                    {loading ? <Loading /> : (
                        orders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                                <p className="text-lg text-gray-500">You have no orders yet.</p>
                                <button onClick={() => router.push('/all-products')} className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-md">Shop Now</button>
                            </div>
                        ) : (
                            <div className="max-w-5xl border-t border-gray-300 text-sm">
                                {orders.map((order, index) => (
                                    <div key={index} className="flex flex-col md:flex-row gap-5 justify-between p-5 border-b border-gray-300">
                                        <div className="flex-1 flex gap-5 max-w-80">
                                            <Image
                                                className="w-16 h-16 object-cover"
                                                src={assets.box_icon}
                                                alt="box_icon"
                                            />
                                            <p className="flex flex-col gap-3">
                                                <span className="font-medium text-base">
                                                    {order.items.map((item) => `${item.product.name} x ${item.quantity}`).join(", ")}
                                                </span>
                                                <span>Items: {order.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                                            </p>
                                        </div>
                                        <div>
                                            <p>
                                                <span className="font-medium">{order.address.fullName}</span>
                                                <br />
                                                <span>{order.address.area}</span>
                                                <br />
                                                <span>{`${order.address.city}, ${order.address.state}`}</span>
                                                <br />
                                                <span>{order.address.phoneNumber}</span>
                                            </p>
                                        </div>
                                        <p className="font-medium my-auto">{currency}{order.amount.toFixed(2)}</p>
                                        <div>
                                            <p className="flex flex-col">
                                                <span>Method: {order.paymentMethod === 'wallet' ? 'Wallet' : 'COD'}</span>
                                                <span>Date: {new Date(order.date).toLocaleDateString()}</span>
                                                <span className="text-green-600 font-medium">{order.status}</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default MyOrders;
