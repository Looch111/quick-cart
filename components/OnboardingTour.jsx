'use client';
import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { X } from 'lucide-react';

const desktopSteps = [
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

const mobileSteps = [
    {
        title: "Welcome to QuickCart!",
        content: "We're glad to have you here. Let's take a quick tour of the app.",
        target: null
    },
    {
        title: "Access Your Profile",
        content: "Tap on your avatar at any time to open your account menu.",
        target: "nav-account-button"
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
    const [steps, setSteps] = useState(desktopSteps);

    useEffect(() => {
        setIsClient(true);
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        const handleResize = () => {
            setSteps(mediaQuery.matches ? mobileSteps : desktopSteps);
        };
        handleResize(); // Set initial steps
        mediaQuery.addEventListener('change', handleResize);
        return () => mediaQuery.removeEventListener('change', handleResize);
    }, []);

    const updateHighlightAndPopup = (targetId) => {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            const rect = targetElement.getBoundingClientRect();
            const tourPopup = tourRef.current;
            if (!tourPopup) return;
            
            const tourPopupHeight = tourPopup.offsetHeight;
            const tourPopupWidth = tourPopup.offsetWidth;
            const spaceBelow = window.innerHeight - rect.bottom;
            const margin = 10;
    
            // Determine vertical position
            let topPosition = rect.bottom + margin;
            if (spaceBelow < tourPopupHeight && rect.top > tourPopupHeight + margin) {
                topPosition = rect.top - tourPopupHeight - margin;
            }
    
            // Determine horizontal position
            let leftPosition = rect.left + rect.width / 2 - tourPopupWidth / 2;
    
            // Adjust if it overflows the screen
            if (leftPosition < margin) {
                leftPosition = margin;
            } else if (leftPosition + tourPopupWidth > window.innerWidth - margin) {
                leftPosition = window.innerWidth - tourPopupWidth - margin;
            }
    
            setStyle({
                position: 'absolute',
                top: `${topPosition}px`,
                left: `${leftPosition}px`,
                transform: 'none',
                zIndex: 1002
            });
    
            // For the spotlight effect
            const padding = 4;
            setHighlightStyle({
                top: rect.top - padding,
                left: rect.left - padding,
                width: rect.width + padding * 2,
                height: rect.height + padding * 2,
            });
    
            return true;
        }
        return false;
    }

    useEffect(() => {
        if (!userData || !userData.isNewUser || !isClient) {
            setHighlightStyle({});
            return;
        }

        const currentStep = steps[step];

        if(step === 0) {
            setHighlightStyle({});
            setStyle({});
            return;
        }

        const targetId = currentStep.target;

        const updatePositions = () => {
            const found = updateHighlightAndPopup(targetId);
            if (!found && step === steps.length - 1) {
                const accountButton = document.getElementById('nav-account-button');
                if (accountButton && !document.getElementById(targetId)) {
                   accountButton.click(); 
                }
                setTimeout(() => updateHighlightAndPopup(targetId), 300);
            }
        };
        
        updatePositions();

        window.addEventListener('resize', updatePositions);
        return () => window.removeEventListener('resize', updatePositions);

    }, [step, userData, isClient, steps]);


    const finishTour = async () => {
        if (!userData) return;
        setHighlightStyle({});
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
        { top: 0, left: 0, width: '100%', height: highlightStyle.top, zIndex: 1000 },
        { top: highlightStyle.top, left: 0, width: highlightStyle.left, height: highlightStyle.height, zIndex: 1000 },
        { top: highlightStyle.top, left: highlightStyle.left + highlightStyle.width, right: 0, height: highlightStyle.height, zIndex: 1000 },
        { top: highlightStyle.top + highlightStyle.height, left: 0, width: '100%', bottom: 0, zIndex: 1000 }
    ] : [{ top: 0, left: 0, width: '100%', height: '100%', zIndex: 1000 }];

    return (
        <div className="fixed inset-0 z-[999]">
            {overlayPanels.map((style, i) => (
                <div key={i} className="absolute bg-black/50 backdrop-blur-sm" style={style} />
            ))}
             <div
                style={{
                    position: 'absolute',
                    ...highlightStyle,
                    border: '2px solid white',
                    borderRadius: '6px',
                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
                    zIndex: 1001,
                    pointerEvents: 'none',
                    display: highlightStyle.width ? 'block' : 'none',
                }}
            />

            <div
                ref={tourRef}
                className={`bg-white rounded-lg shadow-2xl p-6 w-[90%] max-w-sm ${step === 0 ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1002]' : ''}`}
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
