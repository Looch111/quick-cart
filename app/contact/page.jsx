'use client';
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAppContext } from '@/context/AppContext';
import { Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

const ContactPage = () => {
    const { platformSettings } = useAppContext();

    const handleSubmit = (e) => {
        e.preventDefault();
        toast.success("Thank you for your message! We'll get back to you soon.");
        e.target.reset();
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen pt-28 pb-16 px-6 md:px-16 lg:px-32 bg-gray-50">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">Contact Us</h1>
                    <p className="text-gray-500 mb-10 text-center">We'd love to hear from you. Here's how you can reach us.</p>
                    
                    <div className="grid md:grid-cols-2 gap-10 bg-white p-8 rounded-lg shadow-md border">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Get in Touch</h2>
                            <p className="text-gray-600 mb-6">
                                Have questions about our products, an order, or our platform? Don't hesitate to reach out. Our team is ready to help you with anything you need.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-orange-600" />
                                    <span className="text-gray-700">{platformSettings?.contactPhone || "+1-234-567-890"}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-orange-600" />
                                    <span className="text-gray-700">{platformSettings?.contactEmail || "contact@euitapandshop.com"}</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input type="text" id="name" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input type="email" id="email" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                    <textarea id="message" rows="4" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"></textarea>
                                </div>
                                <button type="submit" className="w-full bg-orange-600 text-white py-2.5 rounded-md hover:bg-orange-700 transition font-semibold">
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ContactPage;
