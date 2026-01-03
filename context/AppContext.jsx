'use client'
import { assets, productsDummyData, userDummyData, addressDummyData, orderDummyData } from "@/assets/assets";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext)
}

const isBrowser = typeof window !== 'undefined';

export const AppContextProvider = (props) => {

    const currency = '$';
    const router = useRouter()

    const [products, setProducts] = useState(productsDummyData)
    const [userData, setUserData] = useState(null)
    const [cartItems, setCartItems] = useState({})
    const [wishlistItems, setWishlistItems] = useState({});
    const [showLogin, setShowLogin] = useState(false);
    const [banners, setBanners] = useState([
        { id: 'slide1', title: 'The Latest Collection of Headphones', image: assets.header_headphone_image.src, link: '/all-products', status: 'active', buttonText: 'Buy now', linkText: 'Find more' },
        { id: 'slide2', title: 'Experience Gaming Like Never Before', image: assets.header_playstation_image.src, link: '/all-products', status: 'active', buttonText: 'Shop now', linkText: 'Explore Deals' },
        { id: 'slide3', title: 'High-Performance Laptops for Every Need', image: assets.header_macbook_image.src, link: '/all-products', status: 'active', buttonText: 'Order now', linkText: 'Learn More' },
    ]);
    const [userAddresses, setUserAddresses] = useState([]);
    const [allOrders, setAllOrders] = useState([]);


    const addAddress = (newAddress) => {
        const addressToAdd = { ...newAddress, _id: `addr_${Date.now()}`};
        const updatedAddresses = [...userAddresses, addressToAdd];
        setUserAddresses(updatedAddresses);
        if (isBrowser) {
            localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses));
        }
        toast.success("Address added successfully!");
        router.back(); 
    }

    const addBanner = (newBanner) => {
        const newBannerData = {
            id: `banner_${Date.now()}`,
            title: newBanner.title,
            image: assets.jbl_soundbox_image.src, 
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

    const updateBanner = (updatedBanner) => {
        setBanners(banners.map(b => (b.id === updatedBanner.id ? updatedBanner : b)));
        toast.success("Banner updated successfully!");
    }
    
    const addProduct = (productData) => {
        const newProduct = {
            ...productData,
            _id: `prod_${Date.now()}`,
            userId: userData?._id || 'user_2sZFHS1UIIysJyDVzCpQhUhTIhw',
            date: Date.now()
        };
        const updatedProducts = [newProduct, ...products];
        setProducts(updatedProducts);
        if (isBrowser) {
            localStorage.setItem('products', JSON.stringify(updatedProducts));
        }
        toast.success("Product added successfully!");
    }

    const updateProduct = (updatedProduct) => {
        const updatedProducts = products.map(p => (p._id === updatedProduct._id ? updatedProduct : p));
        setProducts(updatedProducts);
        if (isBrowser) {
            localStorage.setItem('products', JSON.stringify(updatedProducts));
        }
        toast.success("Product updated successfully!");
    }

    const deleteProduct = (productId) => {
        const updatedProducts = products.filter(p => p._id !== productId);
        setProducts(updatedProducts);
        if (isBrowser) {
            localStorage.setItem('products', JSON.stringify(updatedProducts));
        }
    }

    const fetchUserAddresses = async () => {
        if (!isBrowser) return;
        const storedAddresses = localStorage.getItem('userAddresses');
        setUserAddresses(storedAddresses ? JSON.parse(storedAddresses) : addressDummyData);
    }
    
    const fetchAllOrders = async () => {
        if (!isBrowser) return;
        const storedOrders = localStorage.getItem('allOrders');
        setAllOrders(storedOrders ? JSON.parse(storedOrders) : orderDummyData);
    }
    
    const placeOrder = async (address) => {
        const newOrder = {
            _id: `order_${Date.now()}`,
            userId: userData._id,
            items: Object.entries(cartItems).map(([itemId, quantity]) => ({
                product: products.find(p => p._id === itemId),
                quantity,
            })),
            amount: getCartAmount() + Math.floor(getCartAmount() * 0.02) + (getCartAmount() > 50 ? 0 : 5),
            address: address,
            status: "Order Placed",
            date: Date.now(),
        };

        const updatedOrders = [newOrder, ...allOrders];
        setAllOrders(updatedOrders);
        if (isBrowser) {
            localStorage.setItem('allOrders', JSON.stringify(updatedOrders));
        }
        setCartItems({});
        if (isBrowser) {
            localStorage.removeItem('cartItems');
        }
        toast.success("Order placed successfully!");
    }


    const addToCart = (itemId) => {
        setCartItems(prev => {
            const newCart = { ...prev };
            if (newCart[itemId]) {
                newCart[itemId] += 1;
            } else {
                newCart[itemId] = 1;
            }
            if (isBrowser) {
                localStorage.setItem('cartItems', JSON.stringify(newCart));
            }
            return newCart;
        });
        toast.success("Product added to cart");
    }

    const updateCartQuantity = (itemId, quantity) => {
        if (quantity <= 0) {
            toast.success("Item removed from cart");
        }
        setCartItems(prev => {
            const newCart = { ...prev };
            if (quantity <= 0) {
                delete newCart[itemId];
            } else {
                newCart[itemId] = quantity;
            }
            if (isBrowser) {
                localStorage.setItem('cartItems', JSON.stringify(newCart));
            }
            return newCart;
        });
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
            if (itemInfo && cartItems[items] > 0) {
                totalAmount += itemInfo.offerPrice * cartItems[items];
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }

    const toggleWishlist = (productId) => {
        const isWishlisted = !!wishlistItems[productId];
        
        const newWishlist = { ...wishlistItems };
        if (isWishlisted) {
            delete newWishlist[productId];
            toast.success("Removed from wishlist");
        } else {
            newWishlist[productId] = true;
            toast.success("Added to wishlist");
        }

        setWishlistItems(newWishlist);
        if (isBrowser) {
            localStorage.setItem('wishlistItems', JSON.stringify(newWishlist));
        }
    }

    const getWishlistCount = () => {
        return Object.keys(wishlistItems).length;
    }
    
    const handleLogin = () => {
        if (isBrowser) {
            localStorage.setItem('userData', JSON.stringify(userDummyData));
        }
        setUserData(userDummyData);
        fetchUserAddresses();
        setShowLogin(false);
        toast.success(`Welcome back, ${userDummyData.name}!`);
    }

    const handleLogout = () => {
        if (isBrowser) {
            localStorage.removeItem('userData');
            // We keep cart and wishlist so they can log back in and have them
        }
        setUserData(null);
        toast.success("Logged out successfully");
        router.push('/');
    }

    useEffect(() => {
        if (!isBrowser) return;

        const storedProducts = localStorage.getItem('products');
        if (storedProducts) setProducts(JSON.parse(storedProducts));

        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) setUserData(JSON.parse(storedUserData));

        const storedCart = localStorage.getItem('cartItems');
        if (storedCart) setCartItems(JSON.parse(storedCart));

        const storedWishlist = localStorage.getItem('wishlistItems');
        if (storedWishlist) setWishlistItems(JSON.parse(storedWishlist));

        fetchAllOrders();
    }, [])

    const value = {
        currency, router,
        userData, setUserData,
        products, setProducts, addProduct, updateProduct, deleteProduct,
        cartItems, setCartItems,
        addToCart, updateCartQuantity,
        getCartCount, getCartAmount,
        wishlistItems, toggleWishlist,
        getWishlistCount,
        handleLogin, handleLogout,
        showLogin, setShowLogin,
        banners, addBanner, deleteBanner, updateBanner,
        userAddresses, addAddress, fetchUserAddresses,
        allOrders, fetchAllOrders, placeOrder,
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}
