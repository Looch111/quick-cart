'use client'
import { assets } from "@/assets/assets";
import { useAuth, useUser } from "@/src/firebase/auth/use-user";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useFirestore, useCollection, useDoc } from "@/src/firebase";
import { doc, setDoc, addDoc, deleteDoc, collection, serverTimestamp, getDocs, query, where, writeBatch, onSnapshot, getDoc } from "firebase/firestore";

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
    const firestore = useFirestore();

    // App Data
    const { data: products, loading: productsLoading } = useCollection('products');
    const { data: allOrders, loading: ordersLoading } = useCollection('orders');

    // User-specific Data
    const [userData, setUserData] = useState(null);
    const [userAddresses, setUserAddresses] = useState([]);
    const [userOrders, setUserOrders] = useState([]);

    const [isSeller, setIsSeller] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showLogin, setShowLogin] = useState(false);

    // Static Banners
    const [banners, setBanners] = useState([
        { id: 'slide1', title: 'The Latest Collection of Headphones', image: assets.header_headphone_image.src, link: '/all-products', status: 'active', buttonText: 'Buy now', linkText: 'Find more' },
        { id: 'slide2', title: 'Experience Gaming Like Never Before', image: assets.header_playstation_image.src, link: '/all-products', status: 'active', buttonText: 'Shop now', linkText: 'Explore Deals' },
        { id: 'slide3', title: 'High-Performance Laptops for Every Need', image: assets.header_macbook_image.src, link: '/all-products', status: 'active', buttonText: 'Order now', linkText: 'Learn More' },
    ]);
    
    // Derived state from userData
    const cartItems = userData?.cartItems || {};
    const wishlistItems = userData?.wishlistItems || {};
    const walletBalance = userData?.walletBalance || 0;
    const walletTransactions = userData?.walletTransactions || [];


    // Effect to handle user authentication state changes
    useEffect(() => {
        if (!authLoading && firebaseUser) {
            const userDocRef = doc(firestore, 'users', firebaseUser.uid);
            const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
                if (snapshot.exists()) {
                    const dbUser = snapshot.data();
                    setUserData({ ...dbUser, _id: snapshot.id });
                    setIsSeller(dbUser.role === 'seller');
                    setIsAdmin(dbUser.role === 'admin');
                } else {
                    // Create user document if it doesn't exist
                    const newUser = {
                        email: firebaseUser.email,
                        name: '',
                        photoURL: firebaseUser.photoURL || '',
                        role: 'buyer',
                        cartItems: {},
                        wishlistItems: {},
                        walletBalance: 0,
                        walletTransactions: [],
                    };
                    setDoc(userDocRef, newUser).then(() => {
                        setUserData({ ...newUser, _id: firebaseUser.uid });
                        setIsSeller(false);
                        setIsAdmin(false);
                    });
                }
            });
            setShowLogin(false);
            return () => unsubscribe();

        } else if (!authLoading && !firebaseUser) {
            setUserData(null);
            setIsSeller(false);
            setIsAdmin(false);
        }
    }, [firebaseUser, authLoading, firestore]);

     // Effect to fetch user-specific sub-collections
    useEffect(() => {
        if (userData?._id) {
            const addressesRef = collection(firestore, 'users', userData._id, 'addresses');
            const unsubscribeAddresses = onSnapshot(addressesRef, (snapshot) => {
                const addresses = snapshot.docs.map(doc => ({ ...doc.data(), _id: doc.id }));
                setUserAddresses(addresses);
            });
            
            const ordersQuery = query(collection(firestore, 'orders'), where('userId', '==', userData._id));
            const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
                const orders = snapshot.docs.map(doc => ({ ...doc.data(), _id: doc.id, date: doc.data().date.toDate() }));
                setUserOrders(orders);
            });

            return () => {
                unsubscribeAddresses();
                unsubscribeOrders();
            };
        } else {
            setUserAddresses([]);
            setUserOrders([]);
        }
    }, [userData, firestore]);

    // --- DATA MUTATION FUNCTIONS ---

    const fundWallet = async (amount) => {
        if (!userData) {
            toast.error("Please log in to fund your wallet.");
            setShowLogin(true);
            return;
        }
        const userDocRef = doc(firestore, 'users', userData._id);
        const newBalance = (userData.walletBalance || 0) + amount;
        const newTransaction = {
            id: `txn_${Date.now()}`,
            type: 'Top Up',
            amount: amount,
            date: new Date().toISOString(),
        };
        const updatedTransactions = [newTransaction, ...(userData.walletTransactions || [])];
        
        await setDoc(userDocRef, { 
            walletBalance: newBalance,
            walletTransactions: updatedTransactions 
        }, { merge: true });

        toast.success(`$${amount.toFixed(2)} added to your wallet.`);
    };

    const addAddress = async (newAddress) => {
        if (!userData) {
            toast.error("Please log in to add an address.");
            setShowLogin(true);
            return;
        }
        const addressCollectionRef = collection(firestore, 'users', userData._id, 'addresses');
        await addDoc(addressCollectionRef, newAddress);
        toast.success("Address added successfully!");
        router.back(); 
    }

    const addBanner = (newBanner) => {
        if (!isAdmin) {
            toast.error("You are not authorized to perform this action.");
            return;
        }
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
        if (!isAdmin) {
            toast.error("You are not authorized to perform this action.");
            return;
        }
        setBanners(banners.filter(b => b.id !== id));
        toast.success("Banner deleted.");
    }

    const updateBanner = (updatedBanner) => {
        if (!isAdmin) {
            toast.error("You are not authorized to perform this action.");
            return;
        }
        setBanners(banners.map(b => (b.id === updatedBanner.id ? updatedBanner : b)));
        toast.success("Banner updated successfully!");
    }
    
    const addProduct = async (productData) => {
        if (!userData) {
            toast.error("Please log in to add a product.");
            setShowLogin(true);
            return;
        }
        if (!isSeller && !isAdmin) {
            toast.error("You must be a seller or admin to add a product.");
            return;
        }
        const productsCollectionRef = collection(firestore, 'products');
        await addDoc(productsCollectionRef, {
            ...productData,
            userId: userData._id,
            date: serverTimestamp()
        });
        toast.success("Product added successfully!");
    }

    const updateProduct = async (updatedProduct) => {
        if (!userData) {
            toast.error("Please log in to update a product.");
            setShowLogin(true);
            return;
        }

        const canUpdate = isAdmin || (isSeller && updatedProduct.userId === userData._id);
        if (!canUpdate) {
            toast.error("You are not authorized to update this product.");
            return;
        }

        const productDocRef = doc(firestore, 'products', updatedProduct._id);
        await setDoc(productDocRef, updatedProduct, { merge: true });
        toast.success("Product updated successfully!");
    }

    const deleteProduct = async (productId) => {
        if (!userData) {
            toast.error("Please log in to delete a product.");
            setShowLogin(true);
            return;
        }
        
        const productRef = doc(firestore, 'products', productId);
        const productSnap = await getDoc(productRef);

        if (!productSnap.exists()) {
            toast.error("Product not found.");
            return;
        }

        const productData = productSnap.data();
        const canDelete = isAdmin || (isSeller && productData.userId === userData._id);

        if (!canDelete) {
            toast.error("You are not authorized to delete this product.");
            return;
        }

        await deleteDoc(productRef);
        toast.success("Product deleted successfully");
    }
    
    const placeOrder = async (address, paymentMethod, totalAmount) => {
        if (!userData) {
            toast.error("Please log in to place an order.");
            setShowLogin(true);
            return;
        }
         if (getCartCount() === 0) {
            toast.error("Your cart is empty.");
            return;
        }

        const batch = writeBatch(firestore);
        
        // 1. Create the new order
        const newOrderRef = doc(collection(firestore, 'orders'));
        const orderItems = Object.entries(cartItems).map(([itemId, quantity]) => {
            const product = products.find(p => p._id === itemId);
            return {
                ...product, // Embed product details
                productId: itemId,
                quantity,
            };
        });

        batch.set(newOrderRef, {
            userId: userData._id,
            items: orderItems,
            amount: totalAmount,
            address: address,
            status: "Processing",
            date: serverTimestamp(),
            paymentMethod: paymentMethod,
        });

        // 2. Update user document
        const userDocRef = doc(firestore, 'users', userData._id);
        const userUpdates = {
            cartItems: {} // Clear cart
        };

        if (paymentMethod === 'wallet') {
            const newBalance = (userData.walletBalance || 0) - totalAmount;
            const newTransaction = {
                id: `txn_${Date.now()}`,
                type: 'Payment',
                amount: -totalAmount,
                date: new Date().toISOString(),
            };
            const updatedTransactions = [newTransaction, ...(userData.walletTransactions || [])];
            userUpdates.walletBalance = newBalance;
            userUpdates.walletTransactions = updatedTransactions;
        }
        
        batch.update(userDocRef, userUpdates);

        // 3. Commit the batch
        await batch.commit();
    }

    const updateOrderStatus = async (orderId, newStatus) => {
         if (!isAdmin) {
            toast.error("You are not authorized.");
            return { success: false };
        }
        const orderDocRef = doc(firestore, 'orders', orderId);
        await setDoc(orderDocRef, { status: newStatus }, { merge: true });
        return { success: true };
    }

    const updateUserField = async (field, value) => {
        if (!userData) {
            return;
        }
        const userDocRef = doc(firestore, 'users', userData._id);
        await setDoc(userDocRef, { [field]: value }, { merge: true });
    }

    const addToCart = (itemId) => {
        if (!userData) {
            toast.error("Please log in to add items to your cart.");
            setShowLogin(true);
            return;
        }
        const newCart = { ...cartItems };
        newCart[itemId] = (newCart[itemId] || 0) + 1;
        updateUserField('cartItems', newCart);
        toast.success("Product added to cart");
    }

    const updateCartQuantity = (itemId, quantity) => {
        if (!userData) {
            toast.error("Please log in to modify your cart.");
            setShowLogin(true);
            return;
        }
        const newCart = { ...cartItems };
        if (quantity <= 0) {
            delete newCart[itemId];
            toast.success("Item removed from cart");
        } else {
            newCart[itemId] = quantity;
        }
        updateUserField('cartItems', newCart);
    }

    const getCartCount = () => {
        if (!cartItems) return 0;
        return Object.values(cartItems).reduce((sum, quantity) => sum + quantity, 0);
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        if (!products.length || !cartItems) return 0;
        
        for (const itemId in cartItems) {
            let itemInfo = products.find((product) => product._id === itemId);
            if (itemInfo && cartItems[itemId] > 0) {
                totalAmount += itemInfo.offerPrice * cartItems[itemId];
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }

    const toggleWishlist = (productId) => {
        if (!userData) {
            toast.error("Please log in to manage your wishlist.");
            setShowLogin(true);
            return;
        }
        const newWishlist = { ...wishlistItems };
        if (newWishlist[productId]) {
            delete newWishlist[productId];
            toast.success("Removed from wishlist");
        } else {
            newWishlist[productId] = true;
            toast.success("Added to wishlist");
        }
        updateUserField('wishlistItems', newWishlist);
    }

    const getWishlistCount = () => {
        if (!wishlistItems) return 0;
        return Object.keys(wishlistItems).length;
    }

    const handleLogout = async () => {
        await signOut();
        toast.success("Logged out successfully");
        router.push('/');
    }

    const value = {
        currency, router,
        userData, setUserData, isSeller, isAdmin,
        products: products || [], 
        productsLoading,
        cartItems,
        addToCart, updateCartQuantity,
        getCartCount, getCartAmount,
        wishlistItems, toggleWishlist,
        getWishlistCount,
        handleLogout,
        showLogin, setShowLogin,
        banners, addBanner, deleteBanner, updateBanner,
        userAddresses, addAddress,
        allOrders: allOrders ? allOrders.map(o => ({ ...o, date: o.date?.toDate ? o.date.toDate() : new Date(o.date) })) : [], 
        placeOrder, userOrders,
        walletBalance, fundWallet, walletTransactions,
        updateOrderStatus,
        addProduct, updateProduct, deleteProduct,
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}
