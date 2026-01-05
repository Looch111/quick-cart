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

export const AppContextProvider = (props) => {

    const currency = '$';
    const router = useRouter()
    const { user: firebaseUser, loading: authLoading } = useUser();
    const { signOut } = useAuth();
    const firestore = useFirestore();

    // App Data
    const { data: productsData, loading: productsLoading } = useCollection('products');
    const { data: ordersData, loading: ordersLoading } = useCollection('orders');
    const { data: bannersData, loading: bannersLoading } = useCollection('banners');
    const { data: promotionsData, loading: promotionsLoading } = useCollection('promotions');
    const { data: settingsData, loading: settingsLoading } = useDoc('settings', 'platform');

    const [products, setProducts] = useState([]);
    const [allOrders, setAllOrders] = useState([]);
    const [banners, setBanners] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [platformSettings, setPlatformSettings] = useState({});

    // User-specific Data
    const [userData, setUserData] = useState(undefined);
    const [userAddresses, setUserAddresses] = useState([]);
    const [userOrders, setUserOrders] = useState([]);

    const [isSeller, setIsSeller] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    
    // Derived state from userData
    const cartItems = userData?.cartItems || {};
    const wishlistItems = userData?.wishlistItems || {};
    const walletBalance = userData?.walletBalance || 0;
    const walletTransactions = userData?.walletTransactions || [];

    // Update global state when data loads
    useEffect(() => { if (!productsLoading) setProducts(productsData.map(p => ({ ...p, _id: p.id }))); }, [productsData, productsLoading]);
    useEffect(() => { if (!ordersLoading) setAllOrders(ordersData.map(o => ({...o, _id: o.id, date: o.date?.toDate ? o.date.toDate() : new Date(o.date) }))); }, [ordersData, ordersLoading]);
    useEffect(() => { if (!bannersLoading) setBanners(bannersData.map(b => ({ ...b, id: b.id }))); }, [bannersData, bannersLoading]);
    useEffect(() => { if (!promotionsLoading) setPromotions(promotionsData.map(p => ({ ...p, id: p.id }))); }, [promotionsData, promotionsLoading]);
    useEffect(() => { if (!settingsLoading && settingsData) setPlatformSettings(settingsData); }, [settingsData, settingsLoading]);


    // Effect to handle user authentication state changes
    useEffect(() => {
        let unsubscribeUser;
    
        const manageUser = async (currentUser) => {
          const userDocRef = doc(firestore, 'users', currentUser.uid);
          
          // Set up the real-time listener for user data
          unsubscribeUser = onSnapshot(userDocRef, (snapshot) => {
            if (snapshot.exists()) {
              const dbUser = snapshot.data();
              setUserData({ ...dbUser, _id: snapshot.id });
              setIsSeller(dbUser.role === 'seller');
              setIsAdmin(dbUser.role === 'admin');
            } else {
              // This case handles when a user is deleted from Firestore but still logged in.
              setUserData(null);
            }
          });
    
          // Check if the user document exists. If not, create it.
          const userDocSnap = await getDoc(userDocRef);
          if (!userDocSnap.exists()) {
            const newUser = {
              email: currentUser.email,
              name: currentUser.displayName || '',
              photoURL: currentUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${currentUser.email}`,
              role: 'buyer',
              cartItems: {},
              wishlistItems: {},
              walletBalance: 0,
              walletTransactions: [],
              createdAt: serverTimestamp()
            };
            await setDoc(userDocRef, newUser);
             setUserData({ ...newUser, _id: currentUser.uid });
          }
    
          setShowLogin(false);
        };
    
        if (!authLoading && firebaseUser) {
          manageUser(firebaseUser);
        } else if (!authLoading && !firebaseUser) {
          setUserData(null);
          setIsSeller(false);
          setIsAdmin(false);
        }
    
        return () => {
          if (unsubscribeUser) {
            unsubscribeUser();
          }
        };
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

    const updateSettings = async (newSettings) => {
        if (!isAdmin) {
            toast.error("You are not authorized to perform this action.");
            return;
        }
        const settingsDocRef = doc(firestore, 'settings', 'platform');
        await setDoc(settingsDocRef, newSettings, { merge: true });
        toast.success("Platform settings updated successfully!");
    };
    
    const addPromotion = async (newPromo) => {
        if (!isAdmin) {
            toast.error("You are not authorized to perform this action.");
            return;
        }
        const promotionsCollectionRef = collection(firestore, 'promotions');
        await addDoc(promotionsCollectionRef, {
            ...newPromo,
            value: Number(newPromo.value),
            status: 'active'
        });
        toast.success("Promotion added successfully!");
    };

    const deletePromotion = async (id) => {
        if (!isAdmin) {
            toast.error("You are not authorized to perform this action.");
            return;
        }
        await deleteDoc(doc(firestore, 'promotions', id));
        toast.success("Promotion deleted.");
    };

    const updatePromotionStatus = async (id, status) => {
        if (!isAdmin) {
            toast.error("You are not authorized to perform this action.");
            return;
        }
        const promoDocRef = doc(firestore, 'promotions', id);
        await setDoc(promoDocRef, { status }, { merge: true });
        toast.success(`Promotion ${status}.`);
    }

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

    const addBanner = async (newBanner) => {
        if (!isAdmin) {
            toast.error("You are not authorized to perform this action.");
            return;
        }
        const bannersCollectionRef = collection(firestore, 'banners');
        await addDoc(bannersCollectionRef, {
            ...newBanner,
            image: newBanner.image || "https://i.imgur.com/gB343so.png", // placeholder image
        });
        toast.success("Banner added successfully!");
    }

    const deleteBanner = async (id) => {
        if (!isAdmin) {
            toast.error("You are not authorized to perform this action.");
            return;
        }
        await deleteDoc(doc(firestore, 'banners', id));
        toast.success("Banner deleted.");
    }

    const updateBanner = async (updatedBanner) => {
        if (!isAdmin) {
            toast.error("You are not authorized to perform this action.");
            return;
        }
        const bannerDocRef = doc(firestore, 'banners', updatedBanner.id);
        await setDoc(bannerDocRef, updatedBanner, { merge: true });
        toast.success("Banner updated successfully!");
    }

    const updateBannerStatus = async (id, status) => {
        if (!isAdmin) {
            toast.error("You are not authorized to perform this action.");
            return;
        }
        const bannerDocRef = doc(firestore, 'banners', id);
        await setDoc(bannerDocRef, { status }, { merge: true });
        toast.success(`Banner ${status}.`);
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
            date: serverTimestamp(),
            status: isAdmin ? 'approved' : 'pending'
        });
        toast.success(isAdmin ? "Product added and approved!" : "Product submitted for approval!");
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
        const dataToUpdate = { ...updatedProduct };
        // If a seller updates a product, it should go back to pending for re-approval
        if (isSeller && !isAdmin) {
            dataToUpdate.status = 'pending';
        }
        await setDoc(productDocRef, dataToUpdate, { merge: true });
        toast.success(isSeller && !isAdmin ? "Product updated and sent for re-approval." : "Product updated successfully!");
    }

    const updateProductStatus = async (productId, status) => {
        if (!isAdmin) {
            toast.error("You are not authorized to perform this action.");
            return;
        }
        const productDocRef = doc(firestore, 'products', productId);
        await setDoc(productDocRef, { status }, { merge: true });
        toast.success(`Product status updated to ${status}.`);
    };

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

    const handleOnlinePayment = async (totalAmount) => {
        try {
            const response = await fetch('/api/pay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: totalAmount,
                    email: userData.email,
                    name: userData.name,
                    cart: cartItems
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Payment initialization failed with a non-JSON response.' }));
                throw new Error(errorData.message || 'Payment initialization failed.');
            }
            
            const data = await response.json();
            const { tx_ref } = data;

            window.FlutterwaveCheckout({
                public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
                tx_ref,
                amount: totalAmount,
                currency: "NGN",
                payment_options: "card,mobilemoney,ussd",
                redirect_url: `${window.location.origin}/order-placed`,
                customer: {
                    email: userData.email,
                    name: userData.name,
                },
                customizations: {
                    title: "QuickCart Store",
                    description: "Payment for items in cart",
                    logo: "https://i.imgur.com/Am9r4s8.png",
                },
                callback: function (data) {
                    console.log("Payment successful, webhook will handle finalization.", data);
                },
                onclose: function() {
                    toast.error("Payment popup closed.");
                },
            });
        } catch (error) {
            toast.error(error.message);
        }
    };
    
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
        
        if (paymentMethod === 'online') {
            await handleOnlinePayment(totalAmount);
            return;
        }

        const batch = writeBatch(firestore);
        
        try {
            const orderItems = Object.entries(cartItems).map(([itemId, quantity]) => {
                const product = products.find(p => p._id === itemId);
                if (!product) {
                    throw new Error(`Product with ID ${itemId} not found. Please remove it from your cart.`);
                }
                if (product.stock < quantity) {
                    throw new Error(`Not enough stock for ${product.name}.`);
                }
                return {
                    ...product, 
                    productId: itemId,
                    quantity,
                };
            });

            // Decrement stock
            for (const item of orderItems) {
                const productRef = doc(firestore, 'products', item.productId);
                const newStock = item.stock - item.quantity;
                batch.update(productRef, { stock: newStock });
            }

            const newOrderRef = doc(collection(firestore, 'orders'));
            batch.set(newOrderRef, {
                userId: userData._id,
                items: orderItems,
                amount: totalAmount,
                address: address,
                status: "Processing",
                date: serverTimestamp(),
                paymentMethod: paymentMethod,
            });

            const userDocRef = doc(firestore, 'users', userData._id);
            const userUpdates = {
                cartItems: {} 
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

            await batch.commit();
            router.push("/order-placed");
        } catch (error) {
            toast.error(error.message);
        }
    }

    const processSellerPayouts = async (order) => {
        const commissionRate = (platformSettings.commission || 0) / 100;
        const sellerPayouts = {}; // { sellerId: amount }

        order.items.forEach(item => {
            const sellerId = item.userId;
            if (sellerId) {
                const earnings = item.offerPrice * item.quantity;
                if (!sellerPayouts[sellerId]) {
                    sellerPayouts[sellerId] = 0;
                }
                sellerPayouts[sellerId] += earnings;
            }
        });

        const batch = writeBatch(firestore);

        for (const sellerId in sellerPayouts) {
            const sellerRef = doc(firestore, 'users', sellerId);
            const sellerSnap = await getDoc(sellerRef);

            if (sellerSnap.exists()) {
                const sellerData = sellerSnap.data();
                const grossSale = sellerPayouts[sellerId];
                const netEarnings = grossSale * (1 - commissionRate);
                const newBalance = (sellerData.walletBalance || 0) + netEarnings;

                const newTransaction = {
                    id: `txn_sale_${order._id.slice(-6)}_${Date.now()}`,
                    type: 'Sale',
                    amount: netEarnings,
                    date: new Date().toISOString(),
                    orderId: order._id,
                };
                
                const updatedTransactions = [newTransaction, ...(sellerData.walletTransactions || [])];

                batch.update(sellerRef, {
                    walletBalance: newBalance,
                    walletTransactions: updatedTransactions
                });
            }
        }
        await batch.commit();
        toast.success("Seller payouts processed!");
    };


    const updateOrderStatus = async (orderId, newStatus) => {
         if (!isAdmin) {
            toast.error("You are not authorized.");
            return false;
        }
        const orderDocRef = doc(firestore, 'orders', orderId);
        await setDoc(orderDocRef, { status: newStatus }, { merge: true });

        if (newStatus === "Delivered") {
            const orderSnap = await getDoc(orderDocRef);
            if (orderSnap.exists()) {
                await processSellerPayouts({ ...orderSnap.data(), _id: orderSnap.id });
            }
        }
        toast.success(`Order status updated to ${newStatus}`)
        return true;
    }

    const updateUserField = async (field, value) => {
        if (!userData) {
            toast.error("Please log in to update your profile.");
            setShowLogin(true);
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
        const newWishlist = { ...userData.wishlistItems };
        if (newWishlist[productId]) {
            delete newWishlist[productId];
            toast.success("Removed from wishlist");
        } else {
            newWishlist[productId] = true;
            toast.success("Added to wishlist");
        }
        
        // Optimistically update local state for immediate UI feedback
        setUserData(prevUserData => ({
            ...prevUserData,
            wishlistItems: newWishlist
        }));

        // Update firestore in the background
        const userDocRef = doc(firestore, 'users', userData._id);
        setDoc(userDocRef, { wishlistItems: newWishlist }, { merge: true });
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

    const approvedProducts = products.filter(p => p.status === 'approved');

    const value = {
        currency, router,
        userData, setUserData, isSeller, isAdmin,
        products: isAdmin ? products : approvedProducts,
        allRawProducts: products, // For admin/seller views
        productsLoading,
        cartItems,
        addToCart, updateCartQuantity,
        getCartCount, getCartAmount,
        wishlistItems, toggleWishlist,
        getWishlistCount,
        handleLogout,
        showLogin, setShowLogin,
        banners, addBanner, deleteBanner, updateBanner, updateBannerStatus,
        promotions, addPromotion, deletePromotion, updatePromotionStatus,
        userAddresses, addAddress,
        allOrders,
        placeOrder, userOrders,
        walletBalance, fundWallet, walletTransactions,
        updateOrderStatus,
        addProduct, updateProduct, deleteProduct, updateProductStatus,
        updateUserField,
        platformSettings, updateSettings, settingsLoading
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}
