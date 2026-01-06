'use client'
import React, { useState, useEffect } from "react";
import { assets } from "@/assets/assets";
import OrderSummary from "@/components/OrderSummary";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useAppContext } from "@/context/AppContext";
import { Plus, Minus } from "lucide-react";
import Loading from "@/components/Loading";

const Cart = () => {

  const { products, router, cartItems, addToCart, updateCartQuantity, getCartCount, userData, setShowLogin, currency, allRawProducts, productsLoading } = useAppContext();
  const [selectedItems, setSelectedItems] = useState({});

  useEffect(() => {
    // Initially, select all items in the cart
    const initialSelection = {};
    Object.keys(cartItems).forEach(itemId => {
        initialSelection[itemId] = true;
    });
    setSelectedItems(initialSelection);
  }, [cartItems]);
  
  const handleItemSelect = (itemId) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    const newSelection = {};
    if (isChecked) {
      Object.keys(cartItems).forEach(itemId => {
        newSelection[itemId] = true;
      });
    }
    setSelectedItems(newSelection);
  };
  
  const isAllSelected = Object.keys(cartItems).length > 0 && Object.keys(cartItems).every(itemId => selectedItems[itemId]);

  if (productsLoading || userData === undefined) {
    return (
      <>
        <Navbar />
        <Loading />
      </>
    )
  }

  if (!userData && getCartCount() > 0) {
    setShowLogin(true);
    return (
        <>
            <Navbar />
            <Loading />
        </>
    );
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
             <div className="flex items-center gap-3">
                 <input 
                    type="checkbox" 
                    id="select-all"
                    className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                  <label htmlFor="select-all" className="text-sm text-gray-600">Select All</label>
             </div>
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-4">
              {Object.keys(cartItems).map((itemId) => {
                  const product = allRawProducts.find(p => p._id === itemId);
                  if (!product || cartItems[itemId] <= 0) return null;
                  const isStockLimitReached = cartItems[itemId] >= product.stock;

                  return (
                      <div key={itemId} className="bg-white border rounded-lg p-4 shadow-sm">
                          <div className="flex gap-4">
                              <div className="flex-shrink-0">
                                  <div className="rounded-lg overflow-hidden bg-gray-100 p-1 w-20 h-20 flex items-center justify-center">
                                      <Image src={product.image[0]} alt={product.name} width={80} height={80} className="object-contain" />
                                  </div>
                              </div>
                              <div className="flex-1">
                                  <h3 className="font-semibold text-gray-800 text-base">{product.name}</h3>
                                  <p className="text-sm text-gray-600 mt-1">{currency}{product.offerPrice.toFixed(2)}</p>
                                  <div className="mt-3 flex items-center border border-gray-300 rounded-full w-fit">
                                      <button onClick={() => updateCartQuantity(product._id, cartItems[itemId] - 1)} className="p-1.5"><Minus className="w-4 h-4 text-gray-600" /></button>
                                      <input onChange={e => updateCartQuantity(product._id, Number(e.target.value))} type="number" value={cartItems[itemId]} className="w-10 border-none text-center appearance-none focus:outline-none bg-transparent" />
                                      <button onClick={() => addToCart(product._id)} className="p-1.5 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isStockLimitReached}><Plus className="w-4 h-4 text-gray-600" /></button>
                                  </div>
                              </div>
                               <input 
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 self-start"
                                  checked={!!selectedItems[itemId]}
                                  onChange={() => handleItemSelect(itemId)}
                                />
                          </div>
                          <div className="flex justify-between items-center mt-3 pt-3 border-t">
                              <button onClick={() => updateCartQuantity(product._id, 0)} className="text-xs text-orange-600">Remove</button>
                              <p className="text-sm font-medium text-gray-800">Subtotal: <span className='font-bold'>{currency}{(product.offerPrice * cartItems[itemId]).toFixed(2)}</span></p>
                          </div>
                      </div>
                  );
              })}
          </div>

          {/* Desktop View */}
          <div className="overflow-x-auto hidden md:block">
            <table className="min-w-full table-auto">
              <thead className="text-left">
                <tr>
                   <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
                      {/* Placeholder for select all */}
                  </th>
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
                  const product = allRawProducts.find(product => product._id === itemId);

                  if (!product || cartItems[itemId] <= 0) return null;

                  const isStockLimitReached = cartItems[itemId] >= product.stock;

                  return (
                    <tr key={itemId}>
                      <td className="py-4 md:px-4 px-1">
                        <input 
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          checked={!!selectedItems[itemId]}
                          onChange={() => handleItemSelect(itemId)}
                        />
                      </td>
                      <td className="flex items-center gap-4 py-4 md:px-4 px-1">
                        <div>
                          <div className="rounded-lg overflow-hidden bg-gray-100 p-2">
                            <Image
                              src={product.image[0]}
                              alt={product.name}
                              className="w-16 h-16 object-contain"
                              width={64}
                              height={64}
                            />
                          </div>
                        </div>
                        <div className="text-sm">
                          <p className="text-gray-800">{product.name}</p>
                          <button
                            className="text-xs text-orange-600 mt-1"
                            onClick={() => updateCartQuantity(product._id, 0)}
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                      <td className="py-4 md:px-4 px-1 text-gray-600">{currency}{product.offerPrice.toFixed(2)}</td>
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
                                className="p-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isStockLimitReached}
                            >
                                <Plus className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>
                      </td>
                      <td className="py-4 md:px-4 px-1 text-gray-600">{currency}{(product.offerPrice * cartItems[itemId]).toFixed(2)}</td>
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
        <OrderSummary selectedItems={selectedItems} />
      </div>
    </>
  );
};

export default Cart;
