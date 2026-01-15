'use client';
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAppContext } from '@/context/AppContext';

const PrivacyPolicyPage = () => {
    const { platformSettings } = useAppContext();
    return (
        <>
            <Navbar />
            <div className="min-h-screen pt-28 pb-16 px-6 md:px-16 lg:px-32">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-800 mb-6">Privacy Policy</h1>
                    <div className="prose prose-lg text-gray-600">
                        <p className="text-sm text-gray-500">Last updated: July 26, 2024</p>
                        
                        <p>
                            This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You. We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-700 mt-8 mb-4">Interpretation and Definitions</h2>
                        <p>The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>

                        <h2 className="text-2xl font-bold text-gray-700 mt-8 mb-4">Collecting and Using Your Personal Data</h2>
                        <h3>Types of Data Collected</h3>
                        <p><strong>Personal Data:</strong> While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to: Email address, First name and last name, Phone number, Address, Usage Data.</p>
                        <p><strong>Usage Data:</strong> Usage Data is collected automatically when using the Service. Usage Data may include information such as Your Device's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</p>
                        
                        <h2 className="text-2xl font-bold text-gray-700 mt-8 mb-4">Use of Your Personal Data</h2>
                        <p>The Company may use Personal Data for the following purposes:</p>
                        <ul>
                            <li>To provide and maintain our Service, including to monitor the usage of our Service.</li>
                            <li>To manage Your Account: to manage Your registration as a user of the Service.</li>
                            <li>For the performance of a contract: the development, compliance and undertaking of the purchase contract for the products, items or services You have purchased.</li>
                            <li>To contact You: To contact You by email, telephone calls, SMS, or other equivalent forms of electronic communication.</li>
                            <li>To provide You with news, special offers and general information about other goods, services and events which we offer.</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-700 mt-8 mb-4">Retention of Your Personal Data</h2>
                        <p>The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use Your Personal Data to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our legal agreements and policies.</p>

                        <h2 className="text-2xl font-bold text-gray-700 mt-8 mb-4">Security of Your Personal Data</h2>
                        <p>The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While We strive to use commercially acceptable means to protect Your Personal Data, We cannot guarantee its absolute security.</p>
                        
                        <h2 className="text-2xl font-bold text-gray-700 mt-8 mb-4">Changes to this Privacy Policy</h2>
                        <p>We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>

                        <h2 className="text-2xl font-bold text-gray-700 mt-8 mb-4">Contact Us</h2>
                        <p>If you have any questions about this Privacy Policy, You can contact us: by email at {platformSettings?.contactEmail || "contact@euitapandshop.com"}</p>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default PrivacyPolicyPage;
