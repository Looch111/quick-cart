'use client';
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const AboutPage = () => {
    return (
        <>
            <Navbar />
            <div className="min-h-screen pt-28 pb-16 px-6 md:px-16 lg:px-32">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-800 mb-6">About EUI Tap&Shop</h1>
                    <div className="prose prose-lg text-gray-600">
                        <p>
                            Welcome to EUI Tap&Shop, your premier destination for the latest and greatest in electronics, gadgets, and accessories. Our mission is to provide a seamless and enjoyable shopping experience, offering a curated selection of high-quality products from trusted brands.
                        </p>
                        <p>
                            Founded in 2024, EUI Tap&Shop was born out of a passion for technology and a desire to create a campus-focused marketplace that connects sellers with buyers in a trusted environment. We believe that everyone deserves access to the best tech, and our platform is designed to make that happen.
                        </p>
                        <h2 className="text-2xl font-bold text-gray-700 mt-8 mb-4">Our Values</h2>
                        <ul>
                            <li><strong>Customer First:</strong> Your satisfaction is our top priority. We are committed to providing excellent customer service and support.</li>
                            <li><strong>Quality & Trust:</strong> We carefully vet our sellers and products to ensure you receive only authentic, high-quality items.</li>
                            <li><strong>Community:</strong> We are more than just a marketplace; we are a community of tech enthusiasts, students, and entrepreneurs.</li>
                            <li><strong>Innovation:</strong> We are constantly looking for new ways to improve our platform and provide you with the best possible shopping experience.</li>
                        </ul>
                        <p>
                            Whether you're a student looking for the latest gear, a seller wanting to reach a wider audience, or just a tech lover, EUI Tap&Shop is here for you. Thank you for being a part of our journey.
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default AboutPage;
