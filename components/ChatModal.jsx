'use client';
import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useFirestore, useCollection } from '@/src/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { X, Send, User, Users } from 'lucide-react';
import Image from 'next/image';

const ChatModal = () => {
    const { isChatModalOpen, closeChatModal, userData, isAdmin, sendMessage, sendAdminMessage } = useAppContext();
    const firestore = useFirestore();

    // For Admins: List of all conversations
    const { data: conversations, loading: conversationsLoading } = useCollection(
        isAdmin ? 'conversations' : null,
        { orderBy: ['lastMessageAt', 'desc'] }
    );

    // For both Admins and Users: The currently active conversation
    const [activeConversationId, setActiveConversationId] = useState(null);
    const { data: messages, loading: messagesLoading } = useCollection(
        activeConversationId ? `conversations/${activeConversationId}/messages` : null,
        { orderBy: ['createdAt', 'asc'] }
    );

    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    // Effect for users to set their own conversation ID
    useEffect(() => {
        if (!isAdmin && userData) {
            setActiveConversationId(userData._id);
        }
    }, [isAdmin, userData]);

    // When an admin selects a conversation, mark it as read
    useEffect(() => {
        const markAsRead = async () => {
            if (isAdmin && activeConversationId) {
                const convRef = doc(firestore, 'conversations', activeConversationId);
                const convSnap = await getDoc(convRef);
                if (convSnap.exists() && convSnap.data().adminUnread) {
                    await setDoc(convRef, { adminUnread: false }, { merge: true });
                }
            }
        };
        markAsRead();
    }, [isAdmin, activeConversationId, firestore]);

    // Effect to scroll to the bottom of the chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (!isChatModalOpen) return null;

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        if (isAdmin) {
            if (activeConversationId) {
                sendAdminMessage(activeConversationId, newMessage);
            }
        } else {
            sendMessage(newMessage);
        }
        setNewMessage('');
    };

    const ChatWindow = () => (
        <div className="flex flex-col h-full">
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {messagesLoading && <p>Loading messages...</p>}
                {messages.map(msg => (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === userData?._id ? 'justify-end' : 'justify-start'}`}>
                        {msg.senderId !== userData?._id && (
                             <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                {msg.senderRole === 'admin' ? <User className="w-5 h-5 text-gray-500" /> : <User className="w-5 h-5 text-gray-500" />}
                            </div>
                        )}
                        <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.senderId === userData?._id ? 'bg-orange-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                            <p className="text-sm">{msg.text}</p>
                            <p className="text-xs opacity-70 mt-1 text-right">
                                {msg.createdAt ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t flex items-center gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button type="submit" className="p-3 bg-orange-600 text-white rounded-full hover:bg-orange-700">
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    );

    const AdminConversationList = () => (
        <div className="w-full md:w-1/3 border-r h-full overflow-y-auto">
            <div className="p-4 border-b">
                <h2 className="font-semibold text-lg">Conversations</h2>
            </div>
            {conversationsLoading ? <p className="p-4">Loading...</p> : (
                <ul>
                    {conversations.map(conv => (
                        <li key={conv.id} onClick={() => setActiveConversationId(conv.id)}
                            className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${activeConversationId === conv.id ? 'bg-orange-50' : ''} ${conv.adminUnread ? 'font-bold' : ''}`}>
                            <div className="flex justify-between">
                                <p className="text-sm truncate">{conv.userName || 'User'}</p>
                                {conv.adminUnread && <span className="w-2.5 h-2.5 bg-orange-500 rounded-full flex-shrink-0 mt-1.5"></span>}
                            </div>
                            <p className="text-xs text-gray-500 truncate mt-1">{conv.lastMessage}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const showConversations = isAdmin && (!isMobile || (isMobile && !activeConversationId));
    const showChatWindow = !isMobile || (isMobile && activeConversationId);


    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 p-4 md:p-0">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[85vh] md:h-[70vh] flex flex-col relative">
                <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                     <div className="flex items-center gap-3">
                        {isAdmin && activeConversationId && <Users className="w-6 h-6 text-orange-600" />}
                        {!isAdmin && <User className="w-6 h-6 text-orange-600" />}
                        <h1 className="text-xl font-bold text-gray-800">
                            {isAdmin ? (activeConversationId ? conversations.find(c=>c.id === activeConversationId)?.userName : 'Select a Chat') : 'Customer Support'}
                        </h1>
                    </div>
                    <button onClick={closeChatModal} className="text-gray-400 hover:text-gray-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {showConversations && <AdminConversationList />}
                    {showChatWindow && (
                        <div className={isAdmin ? "w-full md:w-2/3" : "w-full"}>
                            {activeConversationId ? <ChatWindow /> : (
                                <div className="hidden md:flex items-center justify-center h-full text-gray-500">
                                    {isAdmin ? 'Select a conversation to start chatting.' : 'Type a message to start a conversation.'}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatModal;
