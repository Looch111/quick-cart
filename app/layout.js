
import { Outfit } from "next/font/google";
import "./globals.css";
import { AppContextProvider } from "@/context/AppContext";
import { Toaster } from "react-hot-toast";
import LoginPopup from "@/components/LoginPopup";
import { FirebaseClientProvider } from "@/src/firebase/client-provider";
import FirebaseErrorListener from "@/src/components/FirebaseErrorListener";
import OnboardingTour from "@/components/OnboardingTour";
import SizeSelectionModal from "@/components/SizeSelectionModal";
import AddAddressModal from "@/components/AddAddressModal";
import DisputeModal from "@/components/DisputeModal";
import NotificationSetup from "@/src/components/NotificationSetup";
import FloatingSupportButton from "@/components/FloatingSupportButton";
import ChatModal from "@/components/ChatModal";

const outfit = Outfit({ subsets: ['latin'], weight: ["300", "400", "500"] })

export const metadata = {
  title: "QuickCart - GreatStack",
  description: "E-Commerce with Next.js ",
};

export default function RootLayout({ children }) {
  return (
      <html lang="en">
        <body className={`${outfit.className} antialiased text-gray-700`} >
          <FirebaseClientProvider>
            <AppContextProvider>
              <Toaster position="top-center" reverseOrder={false} />
              <LoginPopup />
              <SizeSelectionModal />
              <AddAddressModal />
              <DisputeModal />
              <ChatModal />
              <OnboardingTour />
              <NotificationSetup />
              {children}
              <FloatingSupportButton />
              <FirebaseErrorListener />
            </AppContextProvider>
          </FirebaseClientProvider>
        </body>
      </html>
  );
}
