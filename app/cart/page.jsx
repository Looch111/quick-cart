
'use client'
import React, { useMemo } from "react";
import { assets } from "@/assets/assets";
import OrderSummary from "@/components/OrderSummary";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";
import { Plus, Minus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCollection } from "@/src/firebase";

const Cart = () => {
    const { router, cartItems, addToCart, updateCartQuantity, getCartCount, authLoading, userData, currency, setShowLogin, allRawProducts, productsLoading } = useAppContext();

    const handleQuantityChange = (itemId, currentQuantity, stock) => {
        if (currentQuantity > stock) {
            toast.error(`Only ${stock} items available`);
            updateCartQuantity(itemId, stock);
        } else {
            updateCartQuantity(itemId, currentQuantity);
        }
    };
    
    const cartProducts = useMemo(() => {
        if (!allRawProducts) return [];
        return Object.entries(cartItems)
            .map(([itemId, quantity]) => {
                if (quantity > 0) {
                    const [productId, size] = itemId.split('_');
                    const product = allRawProducts.find(p => p.id === productId);
                    if (product) {
                        return {
                            ...product,
                            _id: product.id,
                            itemId: itemId, 
                            size: size || null,
                            quantity: quantity
                        };
                    }
                }
                return null;
            })
            .filter(Boolean)
            .sort((a, b) => a.name.localeCompare(a.name) || (a.size && b.size ? a.size.localeCompare(b.size) : 0));
    }, [cartItems, allRawProducts]);


    if (authLoading || userData === undefined || productsLoading) {
        return (
            <>
                <Navbar />
                <Loading />
            </>
        )
    }

    if (!userData) {
        if (!authLoading) {
            toast.error("Please log in to continue.");
            setShowLogin(true);
            router.push('/');
        }
        return (
            <>
                <Navbar />
                <Loading />
            </>
        );
    }

    const cartIsEmpty = cartProducts.length === 0;

    return (
        <>
            <Navbar />
            <div className="flex flex-col lg:flex-row gap-10 px-6 md:px-16 lg:px-32 pt-28 mb-20 min-h-[60vh]">
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-8 border-b border-gray-500/30 pb-6">
                        <p className="text-2xl md:text-3xl text-gray-500">
                            Your <span className="font-medium text-orange-600">Cart</span>
                        </p>
                        <p className="text-lg md:text-xl text-gray-500/80">{getCartCount()} Items</p>
                    </div>

                    {cartIsEmpty ? (
                        <div className="text-center py-16">
                            <p className="text-xl text-gray-500">Your cart is empty.</p>
                            <p className="text-gray-400 mt-2">Looks like you haven't added anything to your cart yet.</p>
                            <button onClick={()=> router.push('/all-products')} className="mt-6 px-6 py-2 bg-orange-600 text-white font-semibold rounded-md hover:bg-orange-700 transition">
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                       <>
                        {/* Mobile View */}
                        <div className="md:hidden space-y-4">
                            {cartProducts.map(product => (
                                <div key={product.itemId} className="bg-white border rounded-lg p-4 shadow-sm">
                                    <div className="flex gap-4">
                                        <div className="rounded-lg overflow-hidden bg-gray-500/10 p-2 w-24 h-24 flex items-center justify-center">
                                            <Image
                                                src={product.image && product.image.length > 0 ? product.image[0] : assets.upload_area}
                                                alt={product.name}
                                                className="w-full h-full object-contain mix-blend-multiply"
                                                width={100}
                                                height={100}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800">{product.name}</h3>
                                            {product.size && <p className="text-xs text-gray-500">Size: {product.size}</p>}
                                            <p className="text-sm text-gray-600 mt-1">{currency}{product.offerPrice}</p>
                                             <div className="flex items-center gap-2 mt-2">
                                                <button onClick={() => updateCartQuantity(product.itemId, product.quantity - 1)} className="p-1 border rounded-full">
                                                    <Minus className="w-4 h-4 text-gray-600"/>
                                                </button>
                                                <span className="w-10 text-center">{product.quantity}</span>
                                                <button onClick={() => addToCart(product.itemId)} className="p-1 border rounded-full">
                                                    <Plus className="w-4 h-4 text-gray-600" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-3 pt-3 border-t">
                                        <button onClick={() => updateCartQuantity(product.itemId, 0)} className="flex items-center gap-1 text-xs text-red-600">
                                            <Trash2 className="w-3 h-3"/> Remove
                                        </button>
                                        <p className="font-semibold text-gray-800">{currency}{(product.offerPrice * product.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="min-w-full table-auto">
                                <thead className="text-left">
                                    <tr>
                                        <th className="text-nowrap pb-6 md:px-4 px-1 text-gray-600 font-medium">
                                            Product Details
                                        </th>
                                        <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
                                            Price
                                        </th>
                                        <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
                                            Quantity
                                        </th>
                                        <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium text-right">
                                            Subtotal
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cartProducts.map((product) => (
                                        <tr key={product.itemId} className="border-t">
                                            <td className="py-4 md:px-4 px-1">
                                                <div className="flex items-center gap-4">
                                                    <div className="rounded-lg overflow-hidden bg-gray-500/10 p-2 w-20 h-20 flex items-center justify-center">
                                                        <Image
                                                        src={product.image && product.image.length > 0 ? product.image[0] : assets.upload_area}
                                                        alt={product.name}
                                                        className="w-full h-full object-contain mix-blend-multiply"
                                                        width={80}
                                                        height={80}
                                                        />
                                                    </div>
                                                    <div className="text-sm">
                                                        <p className="text-gray-800 font-medium">{product.name}</p>
                                                        {product.size && <p className="text-xs text-gray-500">Size: {product.size}</p>}
                                                        <button
                                                            className="text-xs text-orange-600 mt-1 hover:underline"
                                                            onClick={() => updateCartQuantity(product.itemId, 0)}
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 md:px-4 px-1 text-gray-600">{currency}{product.offerPrice}</td>
                                            <td className="py-4 md:px-4 px-1">
                                                <div className="flex items-center md:gap-2 gap-1 border rounded-full p-1 max-w-fit">
                                                    <button onClick={() => updateCartQuantity(product.itemId, product.quantity - 1)} className="p-1 hover:bg-gray-100 rounded-full">
                                                        <Minus className="w-4 h-4 text-gray-600"/>
                                                    </button>
                                                    <span className="w-10 text-center">{product.quantity}</span>
                                                    <button onClick={() => addToCart(product.itemId)} className="p-1 hover:bg-gray-100 rounded-full">
                                                        <Plus className="w-4 h-4 text-gray-600" />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="py-4 md:px-4 px-1 text-gray-600 font-semibold text-right">{currency}{(product.offerPrice * product.quantity).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Link href='/all-products' className="group flex items-center mt-8 gap-2 text-orange-600">
                           <Image
                            className="group-hover:-translate-x-1 transition"
                            src={assets.arrow_right_icon_colored}
                            alt="arrow_right_icon_colored"
                            />
                            Continue Shopping
                        </Link>
                        </>
                    )}
                </div>
                {!cartIsEmpty && <OrderSummary />}
            </div>
        </>
    );
};

export default Cart;
