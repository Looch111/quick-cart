import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";

const Footer = () => {
  const { platformSettings } = useAppContext();
  return (
    <footer>
      <div className="flex flex-col md:flex-row items-start justify-center px-6 md:px-16 lg:px-32 gap-10 py-14 border-b border-gray-500/30 text-gray-500">
        <div className="w-4/5">
          <Image src={assets.logo} alt="logo" width={170} height={45} className="w-32 md:w-[170px]" />
          <p className="mt-6 text-sm">
            EUI Tap&Shop is your one-stop shop for the latest and greatest in electronics, gadgets, and accessories. We are dedicated to providing you with a seamless shopping experience, from browsing to delivery.
          </p>
        </div>

        <div className="w-1/2 flex items-center justify-start md:justify-center">
          <div>
            <h2 className="font-medium text-gray-900 mb-5">Company</h2>
            <ul className="text-sm space-y-2">
              <li>
                <a className="hover:underline transition" href="#">Home</a>
              </li>
              <li>
                <a className="hover:underline transition" href="#">About us</a>
              </li>
              <li>
                <a className="hover:underline transition" href="#">Contact us</a>
              </li>
              <li>
                <a className="hover:underline transition" href="#">Privacy policy</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="w-1/2 flex items-start justify-start md:justify-center">
          <div>
            <h2 className="font-medium text-gray-900 mb-5">Get in touch</h2>
            <div className="text-sm space-y-2">
              <p>{platformSettings?.contactPhone || "+1-234-567-890"}</p>
              <p>{platformSettings?.contactEmail || "contact@euitapandshop.com"}</p>
            </div>
          </div>
        </div>
      </div>
      <p className="py-4 text-center text-xs md:text-sm">
        Copyright © 2024 EUI Tap&Shop. All Rights Reserved.
      </p>
    </footer>
  );
};

export default Footer;
