'use client'
import { assets } from "@/assets/assets";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";

const LoginPage = () => {

    const { router } = useAppContext();
    const [isLogin, setIsLogin] = useState(true);

    return (
        <>
            <Navbar />
            <div className="flex justify-center items-center py-16 pt-28">
                <form className="w-full max-w-sm p-8 bg-white rounded-lg">
                    <p className="text-2xl md:text-3xl text-gray-500 text-center">
                        {isLogin ? 'Login' : 'Sign Up'}
                    </p>
                    <div className="space-y-4 mt-10">
                        {!isLogin && (
                            <input
                                className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                                type="text"
                                placeholder="Your Name"
                                required
                            />
                        )}
                        <input
                            className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                            type="email"
                            placeholder="Your Email"
                            required
                        />
                        <input
                            className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                            type="password"
                            placeholder="Password"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full mt-6 bg-orange-600 text-white py-3 hover:bg-orange-700 uppercase rounded">
                        {isLogin ? 'Login' : 'Create account'}
                    </button>
                    <div className="mt-6 text-center text-sm">
                        {isLogin ? (
                            <p className="text-gray-500">
                                Don't have an account? <span onClick={() => setIsLogin(false)} className="text-orange-600 cursor-pointer">Sign up here</span>
                            </p>
                        ) : (
                            <p className="text-gray-500">
                                Already have an account? <span onClick={() => setIsLogin(true)} className="text-orange-600 cursor-pointer">Login here</span>
                            </p>
                        )}

                    </div>
                </form>
            </div>
            <Footer />
        </>
    );
};

export default LoginPage;
