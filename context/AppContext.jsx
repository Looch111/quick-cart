'use client'
import { assets, productsDummyData, userDummyData } from "@/assets/assets";
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
    const [cartItems, setCartItems] = useState({})
    const [wishlistItems, setWishlistItems] = useState({});
    const [showLogin, setShowLogin] = useState(false);
    const [banners, setBanners] = useState([
        { id: 'slide1', title: 'The Latest Collection of Headphones', image: assets.header_headphone_image.src, link: '/all-products', status: 'active', buttonText: 'Buy now', linkText: 'Find more' },
        { id: 'slide2', title: 'Experience Gaming Like Never Before', image: assets.header_playstation_image.src, link: '/all-products', status: 'active', buttonText: 'Shop now', linkText: 'Explore Deals' },
        { id: 'slide3', title: 'High-Performance Laptops for Every Need', image: assets.header_macbook_image.src, link: '/all-products', status: 'active', buttonText: 'Order now', linkText: 'Learn More' },
    ]);

    const addBanner = (newBanner) => {
        const newBannerData = {
            id: `banner_${Date.now()}`,
            title: newBanner.title,
            image: assets.jbl_soundbox_image.src, // Using a persistent image from assets
            link: newBanner.link,
            status: 'active',
            buttonText: newBanner.buttonText,
            linkText: newBanner.linkText
        };
        setBanners([...banners, newBannerData]);
        toast.success("Banner added successfully!");
    }

    const deleteBanner = (id) => {
        setBanners(banners.filter(b => b.id !== id));
        toast.success("Banner deleted.");
    }

    const fetchProductData = async () => {
        setProducts(productsDummyData)
    }

    const fetchUserData = async () => {
        // Here you would fetch user data if logged in
        // For now, we'll leave it null initially
        // setUserData(userDummyData) 
    }

    const addToCart = (itemId) => {
        setCartItems(prev => {
            const newCart = { ...prev };
            if (newCart[itemId]) {
                newCart[itemId] += 1;
            } else {
                newCart[itemId] = 1;
            }
            return newCart;
        });
        toast.success("Product added to cart");
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
        const isWishlisted = !!wishlistItems[productId];
    
        setWishlistItems(prev => {
            const newWishlist = { ...prev };
            if (isWishlisted) {
                delete newWishlist[productId];
            } else {
                newWishlist[productId] = true;
            }
            return newWishlist;
        });
    
        if (isWishlisted) {
            toast.success("Removed from wishlist");
        } else {
            toast.success("Added to wishlist");
        }
    }

    const getWishlistCount = () => {
        return Object.keys(wishlistItems).length;
    }
    
    const handleLogout = () => {
        // Here you would typically clear tokens, user data, etc.
        // For this dummy setup, we can just clear some state.
        setUserData(null);
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
        userData, fetchUserData, setUserData,
        products, fetchProductData,
        cartItems, setCartItems,
        addToCart, updateCartQuantity,
        getCartCount, getCartAmount,
        wishlistItems, toggleWishlist,
        getWishlistCount,
        handleLogout,
        showLogin, setShowLogin,
        banners, addBanner, deleteBanner,
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}
