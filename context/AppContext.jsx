
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
    
    // Data is now fetched directly in the components that need it.
    // This avoids fetching all data for all users on every page load.
    const { data: allRawProducts, loading: productsLoading } = useCollection('products');
    const { data: banners, loading: bannersLoading } = useCollection('banners');
    const { data: promotions, loading: promotionsLoading } = useCollection('promotions');
    const { data: settingsData, loading: settingsLoading } = useDoc('settings', 'platform');
    
    const [platformSettings, setPlatformSettings] = useState({});
    const [userData, setUserData] = useState(undefined);
    const [userAddresses, setUserAddresses] = useState([]);
    const [userOrders, setUserOrders] = useState([]);
    const [isSeller, setIsSeller] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showLogin, setShowLogin] = useState(false);

    const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
    const [productForSizeSelection, setProductForSizeSelection] = useState(null);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
    const [orderForDispute, setOrderForDispute] = useState(null);
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
    
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
    
    const openAddressModal = () => setIsAddressModalOpen(true);
    const closeAddressModal = () => setIsAddressModalOpen(false);

    const openDisputeModal = (order) => {
        setOrderForDispute(order);
        setIsDisputeModalOpen(true);
    };

    const closeDisputeModal = () => {
        setOrderForDispute(null);
        setIsDisputeModalOpen(false);
    };
    
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
              purchasedProducts: [],
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
              isNewUser: true
            };
            await setDoc(userDocRef, newUser);
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
                const orders = snapshot.docs.map(doc => ({ ...doc.data(), _id: doc.id, date: doc.data().date?.toDate ? doc.data().date.toDate() : new Date() }));
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

    useEffect(() => {
        if (userData && !isAdmin) {
            const convRef = doc(firestore, 'conversations', userData._id);
            const unsubscribe = onSnapshot(convRef, (doc) => {
                if (doc.exists() && doc.data().userUnread) {
                    setHasUnreadMessages(true);
                } else {
                    setHasUnreadMessages(false);
                }
            });
            return () => unsubscribe();
        } else {
            setHasUnreadMessages(false);
        }
    }, [userData, isAdmin, firestore]);

    const openChatModal = async () => {
        setIsChatModalOpen(true);
        if (!userData || isAdmin) return;
    
        const conversationRef = doc(firestore, 'conversations', userData._id);
        const convSnap = await getDoc(conversationRef);
        if (convSnap.exists() && convSnap.data().userUnread) {
            await setDoc(conversationRef, { userUnread: false }, { merge: true });
        }
    };

    const closeChatModal = () => setIsChatModalOpen(false);

    const sendMessage = async (text) => {
        if (!userData) return;
    
        const conversationRef = doc(firestore, 'conversations', userData._id);
        const messagesRef = collection(conversationRef, 'messages');
    
        try {
            const messageData = {
                text,
                senderId: userData._id,
                senderName: userData.name || 'User',
                senderRole: 'user',
                createdAt: serverTimestamp(),
            };
    
            await addDoc(messagesRef, messageData);
            
            await setDoc(conversationRef, {
                userId: userData._id,
                userName: userData.name || 'User',
                lastMessage: text,
                lastMessageAt: serverTimestamp(),
                userUnread: false,
                adminUnread: true,
            }, { merge: true });
    
        } catch (error) {
            console.error("Error sending message: ", error);
            toast.error("Failed to send message.");
        }
    };

    const sendAdminMessage = async (conversationId, text) => {
        if (!userData || !isAdmin) return;
    
        const conversationRef = doc(firestore, 'conversations', conversationId);
        const messagesRef = collection(conversationRef, 'messages');
    
        try {
            const messageData = {
                text,
                senderId: userData._id,
                senderName: userData.name || 'Admin',
                senderRole: 'admin',
                createdAt: serverTimestamp(),
            };
    
            await addDoc(messagesRef, messageData);
            
            await setDoc(conversationRef, {
                lastMessage: text,
                lastMessageAt: serverTimestamp(),
                userUnread: true,
                adminUnread: false, 
            }, { merge: true });
    
        } catch (error) {
            console.error("Error sending admin message: ", error);
            toast.error("Failed to send message.");
        }
    };

    const addProductReview = async (productId, rating, comment) => {
        if (!userData) {
            toast.error("Please log in to continue.", { id: 'login-toast' });
            setShowLogin(true);
            return;
        }

        const reviewRef = doc(collection(firestore, `products/${productId}/reviews`));
        const productRef = doc(firestore, 'products', productId);

        try {
            await runTransaction(firestore, async (transaction) => {
                const productDoc = await transaction.get(productRef);
                if (!productDoc.exists()) {
                    throw "Product not found!";
                }

                const productData = productDoc.data();
                const oldReviewCount = productData.reviewCount || 0;
                const oldAverageRating = productData.averageRating || 0;

                const newReviewCount = oldReviewCount + 1;
                const newAverageRating = ((oldAverageRating * oldReviewCount) + rating) / newReviewCount;

                transaction.set(reviewRef, {
                    userId: userData._id,
                    userName: userData.name,
                    userPhotoURL: userData.photoURL,
                    rating: rating,
                    comment: comment,
                    createdAt: serverTimestamp()
                });

                transaction.update(productRef, {
                    reviewCount: newReviewCount,
                    averageRating: newAverageRating
                });
            });
            toast.success("Review submitted successfully!");
        } catch (error) {
            console.error("Error submitting review: ", error);
            toast.error("Failed to submit review.");
        }
    };

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
            toast.error("Please log in to continue.", { id: 'login-toast' });
            if (!showLogin) setShowLogin(true);
            return;
        }
        const addressCollectionRef = collection(firestore, 'users', userData._id, 'addresses');
        await addDoc(addressCollectionRef, newAddress);
        toast.success("Address added successfully!");
        closeAddressModal(); 
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
            toast.error("Please log in to continue.", { id: 'login-toast' });
            if (!showLogin) setShowLogin(true);
            return;
        }
        if (!isSeller && !isAdmin) {
            toast.error("You must be a seller or admin to add a product.");
            return;
        }

        if (productData.flashSaleEndDate && (!productData.flashSalePrice || Number(productData.flashSalePrice) <= 0)) {
            toast.error("Please set a Flash Sale Price if you set a Flash Sale End Date.");
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
            toast.error("Please log in to continue.", { id: 'login-toast' });
            if (!showLogin) setShowLogin(true);
            return;
        }

        const canUpdate = isAdmin || (isSeller && updatedProduct.userId === userData._id);
        if (!canUpdate) {
            toast.error("You are not authorized to update this product.");
            return;
        }

        if (updatedProduct.flashSaleEndDate && (!updatedProduct.flashSalePrice || Number(updatedProduct.flashSalePrice) <= 0)) {
            toast.error("Please set a Flash Sale Price if you set a Flash Sale End Date.");
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
            toast.error("Please log in to continue.", { id: 'login-toast' });
            if (!showLogin) setShowLogin(true);
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
        try {
            const usersQuery = query(collection(firestore, 'users'), where('role', '==', 'admin'));
            const adminSnapshot = await getDocs(usersQuery);
            
            const sellerIds = [...new Set(order.items.map(item => item.sellerId))];
        
            const notifications = [];
        
            adminSnapshot.forEach(adminDoc => {
                notifications.push({
                    userId: adminDoc.id,
                    message: `New order #${orderId.slice(-6)} has been placed.`,
                    link: '/admin/orders',
                    read: false,
                    createdAt: serverTimestamp()
                });
            });
        
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
                if (notif.userId) {
                    const notifRef = doc(collection(firestore, `users/${notif.userId}/notifications`));
                    batch.set(notifRef, notif);
                }
            });
        
            if (notifications.length > 0) {
                await batch.commit();
            }
        } catch (error) {
            console.error("Error generating notifications:", error);
        }
    };
    
    const placeOrder = async (address, paymentResponse, totalAmount, itemsToOrder, allRawProducts) => {
        if (!userData) {
            toast.error("Please log in to continue.", { id: 'login-toast' });
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
            const updatedCartItems = { ...cartItems };
            const purchasedProductIds = [];

            for (const itemId in itemsToOrder) {
                const [productId, size] = itemId.split('_');
                const product = allRawProducts.find(p => p.id === productId);

                if (!product) throw new Error(`Product with ID ${productId} not found.`);
                
                const stock = size ? (product.sizes[size] || 0) : product.stock;

                if (stock < itemsToOrder[itemId]) throw new Error(`Not enough stock for ${product.name}${size ? ` (${size})` : ''}.`);
                
                orderItems.push({ 
                    ...product,
                    itemId: itemId, 
                    size: size || null,
                    quantity: itemsToOrder[itemId], 
                    status: 'Processing',
                    sellerId: product.userId
                });
                purchasedProductIds.push(productId);
                
                const productRef = doc(firestore, 'products', productId);
                if (size) {
                    batch.update(productRef, {
                        [`sizes.${size}`]: increment(-itemsToOrder[itemId]),
                        stock: increment(-itemsToOrder[itemId])
                    });
                } else {
                    batch.update(productRef, { stock: increment(-itemsToOrder[itemId]) });
                }
                
                delete updatedCartItems[itemId];
            }

            const newOrderRef = doc(collection(firestore, 'orders'));
            const newOrderData = {
                userId: userData._id,
                items: orderItems.map(({_id, name, offerPrice, image, quantity, sellerId, status, price, flashSalePrice, size}) => ({_id, name, offerPrice, image, quantity, sellerId, status, price, flashSalePrice, size})),
                amount: totalAmount,
                address: address,
                status: "Order Placed", // Overall order status
                date: serverTimestamp(),
                paymentMethod: 'flutterwave',
                paymentTransactionId: paymentResponse.transaction_id,
                payoutProcessed: false,
            };
            batch.set(newOrderRef, newOrderData);

            const userDocRef = doc(firestore, 'users', userData._id);
            batch.update(userDocRef, { 
                cartItems: updatedCartItems,
                purchasedProducts: arrayUnion(...purchasedProductIds)
             });

            await batch.commit();
            await generateNotifications(newOrderData, newOrderRef.id);
            toast.success("Order placed successfully!");
            return { success: true };
        } catch (error) {
            toast.error(error.message);
            return { success: false };
        }
    }
    
    const placeOrderWithWallet = async (address, totalAmount, itemsToOrder, allRawProducts) => {
        if (!userData) {
            toast.error("Please log in to continue.", { id: 'login-toast' });
            return { success: false };
        }
        if (walletBalance < totalAmount) {
            toast.error("Insufficient wallet balance.");
            return { success: false };
        }

        const batch = writeBatch(firestore);
        try {
            const orderItems = [];
            const updatedCartItems = { ...cartItems };
            const purchasedProductIds = [];

            for (const itemId in itemsToOrder) {
                const [productId, size] = itemId.split('_');
                const product = allRawProducts.find(p => p.id === productId);

                if (!product) throw new Error(`Product with ID ${productId} not found.`);

                const stock = size ? (product.sizes[size] || 0) : product.stock;

                if (stock < itemsToOrder[itemId]) throw new Error(`Not enough stock for ${product.name}${size ? ` (${size})` : ''}.`);
                
                orderItems.push({ 
                    ...product, 
                    itemId: itemId, 
                    size: size || null,
                    quantity: itemsToOrder[itemId],
                    status: 'Processing',
                    sellerId: product.userId
                });
                purchasedProductIds.push(productId);

                const productRef = doc(firestore, 'products', productId);
                if (size) {
                    batch.update(productRef, {
                        [`sizes.${size}`]: increment(-itemsToOrder[itemId]),
                        stock: increment(-itemsToOrder[itemId])
                    });
                } else {
                    batch.update(productRef, { stock: increment(-itemsToOrder[itemId]) });
                }
                
                delete updatedCartItems[itemId];
            }

            const newOrderRef = doc(collection(firestore, 'orders'));
            const newOrderData = {
                userId: userData._id,
                items: orderItems.map(({_id, name, offerPrice, image, quantity, sellerId, status, price, flashSalePrice, size}) => ({_id, name, offerPrice, image, quantity, sellerId, status, price, flashSalePrice, size})),
                amount: totalAmount,
                address: address,
                status: "Order Placed", // Overall order status
                date: serverTimestamp(),
                paymentMethod: 'wallet',
                payoutProcessed: false,
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
                walletTransactions: arrayUnion(newTransaction),
                purchasedProducts: arrayUnion(...purchasedProductIds)
            });
            await batch.commit();
            await generateNotifications(newOrderData, newOrderRef.id);
            toast.success("Order placed successfully!");
            return { success: true };
        } catch (error) {
            toast.error(error.message);
            return { success: false };
        }
    };


    const processSellerPayouts = async (order) => {
        if (!platformSettings || typeof platformSettings.commission === 'undefined') {
            toast.error("Platform commission rate is not set. Cannot process payouts.");
            return;
        }
    
        const commissionRate = platformSettings.commission / 100;
        const batch = writeBatch(firestore);
    
        const sellerPayouts = order.items.reduce((acc, item) => {
            if (item.sellerId) {
                if (!acc[item.sellerId]) {
                    acc[item.sellerId] = 0;
                }
                const salePrice = (item.flashSalePrice && item.flashSalePrice > 0) ? item.flashSalePrice : item.offerPrice;
                acc[item.sellerId] += salePrice * item.quantity;
            }
            return acc;
        }, {});
    
        for (const sellerId in sellerPayouts) {
            const sellerRef = doc(firestore, 'users', sellerId);
            const grossSale = sellerPayouts[sellerId];
            const commission = grossSale * commissionRate;
            const netEarnings = grossSale - commission;
    
            if (netEarnings > 0) {
                const newTransaction = {
                    id: `sale_${order._id}_${Date.now()}`,
                    type: 'Sale',
                    amount: netEarnings, 
                    grossSale,
                    commission,
                    netEarnings,
                    date: new Date().toISOString(),
                    orderId: order._id,
                };
    
                batch.update(sellerRef, {
                    'sellerWallet.balance': increment(netEarnings),
                    'sellerWallet.transactions': arrayUnion(newTransaction)
                });
            }
        }
        
        const orderRef = doc(firestore, 'orders', order._id);
        batch.update(orderRef, { payoutProcessed: true });

        await batch.commit();
        toast.success("Seller payouts processed successfully!");
    };
    
    const confirmOrderDelivery = async (orderId) => {
        const orderRef = doc(firestore, 'orders', orderId);
        const confirmationWindowHours = platformSettings?.confirmationWindowHours || 72;
        const autoCompletionDate = new Date();
        autoCompletionDate.setHours(autoCompletionDate.getHours() + confirmationWindowHours);

        await setDoc(orderRef, { status: 'Delivered', autoCompletionDate: autoCompletionDate.toISOString() }, { merge: true });
        toast.success("Delivery Confirmed! The seller will be paid shortly.");
    };
    
    const reportIssue = async (orderId, reason) => {
        const orderRef = doc(firestore, 'orders', orderId);
        try {
            await setDoc(orderRef, {
                status: 'Disputed',
                dispute: {
                    reason: reason,
                    date: new Date().toISOString()
                },
                autoCompletionDate: null 
            }, { merge: true });
            
            closeDisputeModal();
            toast.success("Your issue has been reported. Admin will review it shortly.");
        } catch (error) {
            console.error("Error reporting issue: ", error);
            toast.error("Failed to report issue.");
        }
    };

    const updateItemStatus = async (orderId, itemId, newStatus) => {
        const orderRef = doc(firestore, 'orders', orderId);
        try {
            await runTransaction(firestore, async (transaction) => {
                const orderDoc = await transaction.get(orderRef);
                if (!orderDoc.exists()) throw new Error("Order not found.");

                const orderData = orderDoc.data();
                const itemIndex = orderData.items.findIndex(item => item._id === itemId);
                if (itemIndex === -1) throw new Error("Item not found in order.");

                const updatedItems = [...orderData.items];
                updatedItems[itemIndex].status = newStatus;
                
                const allItemsShipped = updatedItems.every(item => item.status === 'Shipped');
                const anyItemShipped = updatedItems.some(item => item.status === 'Shipped');
                
                let newOverallStatus = orderData.status;
                if (allItemsShipped) {
                    newOverallStatus = 'Shipped';
                } else if (anyItemShipped) {
                    newOverallStatus = 'Partially Shipped';
                }
                
                transaction.update(orderRef, { items: updatedItems, status: newOverallStatus });
            });
            toast.success(`Item status updated to ${newStatus}`);
        } catch (error) {
            console.error("Error updating item status: ", error);
            toast.error(error.message || "Failed to update item status.");
        }
    }


    const updateOrderStatus = async (orderId, newStatus) => {
        if (!isAdmin) {
           toast.error("You are not authorized.");
           return false;
        }
        const orderDocRef = doc(firestore, 'orders', orderId);
        const orderSnap = await getDoc(orderDocRef);
    
        if (!orderSnap.exists()) {
            toast.error("Order not found.");
            return false;
        }
    
        const orderData = { ...orderSnap.data(), _id: orderSnap.id };
    
        if (newStatus === "Completed") {
            if (orderData.payoutProcessed) {
                toast.warn("Payout has already been processed for this order.");
                await setDoc(orderDocRef, { status: newStatus }, { merge: true });
                return false;
            }
            if (orderData.status === "Delivered" || orderData.status === "Shipped") {
                await processSellerPayouts(orderData);
                await setDoc(orderDocRef, { status: newStatus, payoutProcessed: true }, { merge: true });
                toast.success(`Order completed and payout processed!`);
            } else {
                toast.error(`Cannot complete order from '${orderData.status}' status.`);
                return false;
            }
        } 
        else if (newStatus === "Delivered") {
            const confirmationWindowHours = platformSettings?.confirmationWindowHours || 72;
            const autoCompletionDate = new Date();
            autoCompletionDate.setHours(autoCompletionDate.getHours() + confirmationWindowHours);
            await setDoc(orderDocRef, { status: newStatus, autoCompletionDate: autoCompletionDate.toISOString() }, { merge: true });
            toast.success(`Order marked as Delivered. Buyer confirmation window has started.`);
        }
        else {
            await setDoc(orderDocRef, { status: newStatus }, { merge: true });
            toast.success(`Order status updated to ${newStatus}`);
        }
       
        return true;
   }

    const reverseSellerPayouts = async (order) => {
        if (!isAdmin) {
            toast.error("You are not authorized to perform this action.");
            return;
        }
        if (order.status !== 'Completed') {
            toast.error("Cannot reverse payout for an order that is not marked as completed.");
            return;
        }
    
        const batch = writeBatch(firestore);
        const sellerIds = [...new Set(order.items.map(item => item.sellerId))];
    
        for (const sellerId of sellerIds) {
            if (!sellerId) continue;
            const sellerRef = doc(firestore, 'users', sellerId);
            const sellerSnap = await getDoc(sellerRef);
    
            if (sellerSnap.exists()) {
                const sellerData = sellerSnap.data();
                const originalTx = sellerData.sellerWallet.transactions.find(tx => tx.orderId === order._id && tx.type === 'Sale');
    
                if (originalTx) {
                    const reversalTx = {
                        id: `reversal_${order._id}_${Date.now()}`,
                        type: 'Reversal',
                        amount: -originalTx.netEarnings,
                        date: new Date().toISOString(),
                        orderId: order._id,
                    };
                    
                    batch.update(sellerRef, {
                        'sellerWallet.balance': increment(-originalTx.netEarnings),
                        'sellerWallet.transactions': arrayUnion(reversalTx)
                    });
                }
            }
        }
    
        const orderRef = doc(firestore, 'orders', order._id);
        batch.update(orderRef, { status: 'Shipped', payoutProcessed: false, autoCompletionDate: null });
    
        try {
            await batch.commit();
            toast.success("Seller payouts reversed and order status updated.");
        } catch (error) {
            console.error("Error reversing payout: ", error);
            toast.error("Failed to reverse payout.");
        }
    };
    
    const requestWithdrawal = async (amount, bankDetails) => {
        if (!userData || !isSeller) {
            toast.error("You are not authorized to perform this action.");
            return false;
        }

        try {
            const response = await fetch('/api/withdraw', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount,
                    bankDetails,
                    userId: userData._id
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                toast.success('Withdrawal successful! The funds are on their way.');
                return true;
            } else {
                toast.error(result.message || 'Withdrawal failed. Please try again.');
                return false;
            }
        } catch (error) {
            console.error("Withdrawal API call failed:", error);
            toast.error("Failed to connect to withdrawal service.");
            return false;
        }
    };

    const updateUserField = async (field, value) => {
        if (!userData) {
            if (!showLogin) {
                toast.error("Please log in to continue.", { id: 'login-toast' });
                setShowLogin(true);
            }
            return;
        }
        const userDocRef = doc(firestore, 'users', userData._id);
        try {
            await setDoc(userDocRef, { [field]: value }, { merge: true });
            setUserData(prev => ({...prev, [field]: value}));
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

    const addToCart = (itemId) => {
        if (!userData) {
            toast.error("Please log in to continue.", { id: 'login-toast' });
            if (!showLogin) setShowLogin(true);
            return Promise.reject(new Error("User not logged in"));
        }
    
        const userDocRef = doc(firestore, 'users', userData._id);
    
        return runTransaction(firestore, async (transaction) => {
            const userDoc = await transaction.get(userDocRef);
            if (!userDoc.exists()) {
                throw new Error("User document does not exist!");
            }

            const [productId, size] = itemId.split('_');
            const product = allRawProducts.find(p => p.id === productId);

            if (!product) {
                toast.error("Product not found.", { id: `not-found-${itemId}` });
                throw new Error("Product not found.");
            }

            const currentCart = userDoc.data().cartItems || {};
            const currentQuantityInCart = currentCart[itemId] || 0;
            
            const stockForSize = product.sizes && Object.keys(product.sizes).length > 0 ? product.sizes[size] : product.stock;

            if (currentQuantityInCart >= stockForSize) {
                toast.error(`No more stock available for ${product.name}${size ? ` (Size: ${size})` : ''}`, { id: `stock-toast-${itemId}` });
                throw new Error("Out of stock");
            }
    
            const newCart = { ...currentCart };
            newCart[itemId] = (newCart[itemId] || 0) + 1;
            transaction.update(userDocRef, { cartItems: newCart });
            toast.success("Product added to cart", { id: `add-toast-${itemId}` });
        }).catch(error => {
            if (error.message !== 'User not logged in' && error.message !== 'Product not found.' && error.message !== 'Out of stock' && error.message !== "User document does not exist!") {
                console.error("Add to cart transaction failed: ", error);
            }
            // rethrow so it can be caught by the caller if needed.
            throw error;
        });
    };
    
    const addMultipleToCart = async (items) => {
        if (!userData) {
            toast.error("Please log in to continue.", { id: 'login-toast' });
            if (!showLogin) setShowLogin(true);
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
                    const product = allRawProducts.find(p => p.id === productId);
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
            toast.error("Please log in to continue.", { id: 'login-toast' });
            if (!showLogin) setShowLogin(true);
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
                const product = allRawProducts.find(p => p.id === productId);
    
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
        if (!allRawProducts || !allRawProducts.length || !cartItems) return 0;
        
        for (const itemId in cartItems) {
            const [productId] = itemId.split('_');
            let itemInfo = allRawProducts.find((product) => product.id === productId);

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
            toast.error("Please log in to continue.", { id: 'login-toast' });
            if (!showLogin) setShowLogin(true);
            return;
        }
        const newWishlist = { ...wishlistItems };
        if (newWishlist[productId]) {
            delete newWishlist[productId];
        } else {
            newWishlist[productId] = true;
        }
        updateUserField('wishlistItems', newWishlist);
    };

    const getWishlistCount = () => {
        if (!wishlistItems) return 0;
        return Object.keys(wishlistItems).length;
    }

    const handleLogout = async () => {
        await signOut();
        toast.success("Logged out successfully");
        router.push('/');
    }

    const buyNow = async (product) => {
        if (!userData) {
            toast.error("Please log in to continue.", { id: 'login-toast' });
            if (!showLogin) setShowLogin(true);
            return;
        }
    
        const isOutOfStock = !product.stock || product.stock <= 0;
        if (isOutOfStock) return;
    
        const hasSizes = product.sizes && typeof product.sizes === 'object' && Object.keys(product.sizes).length > 0;
        if (hasSizes) {
            openSizeModal(product);
            return;
        }
    
        const itemId = product._id;
        const isInCart = cartItems[itemId] && cartItems[itemId] > 0;
    
        if (!isInCart) {
            try {
                await addToCart(itemId);
            } catch (e) {
                // Error is handled inside addToCart, just abort navigation.
                return;
            }
        }
    
        router.push('/cart');
    }

    const value = {
        currency, router,
        userData, setUserData, isSeller, isAdmin, authLoading,
        cartItems,
        addToCart, updateCartQuantity, addMultipleToCart, buyNow,
        getCartCount, getCartAmount,
        wishlistItems, toggleWishlist,
        getWishlistCount,
        handleLogout,
        showLogin, setShowLogin,
        userAddresses, addAddress,
        userOrders,
        placeOrder,
        walletBalance, walletTransactions,
        sellerWalletBalance, sellerWalletTransactions,
        updateOrderStatus,
        addProduct, updateProduct, deleteProduct, updateProductStatus,
        updateUserField, updateSellerBankDetails,
        platformSettings, updateSettings, settingsLoading,
        verifyFlutterwaveTransaction,
        placeOrderWithWallet,
        isSizeModalOpen, openSizeModal, closeSizeModal, productForSizeSelection,
        isAddressModalOpen, openAddressModal, closeAddressModal,
        reverseSellerPayouts,
        requestWithdrawal,
        addProductReview,
        confirmOrderDelivery, reportIssue, updateItemStatus,
        isDisputeModalOpen, openDisputeModal, closeDisputeModal, orderForDispute,
        allRawProducts, productsLoading,
        banners, bannersLoading,
        promotions, promotionsLoading,
        addBanner, deleteBanner, updateBanner, updateBannerStatus,
        addPromotion, deletePromotion, updatePromotionStatus,
        isChatModalOpen, openChatModal, closeChatModal,
        sendMessage, sendAdminMessage,
        hasUnreadMessages
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}
