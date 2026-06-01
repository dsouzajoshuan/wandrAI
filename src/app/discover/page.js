"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

const SIGHTS_DATA = {
  all: [
    { title: "Dudhsagar Viewpoint, Goa", tag: "Hidden Gem", rating: "4.8", reviews: "2.4k", desc: "A breathtaking panoramic spot overlooking the 'Sea of Milk' waterfall, accessible only by a specialized AI-routed trail.", img: "https://images.unsplash.com/photo-1540553016722-983e48a2cd10?q=80&w=600&auto=format&fit=crop", key: "goa" },
    { title: "Ziro Valley Pine Groves, Arunachal", tag: "Adventure", rating: "4.9", reviews: "1.2k", desc: "Misty pine-covered slopes and rustic local homestays in a secluded Himalayan valley.", img: "/images/download.jpg", key: "ziro" },
    { title: "Key Monastery Climbs, Spiti", tag: "Cultural", rating: "4.9", reviews: "3.1k", desc: "Perched at 13,668 feet, this historic fortress monastery offers panoramic snowy ridge views.", img: "/images/download (1).jpg", key: "spiti" },
    { title: "Cherrapunji Root Bridges, Meghalaya", tag: "Hidden Gem", rating: "4.7", reviews: "1.8k", desc: "Navigate the active 200-year-old bio-engineered double-decker living root bridges.", img: "/images/download (2).jpg", key: "meghalaya" }
  ],
  hidden: [
    { title: "Dudhsagar Viewpoint, Goa", tag: "Hidden Gem", rating: "4.8", reviews: "2.4k", desc: "A breathtaking panoramic spot overlooking the 'Sea of Milk' waterfall, accessible only by a specialized AI-routed trail.", img: "https://images.unsplash.com/photo-1540553016722-983e48a2cd10?q=80&w=600&auto=format&fit=crop", key: "goa" },
    { title: "Cherrapunji Root Bridges, Meghalaya", tag: "Hidden Gem", rating: "4.7", reviews: "1.8k", desc: "Navigate the active 200-year-old bio-engineered double-decker living root bridges.", img: "/images/download (2).jpg", key: "meghalaya" },
    { title: "Dhanushkodi Ghost Town, Tamil Nadu", tag: "Hidden Gem", rating: "4.6", reviews: "920", desc: "A ruined seaside town on a narrow spit of sand at the southern edge of India.", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop", key: "dhanushkodi" }
  ],
  food: [
    { title: "Mawphlang Local Kitchens, Meghalaya", tag: "Food", rating: "4.7", reviews: "650", desc: "Savor smoked pork, red rice beer, and seasonal bamboo shoot delicacies in tribal hubs.", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop", key: "meghalaya" },
    { title: "Mapusa Local Spice Stalls, Goa", tag: "Food", rating: "4.5", reviews: "1.4k", desc: "Sip spiced cashew feni and sample authentic goan fish curry right at the active local bazaars.", img: "https://images.unsplash.com/photo-1540553016722-983e48a2cd10?q=80&w=600&auto=format&fit=crop", key: "goa" }
  ],
  adventure: [
    { title: "Ziro Valley Pine Groves, Arunachal", tag: "Adventure", rating: "4.9", reviews: "1.2k", desc: "Misty pine-covered slopes and rustic local homestays in a secluded Himalayan valley.", img: "/images/download.jpg", key: "ziro" },
    { title: "Leh Wilderness Passes, Ladakh", tag: "Adventure", rating: "4.8", reviews: "2.1k", desc: "Motorable high-altitude passes bordered by glaciated ridges and turquoise alpine lakes.", img: "/images/images (1).jpg", key: "ladakh" }
  ],
  cultural: [
    { title: "Key Monastery Climbs, Spiti", tag: "Cultural", rating: "4.9", reviews: "3.1k", desc: "Perched at 13,668 feet, this historic fortress monastery offers panoramic snowy ridge views.", img: "/images/download (1).jpg", key: "spiti" },
    { title: "Hampi Stone Chariot Heritage, Karnataka", tag: "Cultural", rating: "4.9", reviews: "4.5k", desc: "Explore musical temple pillars and monoliths dotting a unique boulder-strewn landscape.", img: "/images/images.jpg", key: "hampi" }
  ],
  leisure: [
    { title: "Kolukkumalai Estate, Munnar", tag: "Leisure", rating: "4.8", reviews: "1.9k", desc: "Experience the highest organic tea gardens on Earth under rolling morning clouds.", img: "/images/images (2).jpg", key: "munnar" }
  ]
};

export default function Discover() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const orbsRef = useRef([]);

  const currentSights = SIGHTS_DATA[activeCategory] || SIGHTS_DATA.all;
  const currentItem = currentSights[currentIndex] || currentSights[0];

  useEffect(() => {
    // Mouse tracking for glowing orbs
    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      orbsRef.current.forEach((orb, index) => {
        if (!orb) return;
        const speed = (index + 1) * 20;
        orb.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleCardClick = (e) => {
    // Prevent quick plan navigation from trigger cycling
    if (e.target.closest("button")) return;
    setCurrentIndex((prev) => (prev + 1) % currentSights.length);
  };

  const handleQuickPlan = () => {
    if (currentItem) {
      localStorage.setItem("wandr_auto_load_dest", currentItem.key);
      router.push("/planner");
    }
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setCurrentIndex(0);
  };

  return (
    <>
      <Navbar />

      {/* Atmospheric Background Layer */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="mosaic-bg w-full h-full">
          <div className="mosaic-item bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop')" }}></div>
          <div className="mosaic-item bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=600&auto=format&fit=crop')" }}></div>
          <div className="mosaic-item bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop')" }}></div>
          <div className="mosaic-item bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop')" }}></div>
          <div className="mosaic-item bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1540553016722-983e48a2cd10?q=80&w=600&auto=format&fit=crop')" }}></div>
          <div className="mosaic-item bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=600&auto=format&fit=crop')" }}></div>
        </div>
        <div className="absolute inset-0 cinematic-gradient"></div>
        <div ref={(el) => (orbsRef.current[0] = el)} className="floating-orb orb-amber"></div>
        <div ref={(el) => (orbsRef.current[1] = el)} className="floating-orb orb-teal"></div>
      </div>

      {/* Main Content Canvas */}
      <main className="relative z-10 w-full min-h-screen flex flex-col items-center pt-24 pb-20 px-margin-mobile md:px-margin-desktop">
        {/* Hero Header */}
        <div className="text-center max-w-4xl mb-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface drop-shadow-2xl">
            Discover places that aren't in the guidebook.
          </h1>
          <p className="font-title-lg text-teal-trust text-center">
            Our AI surfaces hidden local spots matched to your travel style.
          </p>
        </div>

        {/* Filter Chips Row */}
        <div className="w-full max-w-2xl overflow-x-auto no-scrollbar flex items-center justify-center gap-3 mb-12">
          {["all", "hidden", "food", "adventure", "cultural", "leisure"].map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-6 py-2 rounded-full border font-label-sm whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "border-primary bg-primary text-on-primary-container"
                  : "border-glass-stroke bg-glass-fill text-on-surface hover:border-teal-trust"
              }`}
            >
              {cat === "all" ? "All" : cat === "hidden" ? "Hidden Gems" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Featured Card Section */}
        {currentItem && (
          <div
            onClick={handleCardClick}
            className="relative group cursor-pointer transition-transform duration-500 hover:scale-[1.02] max-w-md w-full"
          >
            {/* Card Outer Vignette Effect */}
            <div className="absolute -inset-10 bg-amber-glow blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
            
            {/* Place Card */}
            <div className="glass-morphism w-full rounded-2xl overflow-hidden relative z-10 shadow-2xl">
              {/* Image Header */}
              <div className="h-64 relative overflow-hidden">
                <img
                  alt={currentItem.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  src={currentItem.img}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute top-4 right-4 bg-teal-trust/90 backdrop-blur-md text-on-secondary px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
                  {currentItem.tag}
                </div>
              </div>
              
              {/* Card Body */}
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-headline-md text-on-surface text-xl md:text-2xl">{currentItem.title}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="font-label-sm text-on-surface-variant">{currentItem.rating}</span>
                      <span className="mx-2 text-glass-stroke">|</span>
                      <span className="font-label-sm text-on-surface-variant">{currentItem.reviews} reviews</span>
                    </div>
                  </div>
                  <button
                    onClick={handleQuickPlan}
                    className="flex items-center gap-1 text-teal-trust hover:text-secondary-fixed transition-colors group/btn shrink-0"
                  >
                    <span className="font-label-sm">Quick Plan</span>
                    <span className="material-symbols-outlined text-lg transition-transform group-hover/btn:translate-x-1">add_circle</span>
                  </button>
                </div>
                <p className="font-body-md text-on-surface-variant line-clamp-2">
                  {currentItem.desc}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Global CTA */}
        <div className="mt-12">
          <Link
            href="/planner"
            className="px-10 py-4 bg-primary text-on-primary-fixed font-title-lg rounded-full shadow-[0_0_20px_rgba(245,166,35,0.3)] hover:shadow-[0_0_40px_rgba(245,166,35,0.5)] transition-all flex items-center gap-3 active:scale-95 text-sm font-semibold"
          >
            Open Planner
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
      </main>

      <Footer />
    </>
  );
}
