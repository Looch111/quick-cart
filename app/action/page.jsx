'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useAuth as useFirebaseAuth } from '@/src/firebase';
import { applyActionCode, verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image';
import { assets } from '@/assets/assets';
import Link from 'next/link';

function ActionHandler() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { setShowLogin } = useAppContext();
    const auth = useFirebaseAuth();

    const [mode, setMode] = useState(null);
    const [actionCode, setActionCode] = useState(null);
    const [status, setStatus] = useState('loading'); // loading, verifyEmailSuccess, resetPassword, invalid
    const [newPassword, setNewPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const modeParam = searchParams.get('mode');
        const codeParam = searchParams.get('oobCode');

        setMode(modeParam);
        setActionCode(codeParam);

        if (!modeParam || !codeParam) {
            setStatus('invalid');
            return;
        }

        switch (modeParam) {
            case 'verifyEmail':
                applyActionCode(auth, codeParam)
                    .then(() => {
                        setStatus('verifyEmailSuccess');
                    })
                    .catch((error) => {
                        console.error(error);
                        setStatus('invalid');
                        toast.error('Invalid or expired verification link.');
                    });
                break;

            case 'resetPassword':
                verifyPasswordResetCode(auth, codeParam)
                    .then((email) => {
                        setStatus('resetPassword');
                    })
                    .catch((error) => {
                        console.error(error);
                        setStatus('invalid');
                        toast.error('Invalid or expired password reset link.');
                    });
                break;

            default:
                setStatus('invalid');
                break;
        }
    }, [searchParams, auth]);

    const handleResetPassword = (e) => {
        e.preventDefault();
        setError('');
        if (!newPassword) {
            setError('Please enter a new password.');
            return;
        }
        confirmPasswordReset(auth, actionCode, newPassword)
            .then(() => {
                toast.success('Your password has been reset successfully!');
                setShowLogin(true);
                router.push('/');
            })
            .catch((error) => {
                console.error(error);
                setError('Failed to reset password. The link may have expired.');
            });
    };

    if (status === 'loading') {
        return (
             <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-t-orange-300 border-gray-200"></div>
            </div>
        );
    }
    
    const ActionCard = ({ children, title }) => (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
             <Link href="/" className='mb-8'>
                <Image
                className="cursor-pointer w-48"
                src={assets.logo}
                alt="logo"
                width={170}
                height={45}
                />
            </Link>
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md border">
                 <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">{title}</h1>
                {children}
            </div>
        </div>
    );


    switch (status) {
        case 'verifyEmailSuccess':
            return (
                <ActionCard title="Email Verified!">
                    <p className="text-center text-gray-600">Your email has been successfully verified.</p>
                    <button
                        onClick={() => {
                            setShowLogin(true);
                            router.push('/');
                        }}
                        className="mt-6 w-full bg-orange-600 text-white py-2.5 rounded-md hover:bg-orange-700 transition font-semibold"
                    >
                        Click here to Login
                    </button>
                </ActionCard>
            );

        case 'resetPassword':
            return (
                <ActionCard title="Reset Your Password">
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                             <label className="block text-sm font-medium text-gray-700">New Password</label>
                            <div className="relative mt-1">
                                <input
                                    type={passwordVisible ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="Enter your new password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setPasswordVisible(!passwordVisible)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                                >
                                    {passwordVisible ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                                </button>
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <button type="submit" className="w-full bg-orange-600 text-white py-2.5 rounded-md hover:bg-orange-700 transition font-semibold">
                            Reset Password
                        </button>
                    </form>
                </ActionCard>
            );
        
        case 'invalid':
        default:
             return (
                 <ActionCard title="Invalid Link">
                    <p className="text-center text-gray-600">This link is invalid or has expired. Please try again.</p>
                    <button
                        onClick={() => router.push('/')}
                        className="mt-6 w-full bg-gray-600 text-white py-2.5 rounded-md hover:bg-gray-700 transition font-semibold"
                    >
                        Back to Home
                    </button>
                </ActionCard>
             );
    }
}


export default function ActionPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-20 w-20 border-4 border-t-orange-300 border-gray-200"></div></div>}>
            <ActionHandler />
        </Suspense>
    )
};
