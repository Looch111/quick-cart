
'use client'
import { assets, productsDummyData, userDummyData, addressDummyData, orderDummyData } from "@/assets/assets";
import { useAuth, useUser } from "@/firebase/auth/use-user";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext)
}

const isBrowser = typeof window !== 'undefined';

export const AppContextProvider = (props) => {

    const currency = '$';
    const router = useRouter()
    const { user: firebaseUser, loading: authLoading } = useUser();
    const { signOut } = useAuth();

    const [products, setProducts] = useState(productsDummyData)
    const [userData, setUserData] = useState(null)
    const [isSeller, setIsSeller] = useState(false);
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
    const [walletBalance, setWalletBalance] = useState(0);
    const [walletTransactions, setWalletTransactions] = useState([]);

    useEffect(() => {
        if (!authLoading) {
            if (firebaseUser) {
                // A simplified mapping from Firebase user to your app's user data structure
                const appUser = {
                    _id: firebaseUser.uid,
                    name: firebaseUser.displayName || "User",
                    email: firebaseUser.email,
                    imageUrl: firebaseUser.photoURL || userDummyData.imageUrl, // Fallback to dummy
                    role: 'buyer', // Default role, you'll need to manage roles in Firestore
                };
                setUserData(appUser);
                setIsSeller(appUser.role === 'seller');
                setShowLogin(false);
            } else {
                setUserData(null);
                setIsSeller(false);
            }
        }
    }, [firebaseUser, authLoading]);


    const fundWallet = (amount) => {
        const newBalance = walletBalance + amount;
        setWalletBalance(newBalance);
        const newTransaction = {
            id: `txn_${Date.now()}`,
            type: 'Top Up',
            amount: amount,
            date: new Date().toISOString(),
        };
        const updatedTransactions = [newTransaction, ...walletTransactions];
        setWalletTransactions(updatedTransactions);

        if (isBrowser) {
            localStorage.setItem('walletBalance', newBalance);
            localStorage.setItem('walletTransactions', JSON.stringify(updatedTransactions));
        }
        toast.success(`$${amount.toFixed(2)} added to your wallet.`);
    };

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
    
    const fetchAllOrders = useCallback(() => {
        if (!isBrowser) return { success: false, orders: [] };
        const storedOrders = localStorage.getItem('allOrders');
        const orders = storedOrders ? JSON.parse(storedOrders) : orderDummyData;
        
        setAllOrders(prevOrders => {
            if (JSON.stringify(prevOrders) !== JSON.stringify(orders)) {
                return orders;
            }
            return prevOrders;
        });

        return { success: true, orders: orders };
    }, []);


    const fetchUserOrders = async () => {
        if (!isBrowser || !userData) return { success: false, orders: [] };
        const storedOrders = localStorage.getItem('allOrders');
        const allOrders = storedOrders ? JSON.parse(storedOrders) : orderDummyData;
        const userOrders = allOrders.filter(order => order.userId === userData._id);
        return { success: true, orders: userOrders };
    };
    
    const placeOrder = async (address, paymentMethod, totalAmount) => {
        const newOrder = {
            _id: `order_${Date.now()}`,
            userId: userData._id,
            items: Object.entries(cartItems).map(([itemId, quantity]) => ({
                product: products.find(p => p._id === itemId),
                quantity,
            })),
            amount: totalAmount,
            address: address,
            status: "Processing",
            date: Date.now(),
            paymentMethod: paymentMethod,
        };

        if (paymentMethod === 'wallet') {
            const newBalance = walletBalance - totalAmount;
            setWalletBalance(newBalance);
            const newTransaction = {
                id: `txn_${Date.now()}`,
                type: 'Payment',
                amount: -totalAmount,
                date: new Date().toISOString(),
            };
            const updatedTransactions = [newTransaction, ...walletTransactions];
            setWalletTransactions(updatedTransactions);
            if (isBrowser) {
                localStorage.setItem('walletBalance', newBalance);
                localStorage.setItem('walletTransactions', JSON.stringify(updatedTransactions));
            }
        }

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

    const updateOrderStatus = async (orderId, newStatus) => {
        const updatedOrders = allOrders.map(order => 
            order._id === orderId ? { ...order, status: newStatus } : order
        );
        setAllOrders(updatedOrders);
        if (isBrowser) {
            localStorage.setItem('allOrders', JSON.stringify(updatedOrders));
        }
        return { success: true };
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
        let message = "";
        setCartItems(prev => {
            const newCart = { ...prev };
            if (quantity <= 0) {
                delete newCart[itemId];
                message = "Item removed from cart";
            } else {
                newCart[itemId] = quantity;
            }
            if (isBrowser) {
                localStorage.setItem('cartItems', JSON.stringify(newCart));
            }
            return newCart;
        });

        if(message) {
            toast.success(message);
        }
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
        let message;
    
        setWishlistItems(prev => {
            const newWishlist = { ...prev };
            if (isWishlisted) {
                delete newWishlist[productId];
                message = "Removed from wishlist";
            } else {
                newWishlist[productId] = true;
                message = "Added to wishlist";
            }
            if (isBrowser) {
                localStorage.setItem('wishlistItems', JSON.stringify(newWishlist));
            }
            return newWishlist;
        });
    
        if (message) {
            toast.success(message);
        }
    }

    const getWishlistCount = () => {
        return Object.keys(wishlistItems).length;
    }
    
    const handleLogin = () => {
        // This function will now be handled by the LoginPopup component
        setShowLogin(true);
    }

    const handleLogout = async () => {
        await signOut();
        setUserData(null);
        setIsSeller(false);
        setCartItems({});
        setWishlistItems({});
        if (isBrowser) {
            localStorage.removeItem('cartItems');
            localStorage.removeItem('wishlistItems');
        }
        toast.success("Logged out successfully");
        router.push('/');
    }

    useEffect(() => {
        if (!isBrowser) return;

        const storedProducts = localStorage.getItem('products');
        if (storedProducts) setProducts(JSON.parse(storedProducts));

        const storedCart = localStorage.getItem('cartItems');
        if (storedCart) setCartItems(JSON.parse(storedCart));

        const storedWishlist = localStorage.getItem('wishlistItems');
        if (storedWishlist) setWishlistItems(JSON.parse(storedWishlist));

        const storedWalletBalance = localStorage.getItem('walletBalance');
        if (storedWalletBalance) setWalletBalance(parseFloat(storedWalletBalance));

        const storedWalletTransactions = localStorage.getItem('walletTransactions');
        if (storedWalletTransactions) setWalletTransactions(JSON.parse(storedWalletTransactions));

        fetchAllOrders();
    }, [fetchAllOrders])

    const value = {
        currency, router,
        userData, setUserData, isSeller,
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
        allOrders, fetchAllOrders, placeOrder, fetchUserOrders,
        walletBalance, fundWallet, walletTransactions,
        updateOrderStatus,
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}
