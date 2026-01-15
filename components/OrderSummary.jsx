
'use client';
import { useAppContext } from "@/context/AppContext";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Wallet, X } from "lucide-react";
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import PaymentCancellationModal from "./PaymentCancellationModal";

const OrderSummary = () => {

  const { 
    currency, router, cartItems, userAddresses, 
    userData, setShowLogin, getCartAmount, walletBalance, platformSettings,
    placeOrder, placeOrderWithWallet, openAddressModal, allRawProducts, productsLoading,
    promotions, promotionsLoading
   } = useAppContext()

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('flutterwave');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [orderStatus, setOrderStatus] = useState('idle'); // idle, loading, done
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (userAddresses.length > 0) {
      setSelectedAddress(userAddresses[0]);
    } else {
      setSelectedAddress(null);
    }
  }, [userAddresses]);

  const cartAmount = getCartAmount();
  const deliveryFee = cartAmount > (platformSettings?.freeShippingThreshold || 50) ? 0 : (platformSettings?.shippingFee || 5);
  const totalAmount = cartAmount + deliveryFee - discount;

  const getCartCount = () => {
    if (!cartItems) return 0;
    return Object.values(cartItems).reduce((sum, quantity) => sum + quantity, 0);
  };

  const flutterwaveConfig = {
    public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: `QUICKCART-ORDER-${Date.now()}`,
    amount: totalAmount,
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd',
    customer: {
        email: userData?.email,
        name: selectedAddress?.fullName,
        phone_number: selectedAddress?.phoneNumber,
    },
    customizations: {
        title: 'QuickCart Order Payment',
        description: 'Payment for items in cart',
        logo: 'https://i.imgur.com/JCoOWiK.png',
    },
  };
  const handleFlutterwavePayment = useFlutterwave(flutterwaveConfig);

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setIsDropdownOpen(false);
  };
  
  const handleApplyPromo = () => {
    if (!promoCode) {
        toast.error("Please enter a promo code.");
        return;
    }
    const promo = promotions.find(p => p.code.toLowerCase() === promoCode.toLowerCase() && p.status === 'active');
    if (!promo) {
        toast.error("Invalid or inactive promo code.");
        setDiscount(0);
        setAppliedPromo(null);
        return;
    }
    if (new Date(promo.expiryDate) < new Date()) {
        toast.error("This promo code has expired.");
        setDiscount(0);
        setAppliedPromo(null);
        return;
    }

    let calculatedDiscount = 0;
    
    if (promo.type === 'percentage') {
        calculatedDiscount = (cartAmount * promo.value) / 100;
    } else if (promo.type === 'fixed') {
        calculatedDiscount = promo.value;
    } else if (promo.type === 'shipping') {
        calculatedDiscount = deliveryFee;
    }
    
    setDiscount(calculatedDiscount > cartAmount ? cartAmount : calculatedDiscount);
    setAppliedPromo(promo);
    toast.success(`Promo code "${promo.code}" applied successfully!`);
  };
  
  const handleRemovePromo = () => {
    setDiscount(0);
    setPromoCode('');
    setAppliedPromo(null);
    toast.success("Promo code removed.");
  };

  const executeOrderPlacement = async () => {
    setOrderStatus('loading');
    
    let result;
    if (paymentMethod === 'wallet') {
        result = await placeOrderWithWallet(selectedAddress, totalAmount, cartItems, allRawProducts);
    } else {
        result = await new Promise((resolve) => {
             handleFlutterwavePayment({
                callback: async (response) => {
                    const orderResult = await placeOrder(selectedAddress, response, totalAmount, cartItems, allRawProducts);
                    resolve(orderResult);
                    closePaymentModal();
                },
                onClose: () => {
                    setShowCancelModal(true);
                    resolve({ success: false });
                },
            });
        });
    }

    if (result.success) {
        setOrderStatus('done');
        setTimeout(() => {
            router.push('/order-placed');
        }, 1000);
    } else {
        setOrderStatus('idle'); // Reset on failure
        if(!showCancelModal) { // Avoid double toast
          toast.error("Order could not be placed.");
        }
    }
  }


  const handlePlaceOrder = async () => {
    if (!userData) {
      toast.error("Please log in to continue.");
      setShowLogin(true);
      return;
    }
    if (!selectedAddress) {
      toast.error("Please select a shipping address.");
      return;
    }
    if (getCartCount() === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    if (paymentMethod === 'wallet' && walletBalance < totalAmount) {
        toast.error("Insufficient wallet balance.");
        return;
    }

    executeOrderPlacement();
  }

  const isWalletDisabled = userData ? walletBalance < totalAmount : true;
  
  return (
    <>
    <div className="w-full md:w-96 bg-gray-500/5 p-5 rounded-lg">
      <h2 className="text-xl md:text-2xl font-medium text-gray-700">
        Order Summary
      </h2>
      <hr className="border-gray-500/30 my-5" />
      <div className="space-y-6">
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Select Address
          </label>
          <div className="relative inline-block w-full text-sm border rounded-md">
            <button
              className="peer w-full text-left px-4 pr-2 py-2 bg-white text-gray-700 focus:outline-none rounded-md"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={!userData}
            >
              <span className="truncate block">
                {selectedAddress
                  ? `${selectedAddress.fullName}, ${selectedAddress.hall}, Room ${selectedAddress.roomNumber}`
                  : "Select or Add Address"}
              </span>
              <svg className={`w-5 h-5 inline float-right transition-transform duration-200 ${isDropdownOpen ? "rotate-0" : "-rotate-90"}`}
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#6B7280"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && userData && (
              <ul className="absolute w-full bg-white border shadow-md mt-1 z-10 py-1.5 rounded-md">
                {userAddresses.map((address, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer truncate"
                    onClick={() => handleAddressSelect(address)}
                  >
                    {address.fullName}, {address.hall}, Room {address.roomNumber}
                  </li>
                ))}
                <li
                  onClick={() => {
                    openAddressModal();
                    setIsDropdownOpen(false);
                  }}
                  className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer text-center font-medium text-orange-600"
                >
                  + Add New Address
                </li>
              </ul>
            )}
          </div>
        </div>
        
        <div>
            <label className="text-base font-medium uppercase text-gray-600 block mb-2">
                Payment Method
            </label>
            <div className="space-y-2">
                <label className={`flex items-center p-3 border rounded-md cursor-pointer ${paymentMethod === 'flutterwave' ? 'bg-orange-50 border-orange-400' : 'bg-white'}`}>
                    <input type="radio" name="payment" className="h-4 w-4 text-orange-600" value="flutterwave" checked={paymentMethod === 'flutterwave'} onChange={() => setPaymentMethod('flutterwave')} disabled={!userData} />
                    <span className="ml-3 text-sm font-medium text-gray-700">Pay with Flutterwave</span>
                </label>
                <label className={`flex items-center p-3 border rounded-md cursor-pointer ${paymentMethod === 'wallet' ? 'bg-orange-50 border-orange-400' : 'bg-white'} ${isWalletDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <input type="radio" name="payment" className="h-4 w-4 text-orange-600" value="wallet" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} disabled={!userData || isWalletDisabled} />
                    <span className="ml-3 text-sm font-medium text-gray-700">Pay with Wallet</span>
                    {userData && (
                        <span className="ml-auto text-xs font-semibold text-green-600">Balance: {currency}{walletBalance.toFixed(2)}</span>
                    )}
                </label>
            </div>
        </div>

        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Promo Code
          </label>
          <div className="flex items-start gap-3">
            <input
              type="text"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="flex-grow w-full outline-none p-2.5 text-gray-600 border border-gray-300 rounded-md"
              disabled={!!appliedPromo || promotionsLoading}
            />
            <button onClick={handleApplyPromo} className="bg-orange-600 text-white px-9 py-2.5 hover:bg-orange-700 rounded-full text-sm disabled:bg-orange-300" disabled={!!appliedPromo || promotionsLoading}>
              Apply
            </button>
          </div>
        </div>

        <hr className="border-gray-500/30 my-5" />

        <div className="space-y-4">
          <div className="flex justify-between text-base font-medium">
            <p className="uppercase text-gray-600">Items ({getCartCount()})</p>
            <p className="text-gray-800">{currency}{cartAmount.toFixed(2)}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Shipping Fee</p>
            <p className="font-medium text-gray-800">{deliveryFee === 0 ? 'Free' : `${currency}${deliveryFee.toFixed(2)}`}</p>
          </div>
          {appliedPromo && (
              <div className="flex justify-between text-green-600">
                <div className="flex items-center gap-2">
                  <p>Discount ({appliedPromo.code})</p>
                  <button onClick={handleRemovePromo} className="text-red-500 hover:text-red-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="font-medium">-{currency}{discount.toFixed(2)}</p>
              </div>
            )}
          <div className="flex justify-between text-lg md:text-xl font-medium border-t pt-3">
            <p>Total</p>
            <p>{currency}{totalAmount.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <button 
        onClick={handlePlaceOrder} 
        disabled={orderStatus === 'loading' || orderStatus === 'done' || getCartCount() === 0 || productsLoading}
        className="w-full bg-orange-600 text-white py-3 rounded-full hover:bg-orange-700 transition font-semibold disabled:bg-orange-400 disabled:cursor-not-allowed mt-5"
      >
        {orderStatus === 'loading' ? 'Placing Order...' : orderStatus === 'done' ? 'Order Placed!' : 'Place Order'}
      </button>
    </div>
    <PaymentCancellationModal
        show={showCancelModal}
        onCancel={() => setShowCancelModal(false)}
        onResume={() => {
            setShowCancelModal(false);
            executeOrderPlacement();
        }}
    />
    </>
  );
};

export default OrderSummary;
