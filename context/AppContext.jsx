
'use client'
import { assets } from "@/assets/assets";
import { useAuth, useUser } from "@/src/firebase/auth/use-user";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useFirestore, useCollection, useDoc } from "@/src/firebase";
import { doc, setDoc, addDoc, deleteDoc, collection, serverTimestamp, getDocs, query, where, writeBatch, onSnapshot, getDoc, runTransaction, increment, arrayUnion } from "firebase/firestore";
import { getAdditionalUserInfo } from "firebase/auth";

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
    const { data: usersData, loading: usersLoading } = useCollection('users');

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

    const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
    const [productForSizeSelection, setProductForSizeSelection] = useState(null);
    
    const cartItems = userData?.cartItems || {};
    const wishlistItems = userData?.wishlistItems || {};
    const walletBalance = userData?.walletBalance || 0;
    const walletTransactions = userData?.walletTransactions || [];
    const sellerWalletBalance = userData?.sellerWallet?.balance || 0;
    const sellerWalletTransactions = userData?.sellerWallet?.transactions || [];

    const openSizeModal = (product) => {
        setProductForSizeSelection(product);
        setIsSizeModalOpen(true);
    };

    const closeSizeModal = () => {
        setProductForSizeSelection(null);
        setIsSizeModalOpen(false);
    };

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
              setIsSeller(dbUser.role === 'seller' || dbUser.role === 'admin');
              setIsAdmin(dbUser.role === 'admin');
            } else {
              // This case might happen briefly if the document is being created.
               setUserData(null);
            }
          });
    
          const userDocSnap = await getDoc(userDocRef);
          if (!userDocSnap.exists()) {
            const newUser = {
              email: currentUser.email,
              name: currentUser.displayName || '',
              photoURL: currentUser.photoURL,
              role: 'buyer',
              cartItems: {},
              wishlistItems: {},
              walletBalance: 0,
              walletTransactions: [],
              sellerWallet: {
                balance: 0,
                transactions: [],
                bankDetails: {
                  accountHolder: '',
                  accountNumber: '',
                  bankName: '',
                  ifscCode: ''
                }
              },
              createdAt: serverTimestamp(),
              isNewUser: true // Flag for onboarding tour
            };
            await setDoc(userDocRef, newUser);
             // The onSnapshot listener will pick this up and set userData
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

    const verifyFlutterwaveTransaction = async (transactionId, userId) => {
        const loadingToast = toast.loading('Verifying your payment...');
        try {
            const response = await fetch('/api/verify-flutterwave', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ transactionId, userId }),
            });
            return await response.json();
        } catch (error) {
            console.error("Verification API call failed:", error);
            return { success: false, message: "Failed to connect to verification service." };
        } finally {
            toast.dismiss(loadingToast);
        }
    };
    
    const generateNotifications = async (order, orderId) => {
        const adminUsers = usersData.filter(u => u.role === 'admin');
        const sellerIds = [...new Set(order.items.map(item => item.userId))];
    
        const notifications = [];
    
        // Admin notifications
        adminUsers.forEach(admin => {
            notifications.push({
                userId: admin.id,
                message: `New order #${orderId.slice(-6)} has been placed.`,
                link: '/admin/orders',
                read: false,
                createdAt: serverTimestamp()
            });
        });
    
        // Seller notifications
        sellerIds.forEach(sellerId => {
            if (sellerId) {
                notifications.push({
                    userId: sellerId,
                    message: `You have a new order for your product(s)! Order #${orderId.slice(-6)}.`,
                    link: '/seller/orders',
                    read: false,
                    createdAt: serverTimestamp()
                });
            }
        });
    
        const batch = writeBatch(firestore);
        notifications.forEach(notif => {
            const notifRef = doc(collection(firestore, `users/${notif.userId}/notifications`));
            batch.set(notifRef, notif);
        });
    
        await batch.commit();
    };
    
    const placeOrder = async (address, paymentResponse, totalAmount, itemsToOrder) => {
        if (!userData) {
            toast.error("Please log in to place an order.");
            return { success: false };
        }

        const verificationResponse = await verifyFlutterwaveTransaction(paymentResponse.transaction_id, userData._id);

        if (!verificationResponse.success || verificationResponse.data.status !== 'successful') {
            toast.error("Payment verification failed.");
            return { success: false };
        }
        if (verificationResponse.data.amount !== totalAmount) {
            toast.error("Payment amount mismatch. Please contact support.");
            return { success: false };
        }

        const batch = writeBatch(firestore);
        
        try {
            const orderItems = [];
            for (const itemId in itemsToOrder) {
                const product = allRawProducts.find(p => p._id === itemId);
                if (!product) throw new Error(`Product with ID ${itemId} not found.`);
                if (product.stock < itemsToOrder[itemId]) throw new Error(`Not enough stock for ${product.name}.`);
                orderItems.push({ 
                    ...product, 
                    productId: itemId, 
                    quantity: itemsToOrder[itemId], 
                    status: 'Processing', // Set initial item status
                    sellerId: product.userId
                });
            }

            const updatedCartItems = { ...cartItems };
            for (const item of orderItems) {
                const productRef = doc(firestore, 'products', item.productId);
                batch.update(productRef, { stock: increment(-item.quantity) });
                delete updatedCartItems[item.productId];
            }

            const newOrderRef = doc(collection(firestore, 'orders'));
            const newOrderData = {
                userId: userData._id,
                items: orderItems.map(({_id, name, offerPrice, image, quantity, sellerId, status, price, flashSalePrice}) => ({_id, name, offerPrice, image, quantity, sellerId, status, price, flashSalePrice})),
                amount: totalAmount,
                address: address,
                status: "Order Placed", // Overall order status
                date: serverTimestamp(),
                paymentMethod: 'flutterwave',
                paymentTransactionId: paymentResponse.transaction_id,
            };
            batch.set(newOrderRef, newOrderData);

            const userDocRef = doc(firestore, 'users', userData._id);
            batch.update(userDocRef, { cartItems: updatedCartItems });

            await batch.commit();
            await generateNotifications(newOrderData, newOrderRef.id);
            return { success: true };
        } catch (error) {
            toast.error(error.message);
            return { success: false };
        }
    }
    
    const placeOrderWithWallet = async (address, totalAmount, itemsToOrder) => {
        if (!userData) {
            toast.error("Please log in to place an order.");
            return { success: false };
        }
        if (walletBalance < totalAmount) {
            toast.error("Insufficient wallet balance.");
            return { success: false };
        }

        const batch = writeBatch(firestore);
        try {
            const orderItems = [];
            for (const itemId in itemsToOrder) {
                const product = allRawProducts.find(p => p._id === itemId);
                if (!product) throw new Error(`Product with ID ${itemId} not found.`);
                if (product.stock < itemsToOrder[itemId]) throw new Error(`Not enough stock for ${product.name}.`);
                orderItems.push({ 
                    ...product, 
                    productId: itemId, 
                    quantity: itemsToOrder[itemId],
                    status: 'Processing', // Set initial item status
                    sellerId: product.userId
                });
            }
            
            const updatedCartItems = { ...cartItems };
            for (const item of orderItems) {
                const productRef = doc(firestore, 'products', item.productId);
                batch.update(productRef, { stock: increment(-item.quantity) });
                delete updatedCartItems[item.productId];
            }

            const newOrderRef = doc(collection(firestore, 'orders'));
            const newOrderData = {
                userId: userData._id,
                items: orderItems.map(({_id, name, offerPrice, image, quantity, sellerId, status, price, flashSalePrice}) => ({_id, name, offerPrice, image, quantity, sellerId, status, price, flashSalePrice})),
                amount: totalAmount,
                address: address,
                status: "Order Placed", // Overall order status
                date: serverTimestamp(),
                paymentMethod: 'wallet'
            };
            batch.set(newOrderRef, newOrderData);
            const userDocRef = doc(firestore, 'users', userData._id);
            const newTransaction = {
                id: newOrderRef.id,
                type: 'Payment',
                amount: -totalAmount,
                date: new Date().toISOString(),
            };
            batch.update(userDocRef, {
                cartItems: updatedCartItems,
                walletBalance: increment(-totalAmount),
                walletTransactions: arrayUnion(newTransaction)
            });
            await batch.commit();
            await generateNotifications(newOrderData, newOrderRef.id);
            return { success: true };
        } catch (error) {
            toast.error(error.message);
            return { success: false };
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
                const grossSale = sellerPayouts[sellerId];
                const commission = grossSale * commissionRate;
                const netEarnings = grossSale - commission;
                
                const newTransaction = {
                    id: `txn_sale_${order._id.slice(-6)}_${Date.now()}`,
                    type: 'Sale',
                    grossSale: grossSale,
                    commission: commission,
                    netEarnings: netEarnings,
                    date: new Date().toISOString(),
                    orderId: order._id,
                };
                
                batch.update(sellerRef, {
                    'sellerWallet.balance': increment(netEarnings),
                    'sellerWallet.transactions': arrayUnion(newTransaction)
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
            if (showLogin) return;
            setShowLogin(true);
            return;
        }
        const userDocRef = doc(firestore, 'users', userData._id);
        try {
            await setDoc(userDocRef, { [field]: value }, { merge: true });
        } catch (error) {
            console.error("Error updating user field:", error);
            toast.error("Failed to update profile.");
        }
    }

    const updateSellerBankDetails = async (bankDetails) => {
        if (!userData || (!isSeller && !isAdmin)) {
            toast.error("You are not authorized to perform this action.");
            return;
        }
        const userDocRef = doc(firestore, 'users', userData._id);
        await setDoc(userDocRef, { sellerWallet: { bankDetails: bankDetails } }, { merge: true });
        toast.success("Bank details updated successfully!");
    }

    const addToCart = async (itemId) => {
        if (!userData) {
            setShowLogin(true);
            return;
        }
    
        const userDocRef = doc(firestore, 'users', userData._id);
    
        try {
            await runTransaction(firestore, async (transaction) => {
                const userDoc = await transaction.get(userDocRef);
                if (!userDoc.exists()) {
                    throw "User document does not exist!";
                }

                // Check for size variants
                const [productId, size] = itemId.split('_');
                const product = allRawProducts.find(p => p._id === productId);

                if (!product) {
                    toast.error("Product not found.", { id: `not-found-${itemId}` });
                    return; // Stop transaction
                }
    
                const currentCart = userDoc.data().cartItems || {};
                const currentQuantityInCart = currentCart[itemId] || 0;
    
                if (currentQuantityInCart >= product.stock) {
                    toast.error(`No more stock available for ${product.name}${size ? ` (Size: ${size})` : ''}`, { id: `stock-toast-${itemId}` });
                    return; 
                }
    
                const newCart = { ...currentCart };
                newCart[itemId] = currentQuantityInCart + 1;
                transaction.update(userDocRef, { cartItems: newCart });
                toast.success("Product added to cart", { id: `add-toast-${itemId}` });
            });
        } catch (error) {
            console.error("Add to cart transaction failed: ", error);
        }
    };
    
    const addMultipleToCart = async (items) => {
        if (!userData) {
            setShowLogin(true);
            return;
        }
        const userDocRef = doc(firestore, 'users', userData._id);
        try {
            await runTransaction(firestore, async (transaction) => {
                const userDoc = await transaction.get(userDocRef);
                if (!userDoc.exists()) throw "User document does not exist!";

                const currentCart = userDoc.data().cartItems || {};
                const newCart = { ...currentCart };
                let allItemsAdded = true;

                for (const item of items) {
                    const [productId, size] = item.id.split('_');
                    const product = allRawProducts.find(p => p._id === productId);
                    if (!product) {
                        toast.error(`Product with ID ${productId} not found.`);
                        allItemsAdded = false;
                        continue;
                    }
                    const stockForSize = product.sizes ? product.sizes[size] : product.stock;
                    const currentQuantityInCart = newCart[item.id] || 0;

                    if ((currentQuantityInCart + item.quantity) > stockForSize) {
                        toast.error(`Not enough stock for ${product.name} (Size: ${size}). Only ${stockForSize - currentQuantityInCart} more available.`);
                        allItemsAdded = false;
                    } else {
                         newCart[item.id] = currentQuantityInCart + item.quantity;
                    }
                }
                
                transaction.update(userDocRef, { cartItems: newCart });
                if(allItemsAdded) {
                    toast.success("Selected items added to cart!");
                } else {
                    toast.warn("Some items could not be fully added due to stock limits.");
                }
            });
        } catch (error) {
            console.error("Add multiple to cart transaction failed: ", error);
            toast.error("Could not update cart.");
        }
    }


    const updateCartQuantity = async (itemId, quantity) => {
        if (!userData) {
            setShowLogin(true);
            return;
        }
    
        const userDocRef = doc(firestore, 'users', userData._id);
    
        try {
            await runTransaction(firestore, async (transaction) => {
                const userDoc = await transaction.get(userDocRef);
                if (!userDoc.exists()) {
                    throw "User document does not exist!";
                }
    
                const currentCart = userDoc.data().cartItems || {};
                const newCart = { ...currentCart };

                const [productId, size] = itemId.split('_');
                const product = allRawProducts.find(p => p._id === productId);
    
                if (quantity <= 0) {
                    delete newCart[itemId];
                } else {
                    const stockForSize = product.sizes ? product.sizes[size] : product.stock;
                    if (product && quantity > stockForSize) {
                        toast.error(`Only ${stockForSize} items available for ${product.name}${size ? ` (Size: ${size})` : ''}`, { id: `stock-toast-${itemId}` });
                        newCart[itemId] = stockForSize;
                    } else {
                        newCart[itemId] = quantity;
                    }
                }
                transaction.update(userDocRef, { cartItems: newCart });
            });
    
            if (quantity <= 0) {
                toast.success("Item removed from cart", { id: `remove-item-${itemId}` });
            }
        } catch (error) {
            console.error("Update cart quantity transaction failed: ", error);
        }
    };
    
    const getCartCount = () => {
        if (!cartItems) return 0;
        return Object.values(cartItems).reduce((sum, quantity) => sum + quantity, 0);
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        if (!allRawProducts.length || !cartItems) return 0;
        
        for (const itemId in cartItems) {
            const [productId] = itemId.split('_');
            let itemInfo = allRawProducts.find((product) => product._id === productId);

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
            setShowLogin(true);
            return;
        }
        const newWishlist = { ...userData.wishlistItems };
        if (newWishlist[productId]) {
            delete newWishlist[productId];
        } else {
            newWishlist[productId] = true;
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
        userData, setUserData, isSeller, isAdmin, authLoading,
        products,
        allRawProducts, 
        productsLoading,
        cartItems,
        addToCart, updateCartQuantity, addMultipleToCart,
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
        sellerWalletBalance, sellerWalletTransactions,
        updateOrderStatus,
        addProduct, updateProduct, deleteProduct, updateProductStatus,
        updateUserField, updateSellerBankDetails,
        platformSettings, updateSettings, settingsLoading,
        verifyFlutterwaveTransaction,
        placeOrderWithWallet,
        isSizeModalOpen, openSizeModal, closeSizeModal, productForSizeSelection
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}
