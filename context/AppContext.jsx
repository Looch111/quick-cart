'use client'
import { assets } from "@/assets/assets";
import { useAuth, useUser } from "@/src/firebase/auth/use-user";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useFirestore, useCollection, useDoc } from "@/src/firebase";
import { doc, setDoc, addDoc, deleteDoc, collection, serverTimestamp, getDocs, query, where, writeBatch, onSnapshot, getDoc, runTransaction, increment, arrayUnion } from "firebase/firestore";

export const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext)
}

export const AppContextProvider = (props) => {

    const currency = '₦';
    const router = useRouter()
    const { user: firebaseUser, loading: authLoading } = useUser();
    const { signOut } = useAuth();
    const firestore = useFirestore();

    const { data: productsData, loading: productsLoading } = useCollection('products');
    const { data: ordersData, loading: ordersLoading } = useCollection('orders');
    const { data: bannersData, loading: bannersLoading } = useCollection('banners');
    const { data: promotionsData, loading: promotionsLoading } = useCollection('promotions');
    const { data: settingsData, loading: settingsLoading } = useDoc('settings', 'platform');

    const [products, setProducts] = useState([]);
    const [allRawProducts, setAllRawProducts] = useState([]);
    const [allOrders, setAllOrders] = useState([]);
    const [banners, setBanners] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [platformSettings, setPlatformSettings] = useState({});
    const [userData, setUserData] = useState(undefined);
    const [userAddresses, setUserAddresses] = useState([]);
    const [userOrders, setUserOrders] = useState([]);
    const [isSeller, setIsSeller] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    
    const cartItems = userData?.cartItems || {};
    const wishlistItems = userData?.wishlistItems || {};
    const walletBalance = userData?.walletBalance || 0;
    const walletTransactions = userData?.walletTransactions || [];

    useEffect(() => { 
        if (!productsLoading) {
            const mappedProducts = productsData.map(p => ({ ...p, _id: p.id }));
            setAllRawProducts(mappedProducts);
            setProducts(mappedProducts.filter(p => p.status === 'approved'));
        }
    }, [productsData, productsLoading]);
    useEffect(() => { if (!ordersLoading) setAllOrders(ordersData.map(o => ({...o, _id: o.id, date: o.date?.toDate ? o.date.toDate() : new Date(o.date) }))); }, [ordersData, ordersLoading]);
    useEffect(() => { if (!bannersLoading) setBanners(bannersData.map(b => ({ ...b, id: b.id }))); }, [bannersData, bannersLoading]);
    useEffect(() => { if (!promotionsLoading) setPromotions(promotionsData.map(p => ({ ...p, id: p.id }))); }, [promotionsData, promotionsLoading]);
    useEffect(() => { if (!settingsLoading && settingsData) setPlatformSettings(settingsData); }, [settingsData, settingsLoading]);

    useEffect(() => {
        let unsubscribeUser;
    
        const manageUser = async (currentUser) => {
          const userDocRef = doc(firestore, 'users', currentUser.uid);
          
          unsubscribeUser = onSnapshot(userDocRef, (snapshot) => {
            if (snapshot.exists()) {
              const dbUser = snapshot.data();
              setUserData({ ...dbUser, _id: snapshot.id });
              setIsSeller(dbUser.role === 'seller');
              setIsAdmin(dbUser.role === 'admin');
            } else {
              setUserData(null);
            }
          });
    
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

    useEffect(() => {
        if (userData?._id) {
            const addressesRef = collection(firestore, 'users', userData._id, 'addresses');
            const unsubscribeAddresses = onSnapshot(addressesRef, (snapshot) => {
                const addresses = snapshot.docs.map(doc => ({ ...doc.data(), _id: doc.id }));
                setUserAddresses(addresses);
            });
            
            const ordersQuery = query(collection(firestore, 'orders'), where('userId', '==', userData._id), where('status', 'not-in', ['pending', 'failed']));
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
            image: newBanner.image || "https://i.imgur.com/gB343so.png",
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

    const verifyFlutterwaveTransaction = async (transactionId) => {
        try {
            const response = await fetch('/api/verify-flutterwave', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ transactionId }),
            });
            return await response.json();
        } catch (error) {
            console.error("Verification API call failed:", error);
            return { success: false, message: "Failed to connect to verification service." };
        }
    };

    const depositToWallet = async (amount, transactionId) => {
        if (!userData) {
            return { success: false, message: "User not authenticated." };
        }
        const userRef = doc(firestore, 'users', userData._id);
        try {
            await runTransaction(firestore, async (transaction) => {
                const userDoc = await transaction.get(userRef);
                if (!userDoc.exists()) {
                    throw "User does not exist.";
                }
                const transactions = userDoc.data().walletTransactions || [];
                const isDuplicate = transactions.some(tx => tx.id === transactionId);
                if (isDuplicate) {
                    toast.error("This transaction has already been processed.");
                    throw "This transaction has already been processed.";
                }
                transaction.update(userRef, {
                    walletBalance: increment(amount),
                    walletTransactions: arrayUnion({
                        id: transactionId,
                        type: 'Top Up',
                        amount: amount,
                        date: new Date().toISOString(),
                    })
                });
            });
            return { success: true };
        } catch (error) {
            console.error("Error depositing to wallet:", error);
            return { success: false, message: error.toString() };
        }
    };
    
    const placeOrder = async (address, paymentResponse, totalAmount) => {
        if (!userData) {
            toast.error("Please log in to place an order.");
            return;
        }

        const verificationResponse = await verifyFlutterwaveTransaction(paymentResponse.transaction_id);

        if (!verificationResponse.success || verificationResponse.data.status !== 'successful') {
            toast.error("Payment verification failed.");
            return;
        }
        if (verificationResponse.data.amount !== totalAmount) {
            toast.error("Payment amount mismatch. Please contact support.");
            return;
        }

        const batch = writeBatch(firestore);
        
        try {
            const orderItems = [];
            for (const itemId in cartItems) {
                const product = allRawProducts.find(p => p._id === itemId);
                if (!product) throw new Error(`Product with ID ${itemId} not found.`);
                if (product.stock < cartItems[itemId]) throw new Error(`Not enough stock for ${product.name}.`);
                orderItems.push({ ...product, productId: itemId, quantity: cartItems[itemId] });
            }

            for (const item of orderItems) {
                const productRef = doc(firestore, 'products', item.productId);
                batch.update(productRef, { stock: increment(-item.quantity) });
            }

            const newOrderRef = doc(collection(firestore, 'orders'));
            batch.set(newOrderRef, {
                userId: userData._id,
                items: orderItems.map(({_id, name, offerPrice, image, quantity, userId, price, flashSalePrice}) => ({_id, name, offerPrice, image, quantity, userId, price, flashSalePrice})),
                amount: totalAmount,
                address: address,
                status: "Order Placed",
                date: serverTimestamp(),
                paymentMethod: 'flutterwave',
                paymentTransactionId: paymentResponse.transaction_id,
            });

            const userDocRef = doc(firestore, 'users', userData._id);
            batch.update(userDocRef, { cartItems: {} });

            await batch.commit();
            router.push("/order-placed");
        } catch (error) {
            toast.error(error.message);
        }
    }
    
    const placeOrderWithWallet = async (address, totalAmount) => {
        if (!userData) {
            toast.error("Please log in to place an order.");
            return;
        }
        if (walletBalance < totalAmount) {
            toast.error("Insufficient wallet balance.");
            return;
        }

        const batch = writeBatch(firestore);
        try {
            const orderItems = [];
            for (const itemId in cartItems) {
                const product = allRawProducts.find(p => p._id === itemId);
                if (!product) throw new Error(`Product with ID ${itemId} not found.`);
                if (product.stock < cartItems[itemId]) throw new Error(`Not enough stock for ${product.name}.`);
                orderItems.push({ ...product, productId: itemId, quantity: cartItems[itemId] });
            }
            for (const item of orderItems) {
                const productRef = doc(firestore, 'products', item.productId);
                batch.update(productRef, { stock: increment(-item.quantity) });
            }
            const newOrderRef = doc(collection(firestore, 'orders'));
            batch.set(newOrderRef, {
                userId: userData._id,
                items: orderItems.map(({_id, name, offerPrice, image, quantity, userId, price, flashSalePrice}) => ({_id, name, offerPrice, image, quantity, userId, price, flashSalePrice})),
                amount: totalAmount,
                address: address,
                status: "Order Placed",
                date: serverTimestamp(),
                paymentMethod: 'wallet'
            });
            const userDocRef = doc(firestore, 'users', userData._id);
            const newTransaction = {
                id: newOrderRef.id,
                type: 'Payment',
                amount: -totalAmount,
                date: new Date().toISOString(),
            };
            batch.update(userDocRef, {
                cartItems: {},
                walletBalance: increment(-totalAmount),
                walletTransactions: arrayUnion(newTransaction)
            });
            await batch.commit();
            router.push("/order-placed");
        } catch (error) {
            toast.error(error.message);
        }
    };


    const processSellerPayouts = async (order) => {
        const commissionRate = (platformSettings.commission || 0) / 100;
        const sellerPayouts = {}; 

        order.items.forEach(item => {
            const sellerId = item.userId;
            if (sellerId) {
                const isFlashSale = item.flashSalePrice && item.flashSaleEndDate && new Date(item.flashSaleEndDate) > new Date();
                const salePrice = isFlashSale ? item.flashSalePrice : item.offerPrice;
                const earnings = salePrice * item.quantity;
                if (!sellerPayouts[sellerId]) sellerPayouts[sellerId] = 0;
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
                
                const newTransaction = {
                    id: `txn_sale_${order._id.slice(-6)}_${Date.now()}`,
                    type: 'Sale',
                    amount: netEarnings,
                    date: new Date().toISOString(),
                    orderId: order._id,
                };
                
                batch.update(sellerRef, {
                    walletBalance: increment(netEarnings),
                    walletTransactions: arrayUnion(newTransaction)
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
        const product = allRawProducts.find(p => p._id === itemId);
        if (!product) {
            toast.error("Product not found.");
            return;
        }
        const currentQuantityInCart = cartItems[itemId] || 0;
        if (currentQuantityInCart >= product.stock) {
            toast.error(`No more stock available for ${product.name}`);
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
        const product = allRawProducts.find(p => p._id === itemId);
        if (!product) {
            toast.error("Product not found.");
            return;
        }

        if (quantity > product.stock) {
            toast.error(`Only ${product.stock} items available for ${product.name}`);
            quantity = product.stock;
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
        if (!allRawProducts.length || !cartItems) return 0;
        
        for (const itemId in cartItems) {
            let itemInfo = allRawProducts.find((product) => product._id === itemId);
            if (itemInfo && cartItems[itemId] > 0) {
                const isFlashSale = itemInfo.flashSalePrice && itemInfo.flashSaleEndDate && new Date(itemInfo.flashSaleEndDate) > new Date();
                const currentPrice = isFlashSale ? itemInfo.flashSalePrice : itemInfo.offerPrice;
                totalAmount += Number(currentPrice) * cartItems[itemId];
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
        products,
        allRawProducts, 
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
        walletBalance, walletTransactions,
        updateOrderStatus,
        addProduct, updateProduct, deleteProduct, updateProductStatus,
        updateUserField,
        platformSettings, updateSettings, settingsLoading,
        verifyFlutterwaveTransaction,
        depositToWallet,
        placeOrderWithWallet
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}
