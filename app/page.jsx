'use client'
import React from "react";
import HeaderSlider from "@/components/HeaderSlider";
import HomeProducts from "@/components/HomeProducts";
import Banner from "@/components/Banner";
import NewsLetter from "@/components/NewsLetter";
import FeaturedProduct from "@/components/FeaturedProduct";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FlashSales from "@/components/FlashSales";

const Home = () => {
  return (
    <main>
      <Navbar/>
      <div className="px-6 md:px-16 lg:px-32 pt-20">
        <HeaderSlider />
        <HomeProducts />
        <FlashSales />
        <FeaturedProduct />
        <Banner />
        {/* <NewsLetter /> */}
      </div>
      <Footer />
    </main>
  );
};

export default Home;
