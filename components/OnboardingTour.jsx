'use client';
import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { X } from 'lucide-react';

const steps = [
    {
        title: "Welcome to QuickCart!",
        content: "We're glad to have you here. Let's take a quick tour of the app.",
        target: null
    },
    {
        title: "Access Your Profile",
        content: "Click on your avatar at any time to open your account menu.",
        target: "nav-account-button"
    },
    {
        title: "Shop for Products",
        content: "Click here to browse all available products in our store.",
        target: "nav-shop-link"
    },
    {
        title: "Save Your Favorites",
        content: "Add products to your wishlist to save them for later.",
        target: "nav-wishlist-link"
    },
    {
        title: "View Your Cart",
        content: "See the items you've added and proceed to checkout from here.",
        target: "nav-cart-link"
    },
    {
        title: "Manage Your Account",
        content: "Finally, let's go to your account page to set up your profile and addresses.",
        target: "nav-manage-account-link"
    }
];


const OnboardingTour = () => {
    const { userData, updateUserField } = useAppContext();
    const [step, setStep] = useState(0);
    const [isClient, setIsClient] = useState(false);
    const [style, setStyle] = useState({});
    const [highlightStyle, setHighlightStyle] = useState({});
    const tourRef = useRef(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const updateHighlightAndPopup = (targetId) => {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            const rect = targetElement.getBoundingClientRect();
            
            // For the popup position
            const tourPopupHeight = tourRef.current ? tourRef.current.offsetHeight : 200;
            const spaceBelow = window.innerHeight - rect.bottom;
            
            let topPosition = rect.bottom + 10;
            if (spaceBelow < tourPopupHeight && rect.top > tourPopupHeight) {
                topPosition = rect.top - tourPopupHeight - 10;
            }

            setStyle({
                position: 'absolute',
                top: `${topPosition}px`,
                left: `${rect.left + rect.width / 2}px`,
                transform: 'translateX(-50%)',
                width: '300px',
                zIndex: 1002
            });

            // For the spotlight effect
            const padding = 4;
            setHighlightStyle({
                top: rect.top - padding,
                left: rect.left - padding,
                width: rect.width + padding * 2,
                height: rect.height + padding * 2
            });

            return true;
        }
        return false;
    }

    useEffect(() => {
        if (!userData || !userData.isNewUser || !isClient || step === 0) {
            setStyle({});
            setHighlightStyle({});
            return;
        }

        const currentStep = steps[step];
        const targetId = currentStep.target;

        // Immediately try to find the element
        const found = updateHighlightAndPopup(targetId);

        if (!found && step === steps.length - 1) {
            // Special handling for the last step, which might be in a dropdown
            const accountButton = document.getElementById('nav-account-button');
            if(accountButton) {
                // If the target isn't visible, click the button to reveal it
                if (!document.getElementById(targetId)) {
                   accountButton.click(); 
                }
                
                // Retry after a short delay to allow for dropdown animation
                setTimeout(() => {
                    updateHighlightAndPopup(targetId);
                }, 300);
            }
        }
    }, [step, userData, isClient]);


    const finishTour = async () => {
        if (!userData) return;
        await updateUserField('isNewUser', false);
        setStep(0);
    };
    
    const handleNext = () => {
        if (step === steps.length - 1) {
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

    const overlayPanels = highlightStyle.width ? [
        { top: 0, left: 0, width: '100%', height: highlightStyle.top }, // Top
        { top: highlightStyle.top, left: 0, width: highlightStyle.left, height: highlightStyle.height }, // Left
        { top: highlightStyle.top, left: highlightStyle.left + highlightStyle.width, right: 0, height: highlightStyle.height }, // Right
        { top: highlightStyle.top + highlightStyle.height, left: 0, width: '100%', bottom: 0 } // Bottom
    ] : [{ top: 0, left: 0, width: '100%', height: '100%' }];

    return (
        <div className="fixed inset-0 z-[999]">
            {overlayPanels.map((style, i) => (
                <div key={i} className="absolute bg-black/50 backdrop-blur-sm" style={style} />
            ))}

            <div
                ref={tourRef}
                className={`bg-white rounded-lg shadow-2xl p-6 ${step === 0 ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md z-[1002]' : ''}`}
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
