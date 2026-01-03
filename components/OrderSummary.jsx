import { useAppContext } from "@/context/AppContext";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const OrderSummary = () => {

  const { currency, router, getCartCount, getCartAmount, userAddresses, fetchUserAddresses, placeOrder, userData, setShowLogin } = useAppContext()
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (userData) {
      fetchUserAddresses();
    }
  }, [userData, fetchUserAddresses])

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

    await placeOrder(selectedAddress);
    router.push("/order-placed");
  }

  const deliveryFee = getCartAmount() > 50 ? 0 : 5;
  const tax = Math.floor(getCartAmount() * 0.02);
  const totalAmount = getCartAmount() + tax + deliveryFee;

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
            Promo Code
          </label>
          <div className="flex items-start gap-3">
            <input
              type="text"
              placeholder="Enter promo code"
              className="flex-grow w-full outline-none p-2.5 text-gray-600 border rounded-md"
            />
            <button className="bg-orange-600 text-white px-9 py-2.5 hover:bg-orange-700 rounded-full text-sm">
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
          <div className="flex justify-between">
            <p className="text-gray-600">Tax (2%)</p>
            <p className="font-medium text-gray-800">{currency}{tax.toFixed(2)}</p>
          </div>
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
