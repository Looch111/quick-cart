import { useAppContext } from "@/context/AppContext";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Wallet, X } from "lucide-react";

const OrderSummary = () => {

  const { currency, router, getCartCount, getCartAmount, userAddresses, placeOrder, userData, setShowLogin, walletBalance, promotions, platformSettings } = useAppContext()
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState(null);

  useEffect(() => {
    if (userAddresses.length > 0) {
      setSelectedAddress(userAddresses[0]);
    } else {
      setSelectedAddress(null);
    }
  }, [userAddresses])

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
    const cartAmount = getCartAmount();
    const deliveryFee = getCartAmount() > (platformSettings.freeShippingThreshold || 50) ? 0 : (platformSettings.shippingFee || 5);

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

  const deliveryFee = getCartAmount() > (platformSettings.freeShippingThreshold || 50) ? 0 : (platformSettings.shippingFee || 5);
  const totalAmount = getCartAmount() + deliveryFee - discount;

  const handlePlaceOrder = async () => {
    if (!userData) {
      toast.error("Please log in to place an order.");
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

    await placeOrder(selectedAddress, paymentMethod, totalAmount);
  }

  return (
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
                  ? `${selectedAddress.fullName}, ${selectedAddress.area}, ${selectedAddress.city}`
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
                    {address.fullName}, {address.area}, {address.city}, {address.state}
                  </li>
                ))}
                <li
                  onClick={() => router.push("/add-address")}
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
                <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-100">
                    <input type="radio" name="payment" className="h-4 w-4 text-orange-600" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                    <span className="ml-3 text-sm font-medium text-gray-700">Cash on Delivery (COD)</span>
                </label>
                <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-100">
                    <input type="radio" name="payment" className="h-4 w-4 text-orange-600" value="wallet" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} disabled={!userData} />
                    <span className="ml-3 text-sm font-medium text-gray-700">Pay with Wallet</span>
                    {userData && (
                        <span className="ml-auto text-xs font-semibold text-green-600">Balance: ${walletBalance.toFixed(2)}</span>
                    )}
                </label>
                 <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-100">
                    <input type="radio" name="payment" className="h-4 w-4 text-orange-600" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} />
                    <span className="ml-3 text-sm font-medium text-gray-700">Online Payment (Card)</span>
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
              className="flex-grow w-full outline-none p-2.5 text-gray-600 border rounded-md"
              disabled={!!appliedPromo}
            />
            <button onClick={handleApplyPromo} className="bg-orange-600 text-white px-9 py-2.5 hover:bg-orange-700 rounded-full text-sm disabled:bg-orange-300" disabled={!!appliedPromo}>
              Apply
            </button>
          </div>
        </div>

        <hr className="border-gray-500/30 my-5" />

        <div className="space-y-4">
          <div className="flex justify-between text-base font-medium">
            <p className="uppercase text-gray-600">Items ({getCartCount()})</p>
            <p className="text-gray-800">{currency}{getCartAmount().toFixed(2)}</p>
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

      <button onClick={handlePlaceOrder} className="w-full bg-orange-600 text-white py-3 mt-5 hover:bg-orange-700 rounded-full">
        Place Order
      </button>
    </div>
  );
};

export default OrderSummary;
