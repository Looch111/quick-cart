'use client'
import React from "react";
import { assets } from "@/assets/assets";
import OrderSummary from "@/components/OrderSummary";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useAppContext } from "@/context/AppContext";
import { Plus, Minus } from "lucide-react";

const Cart = () => {

  const { products, router, cartItems, addToCart, updateCartQuantity, getCartCount, userData, setShowLogin } = useAppContext();

  if (!userData && getCartCount() > 0) {
    setShowLogin(true);
    return null;
  }

  if (getCartCount() === 0) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 md:px-16 lg:px-32 pt-28 mb-20">
          <p className="text-2xl text-gray-600">Your cart is empty.</p>
          <p className="text-gray-500 mt-2">Looks like you haven't added anything to your cart yet.</p>
          <button onClick={() => router.push('/all-products')} className="group flex items-center mt-8 gap-2 px-6 py-3 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition">
            Continue Shopping
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex flex-col md:flex-row gap-10 px-6 md:px-16 lg:px-32 pt-32 md:pt-28 mb-20">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8 border-b border-gray-500/30 pb-6">
            <p className="text-2xl md:text-3xl text-gray-500">
              Your <span className="font-medium text-orange-600">Cart</span>
            </p>
            <p className="text-lg md:text-xl text-gray-500/80">{getCartCount()} Items</p>
          </div>
          <div className="overflow-x-auto">
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
                  <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(cartItems).map((itemId) => {
                  const product = products.find(product => product._id === itemId);

                  if (!product || cartItems[itemId] <= 0) return null;

                  return (
                    <tr key={itemId}>
                      <td className="flex items-center gap-4 py-4 md:px-4 px-1">
                        <div>
                          <div className="rounded-lg overflow-hidden bg-gray-500/10 p-2">
                            <Image
                              src={product.image[0]}
                              alt={product.name}
                              className="w-16 h-16 object-contain mix-blend-multiply"
                              width={1280}
                              height={720}
                            />
                          </div>
                          <button
                            className="md:hidden text-xs text-orange-600 mt-1"
                            onClick={() => updateCartQuantity(product._id, 0)}
                          >
                            Remove
                          </button>
                        </div>
                        <div className="text-sm hidden md:block">
                          <p className="text-gray-800">{product.name}</p>
                          <button
                            className="text-xs text-orange-600 mt-1"
                            onClick={() => updateCartQuantity(product._id, 0)}
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                      <td className="py-4 md:px-4 px-1 text-gray-600">${product.offerPrice}</td>
                      <td className="py-4 md:px-4 px-1">
                        <div className="flex items-center border border-gray-300 rounded-full">
                            <button 
                                onClick={() => updateCartQuantity(product._id, cartItems[itemId] - 1)}
                                className="p-1.5"
                            >
                                <Minus className="w-4 h-4 text-gray-600" />
                            </button>
                            <input 
                                onChange={e => updateCartQuantity(product._id, Number(e.target.value))} 
                                type="number" 
                                value={cartItems[itemId]} 
                                className="w-10 border-none text-center appearance-none focus:outline-none bg-transparent"
                            />
                            <button 
                                onClick={() => addToCart(product._id)}
                                className="p-1.5"
                            >
                                <Plus className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>
                      </td>
                      <td className="py-4 md:px-4 px-1 text-gray-600">${(product.offerPrice * cartItems[itemId]).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button onClick={()=> router.push('/all-products')} className="group flex items-center mt-6 gap-2 text-orange-600">
            <Image
              className="group-hover:-translate-x-1 transition"
              src={assets.arrow_right_icon_colored}
              alt="arrow_right_icon_colored"
            />
            Continue Shopping
          </button>
        </div>
        <OrderSummary />
      </div>
    </>
  );
};

export default Cart;
