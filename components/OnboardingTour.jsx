'use client';
import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { X, User, Settings } from 'lucide-react';

const OnboardingTour = () => {
    const { userData, updateUserField } = useAppContext();
    const [step, setStep] = useState(0);
    const [isClient, setIsClient] = useState(false);
    const [style, setStyle] = useState({});
    const tourRef = useRef(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const steps = [
        {
            title: "Welcome to QuickCart!",
            content: "We're glad to have you here. Let's take a quick moment to get your account set up.",
            target: null
        },
        {
            title: "Access Your Profile",
            content: "Click on your avatar at any time to open your account menu.",
            target: "nav-account-button"
        },
        {
            title: "Manage Your Account",
            content: "From here, you can manage your profile details, wallet, and orders. Let's go there now!",
            target: "nav-manage-account-link"
        }
    ];

    useEffect(() => {
        if (!userData || !userData.isNewUser || !isClient || step === 0) {
            setStyle({});
            return;
        }

        const currentStep = steps[step];
        const targetElement = document.getElementById(currentStep.target);

        if (targetElement) {
            const rect = targetElement.getBoundingClientRect();
            const tourPopupHeight = tourRef.current ? tourRef.current.offsetHeight : 200;
            const spaceBelow = window.innerHeight - rect.bottom;
            
            let topPosition = rect.bottom + 10;
            if (spaceBelow < tourPopupHeight && rect.top > tourPopupHeight) {
                topPosition = rect.top - tourPopupHeight - 10;
            }

            setStyle({
                position: 'absolute',
                top: `${topPosition}px`,
                left: `${rect.left}px`,
                transform: 'translateX(-50%)',
                width: '300px',
                zIndex: 1000
            });

            // If we are on step 2, we need to artificially open the dropdown
            if (step === 2) {
                const accountButton = document.getElementById('nav-account-button');
                if(accountButton && !document.getElementById('nav-manage-account-link')) {
                   accountButton.click(); // Open dropdown if it's not already open
                }
            }

        } else if (step === 2) {
            // Retry finding the element if it's not immediately available (e.g., due to dropdown animation)
            const accountButton = document.getElementById('nav-account-button');
            if(accountButton) accountButton.click();
            setTimeout(() => {
                 const target = document.getElementById(currentStep.target);
                 if (target) {
                    const rect = target.getBoundingClientRect();
                     setStyle({
                        position: 'absolute',
                        top: `${rect.bottom + 10}px`,
                        left: `${rect.left + rect.width / 2}px`,
                        transform: 'translateX(-50%)',
                        width: '300px',
                        zIndex: 1000
                    });
                 }
            }, 300);
        }

    }, [step, userData, isClient, steps]);


    const finishTour = async () => {
        if (!userData) return;
        await updateUserField('isNewUser', false);
        setStep(0); // Reset for next time (though it won't show)
    };
    
    const handleNext = () => {
        if (step === steps.length - 1) {
            // Last step, finish tour and redirect
            finishTour();
            const manageAccountLink = document.getElementById('nav-manage-account-link');
            if (manageAccountLink) {
                manageAccountLink.click();
            }
        } else {
            setStep(s => s + 1);
        }
    };

    if (!isClient || !userData || !userData.isNewUser) {
        return null;
    }
    
    const currentStep = steps[step];

    return (
        <div className="fixed inset-0 bg-black/50 z-[999] backdrop-blur-sm">
             {currentStep.target && <div 
                className="absolute bg-white rounded-lg animate-pulse" 
                style={{ 
                    top: style.top ? `${parseInt(style.top) - 10 - style.height}px` : `${document.getElementById(currentStep.target)?.getBoundingClientRect().top - 4}px`, 
                    left: `${document.getElementById(currentStep.target)?.getBoundingClientRect().left - 4}px`,
                    width: `${document.getElementById(currentStep.target)?.getBoundingClientRect().width + 8}px`,
                    height: `${document.getElementById(currentStep.target)?.getBoundingClientRect().height + 8}px`,
                    zIndex: 999
                }}
            />}
            <div
                ref={tourRef}
                className={`bg-white rounded-lg shadow-2xl p-6 ${step === 0 ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md' : ''}`}
                style={step > 0 ? style : {}}
            >
                <button onClick={finishTour} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                </button>
                
                <h3 className="text-xl font-bold text-gray-800 mb-2">{currentStep.title}</h3>
                <p className="text-sm text-gray-600 mb-6">{currentStep.content}</p>

                <div className="flex justify-between items-center">
                    <div className="flex gap-1.5">
                        {steps.map((_, i) => (
                            <div key={i} className={`h-1.5 rounded-full ${i === step ? 'bg-orange-500 w-4' : 'bg-gray-200 w-1.5'}`}></div>
                        ))}
                    </div>
                    <button
                        onClick={handleNext}
                        className="px-5 py-2 text-sm font-semibold text-white bg-orange-600 rounded-md hover:bg-orange-700"
                    >
                        {step === steps.length - 1 ? "Let's Go!" : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingTour;
