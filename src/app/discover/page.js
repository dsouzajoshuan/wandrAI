"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

const SIGHTS_DATA = {
  all: [
    { title: "Dudhsagar Viewpoint, Goa", tag: "Hidden Gem", rating: "4.8", reviews: "2.4k", desc: "A breathtaking panoramic spot overlooking the 'Sea of Milk' waterfall, accessible only by a specialized AI-routed trail.", img: "https://images.unsplash.com/photo-1540553016722-983e48a2cd10?q=80&w=600&auto=format&fit=crop", key: "ziro" },
    { title: "Siju Cave Systems, Meghalaya", tag: "Hidden Gem", rating: "4.8", reviews: "890", desc: "Navigate deep limestone cave chambers filled with unique bats, stalactites, and hidden streams.", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop", key: "meghalaya" },
    { title: "Dhankar Mystic Lake, Spiti", tag: "Hidden Gem", rating: "4.9", reviews: "640", desc: "A serene, mystical high-altitude lake perched above Dhankar Monastery, reflecting snow-capped peaks.", img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop", key: "spiti" },
    { title: "Ziro Valley Pine Groves, Arunachal", tag: "Adventure", rating: "4.9", reviews: "1.2k", desc: "Misty pine-covered slopes and rustic local homestays in a secluded Himalayan valley.", img: "/images/download.jpg", key: "ziro" },
    { title: "Nubra Valley Sand Dunes, Ladakh", tag: "Adventure", rating: "4.8", reviews: "1.9k", desc: "Ride double-humped Bactrian camels through high-altitude cold desert sand dunes bordered by mountains.", img: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=600&auto=format&fit=crop", key: "ladakh" },
    { title: "Key Monastery Climbs, Spiti", tag: "Cultural", rating: "4.9", reviews: "3.1k", desc: "Perched at 13,668 feet, this historic fortress monastery offers panoramic snowy ridge views.", img: "/images/download (1).jpg", key: "spiti" },
    { title: "Thiksey Monastery Chants, Ladakh", tag: "Cultural", rating: "4.9", reviews: "2.3k", desc: "Experience powerful Buddhist morning prayer assemblies amidst ancient clay statues and scroll paintings.", img: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=600&auto=format&fit=crop", key: "ladakh" },
    { title: "Cherrapunji Root Bridges, Meghalaya", tag: "Hidden Gem", rating: "4.7", reviews: "1.8k", desc: "Navigate the active 200-year-old bio-engineered double-decker living root bridges.", img: "/images/download (2).jpg", key: "meghalaya" },
    { title: "Munnar Spices Kitchen, Munnar", tag: "Food", rating: "4.7", reviews: "730", desc: "Savor aromatic clay-pot bamboo biryani, freshly plucked cardamom teas, and local banana leaf feasts.", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop", key: "munnar" },
    { title: "Mawphlang Local Kitchens, Meghalaya", tag: "Food", rating: "4.7", reviews: "650", desc: "Savor smoked pork, red rice beer, and seasonal bamboo shoot delicacies in tribal hubs.", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop", key: "meghalaya" },
    { title: "Apatani Organic Feast, Ziro", tag: "Food", rating: "4.6", reviews: "490", desc: "Sample authentic bamboo shoot chicken and local fermented rice brews prepared over wood-fired hearths.", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop", key: "ziro" },
    { title: "Kibber Sanctuary Expedition, Spiti", tag: "Adventure", rating: "4.9", reviews: "940", desc: "Trek high-altitude wildlife corridors guided by local scouts to track the elusive snow leopard.", img: "/images/download (1).jpg", key: "spiti" },
    { title: "Hampi Riverbed Cafe, Hampi", tag: "Food", rating: "4.8", reviews: "810", desc: "Enjoy fresh organic coconut water, traditional filter coffee, and flatbreads on river boulders.", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop", key: "hampi" },
    { title: "Anegundi Kingdom Ruins, Hampi", tag: "Cultural", rating: "4.9", reviews: "1.7k", desc: "Explore ancient mythological cave carvings, stone bridges, and fortified gateways bordering rivers.", img: "/images/images.jpg", key: "hampi" },
    { title: "Kolukkumalai Estate, Munnar", tag: "Leisure", rating: "4.8", reviews: "1.9k", desc: "Experience the highest organic tea gardens on Earth under rolling morning clouds.", img: "/images/images (2).jpg", key: "munnar" },
    { title: "Lockhart Gap Overlook, Munnar", tag: "Leisure", rating: "4.7", reviews: "1.1k", desc: "Observe misty horizons of lush tea valleys and valleys from elevated panoramic viewpoints.", img: "/images/images (2).jpg", key: "munnar" },
    { title: "Sanapur Lake Coracle, Hampi", tag: "Leisure", rating: "4.8", reviews: "1.3k", desc: "Unwind with a peaceful traditional circular boat ride between massive granite boulders.", img: "/images/images.jpg", key: "hampi" }
  ],
  hidden: [
    { title: "Dudhsagar Viewpoint, Goa", tag: "Hidden Gem", rating: "4.8", reviews: "2.4k", desc: "A breathtaking panoramic spot overlooking the 'Sea of Milk' waterfall, accessible only by a specialized AI-routed trail.", img: "https://images.unsplash.com/photo-1540553016722-983e48a2cd10?q=80&w=600&auto=format&fit=crop", key: "ziro" },
    { title: "Siju Cave Systems, Meghalaya", tag: "Hidden Gem", rating: "4.8", reviews: "890", desc: "Navigate deep limestone cave chambers filled with unique bats, stalactites, and hidden streams.", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop", key: "meghalaya" },
    { title: "Dhankar Mystic Lake, Spiti", tag: "Hidden Gem", rating: "4.9", reviews: "640", desc: "A serene, mystical high-altitude lake perched above Dhankar Monastery, reflecting snow-capped peaks.", img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop", key: "spiti" },
    { title: "Cherrapunji Root Bridges, Meghalaya", tag: "Hidden Gem", rating: "4.7", reviews: "1.8k", desc: "Navigate the active 200-year-old bio-engineered double-decker living root bridges.", img: "/images/download (2).jpg", key: "meghalaya" }
  ],
  food: [
    { title: "Munnar Spices Kitchen, Munnar", tag: "Food", rating: "4.7", reviews: "730", desc: "Savor aromatic clay-pot bamboo biryani, freshly plucked cardamom teas, and local banana leaf feasts.", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop", key: "munnar" },
    { title: "Mawphlang Local Kitchens, Meghalaya", tag: "Food", rating: "4.7", reviews: "650", desc: "Savor smoked pork, red rice beer, and seasonal bamboo shoot delicacies in tribal hubs.", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop", key: "meghalaya" },
    { title: "Apatani Organic Feast, Ziro", tag: "Food", rating: "4.6", reviews: "490", desc: "Sample authentic bamboo shoot chicken and local fermented rice brews prepared over wood-fired hearths.", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop", key: "ziro" },
    { title: "Hampi Riverbed Cafe, Hampi", tag: "Food", rating: "4.8", reviews: "810", desc: "Enjoy fresh organic coconut water, traditional filter coffee, and flatbreads on river boulders.", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop", key: "hampi" }
  ],
  adventure: [
    { title: "Ziro Valley Pine Groves, Arunachal", tag: "Adventure", rating: "4.9", reviews: "1.2k", desc: "Misty pine-covered slopes and rustic local homestays in a secluded Himalayan valley.", img: "/images/download.jpg", key: "ziro" },
    { title: "Nubra Valley Sand Dunes, Ladakh", tag: "Adventure", rating: "4.8", reviews: "1.9k", desc: "Ride double-humped Bactrian camels through high-altitude cold desert sand dunes bordered by mountains.", img: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=600&auto=format&fit=crop", key: "ladakh" },
    { title: "Kibber Sanctuary Expedition, Spiti", tag: "Adventure", rating: "4.9", reviews: "940", desc: "Trek high-altitude wildlife corridors guided by local scouts to track the elusive snow leopard.", img: "/images/download (1).jpg", key: "spiti" }
  ],
  cultural: [
    { title: "Key Monastery Climbs, Spiti", tag: "Cultural", rating: "4.9", reviews: "3.1k", desc: "Perched at 13,668 feet, this historic fortress monastery offers panoramic snowy ridge views.", img: "/images/download (1).jpg", key: "spiti" },
    { title: "Thiksey Monastery Chants, Ladakh", tag: "Cultural", rating: "4.9", reviews: "2.3k", desc: "Experience powerful Buddhist morning prayer assemblies amidst ancient clay statues and scroll paintings.", img: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=600&auto=format&fit=crop", key: "ladakh" },
    { title: "Anegundi Kingdom Ruins, Hampi", tag: "Cultural", rating: "4.9", reviews: "1.7k", desc: "Explore ancient mythological cave carvings, stone bridges, and fortified gateways bordering rivers.", img: "/images/images.jpg", key: "hampi" }
  ],
  leisure: [
    { title: "Kolukkumalai Estate, Munnar", tag: "Leisure", rating: "4.8", reviews: "1.9k", desc: "Experience the highest organic tea gardens on Earth under rolling morning clouds.", img: "/images/images (2).jpg", key: "munnar" },
    { title: "Lockhart Gap Overlook, Munnar", tag: "Leisure", rating: "4.7", reviews: "1.1k", desc: "Observe misty horizons of lush tea valleys and valleys from elevated panoramic viewpoints.", img: "/images/images (2).jpg", key: "munnar" },
    { title: "Sanapur Lake Coracle, Hampi", tag: "Leisure", rating: "4.8", reviews: "1.3k", desc: "Unwind with a peaceful traditional circular boat ride between massive granite boulders.", img: "/images/images.jpg", key: "hampi" }
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

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 grid-bg"></div>
        <div ref={(el) => (orbsRef.current[0] = el)} className="glowing-orb top-20 right-0 bg-primary"></div>
        <div ref={(el) => (orbsRef.current[1] = el)} className="glowing-orb bottom-20 left-0 bg-teal-trust"></div>
      </div>

      <main className="relative z-10 w-full min-h-screen flex flex-col items-center pt-24 pb-20 px-margin-mobile md:px-margin-desktop">
        <div className="text-center max-w-4xl mb-8 space-y-4">
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface drop-shadow-2xl">
            Discover places that aren't in the guidebook.
          </h1>
          <p className="font-title-lg text-teal-trust text-center text-lg">
            Our AI surfaces hidden local spots matched to your travel style.
          </p>
        </div>

        <div className="w-full max-w-2xl overflow-x-auto no-scrollbar flex items-center justify-center gap-3 mb-12">
          {["all", "hidden", "food", "adventure", "cultural", "leisure"].map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-5 py-2.5 rounded-full border font-label-sm text-xs font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer ${
                activeCategory === cat
                  ? "bg-primary/20 border-primary text-primary"
                  : "bg-surface-container-low border-glass-stroke text-on-surface-variant hover:border-primary/50"
              }`}
            >
              {cat === "all" ? "All" : cat === "hidden" ? "Hidden Gems" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {currentItem && (
          <div
            onClick={handleCardClick}
            className="relative group cursor-pointer transition-transform duration-500 hover:scale-[1.02] max-w-md w-full"
          >
            <div className="absolute -inset-10 bg-amber-glow blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
            
            <div className="glass-morphism w-full rounded-2xl overflow-hidden relative z-10 shadow-2xl">
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
                    className="flex items-center gap-1 text-teal-trust hover:text-secondary-fixed transition-colors group/btn shrink-0 cursor-pointer border-none bg-transparent outline-none"
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
