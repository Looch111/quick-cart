'use client'
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";

const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
        <path fill="#FF3D00" d="M6.306 14.691c-1.645 3.119-2.656 6.756-2.656 10.618C3.65 29.534 5.854 33.729 9.17 36.635l5.657-5.657C13.257 29.324 12 26.852 12 24c0-1.852.548-3.567 1.455-5.021l-7.149-7.288z"></path>
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.043 36.372 44 31.257 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
    </svg>
);

const LoginPopup = () => {
    const { showLogin, setShowLogin, handleLogin } = useAppContext();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');

    if (!showLogin) {
        return null;
    }

    const handleContinue = (e) => {
        e.preventDefault();
        if (isLogin) {
            handleLogin(); // Mock login
        } else {
            // Handle signup logic
            handleLogin(); // Mock signup/login
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 px-4">
            <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-lg relative">
                <button onClick={() => {setShowLogin(false); setShowPassword(false);}} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800">{isLogin ? "Sign in to QuickCart" : "Create an account"}</h1>
                    <p className="text-gray-500 mt-2 text-sm">{isLogin ? "Welcome back! Please sign in to continue" : "Get started with QuickCart"}</p>
                </div>
                <div className="mt-6">
                    <button className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-full hover:bg-gray-50">
                        <GoogleIcon />
                        <span className="text-gray-700 font-medium text-sm">Continue with Google</span>
                    </button>
                </div>
                <div className="flex items-center my-4">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-400 text-xs">or</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>
                <form className="space-y-4" onSubmit={handleContinue}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                        <input
                            id="email"
                            className="mt-1 px-3 py-2 focus:border-gray-500 transition border border-gray-300 rounded-md outline-none w-full text-gray-700 text-sm"
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    {(!isLogin || showPassword) && (
                         <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                id="password"
                                className="mt-1 px-3 py-2 focus:border-gray-500 transition border border-gray-300 rounded-md outline-none w-full text-gray-700 text-sm"
                                type="password"
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                    )}
                    <button type="submit" className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-800 text-white hover:bg-gray-900 rounded-full font-semibold text-sm">
                        Continue
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                    </button>
                </form>
                <div className="mt-4 text-center text-xs">
                    {isLogin ? (
                        <p className="text-gray-500">
                            Don't have an account? <span onClick={() => {setIsLogin(false); setShowPassword(false);}} className="text-orange-600 font-semibold cursor-pointer hover:underline">Sign up</span>
                        </p>
                    ) : (
                        <p className="text-gray-500">
                            Already have an account? <span onClick={() => {setIsLogin(true); setShowPassword(false);}} className="text-orange-600 font-semibold cursor-pointer hover:underline">Sign in</span>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginPopup;
