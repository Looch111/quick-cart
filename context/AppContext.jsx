'use client'
import { productsDummyData, userDummyData } from "@/assets/assets";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext)
}

export const AppContextProvider = (props) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY
    const router = useRouter()

    const [products, setProducts] = useState([])
    const [userData, setUserData] = useState(null)
    const [isSeller, setIsSeller] = useState(true)
    const [cartItems, setCartItems] = useState({})
    const [wishlistItems, setWishlistItems] = useState({});

    const fetchProductData = async () => {
        setProducts(productsDummyData)
    }

    const fetchUserData = async () => {
        // Here you would fetch user data if logged in
        // For now, we'll leave it null initially
        // setUserData(userDummyData) 
    }

    const addToCart = async (itemId) => {

        let cartData = structuredClone(cartItems);
        if (cartData[itemId]) {
            cartData[itemId] += 1;
        }
        else {
            cartData[itemId] = 1;
        }
        setCartItems(cartData);

    }

    const updateCartQuantity = async (itemId, quantity) => {

        let cartData = structuredClone(cartItems);
        if (quantity === 0) {
            delete cartData[itemId];
        } else {
            cartData[itemId] = quantity;
        }
        setCartItems(cartData)

    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            if (cartItems[items] > 0) {
                totalCount += cartItems[items];
            }
        }
        return totalCount;
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            if (cartItems[items] > 0) {
                totalAmount += itemInfo.offerPrice * cartItems[items];
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }

    const toggleWishlist = (productId) => {
        setWishlistItems(prev => {
            const newWishlist = { ...prev };
            if (newWishlist[productId]) {
                delete newWishlist[productId];
            } else {
                newWishlist[productId] = true;
            }
            return newWishlist;
        });
    }

    const getWishlistCount = () => {
        return Object.keys(wishlistItems).length;
    }
    
    const handleLogout = () => {
        // Here you would typically clear tokens, user data, etc.
        // For this dummy setup, we can just clear some state.
        setUserData(null);
        setIsSeller(false);
        setCartItems({});
        setWishlistItems({});
        toast.success("Logged out successfully");
        router.push('/');
    }

    useEffect(() => {
        fetchProductData()
    }, [])

    useEffect(() => {
        fetchUserData()
    }, [])

    const value = {
        currency, router,
        isSeller, setIsSeller,
        userData, fetchUserData, setUserData,
        products, fetchProductData,
        cartItems, setCartItems,
        addToCart, updateCartQuantity,
        getCartCount, getCartAmount,
        wishlistItems, toggleWishlist,
        getWishlistCount,
        handleLogout
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}
