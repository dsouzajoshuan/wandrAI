"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const JOURNEY_LIST = [
  {
    id: "aegean",
    title: "Aegean Sanctuary",
    location: "Santorini, Greece",
    price: "₹4,45,000",
    days: "8",
    description: "Experience 8 days of pure luxury in Santorini. Includes private cliffside transfers, catamaran cruises, and Michelin-star dining overlooking the caldera.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDiV8VlIBKvrBZ8hW9TvalQnPLeNigM7279B6hPZZ5DHMjQtUDH6mqmK7McgmMXEsUU7cnFxFsPSHukN99sxi_Cr7hHSZ5mpj1jLvbne7900dUpMz2UinXb2htYjV6XGa0tXibyTLFX545I4KPf-RZpb8KOa8Vr7awPhc3l8eBB9R_w1HNnRBz7Yb2v0Gh4-lmaYF0Wt-PsLnb11Y_wilFx-lgeGZBhrgObxlPMHiq9KCUEV1KhYNj5NZU2_frlhhshLdyLUGczfeB9",
    alt: "An ultra-modern resort infinity pool in Santorini overlooking the caldera at twilight. The sky is a deep indigo, and the pool reflects a warm amber glow from submerged lights. Luxurious white architecture blends with the cliffside. The mood is exclusive, calm, and high-end AI-generated luxury travel photography.",
    tag: "Recommended",
    isRecommended: true
  },
  {
    id: "alpine",
    title: "Alpine Mystique",
    location: "Bernese Oberland, Switzerland",
    price: "₹2,45,000",
    days: "5",
    description: "A high-altitude escape through the heart of the Bernese Oberland, featuring luxury peaks, hidden lakes, and world-class hospitality in the Swiss Alps.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAH8i0ZFEbjKCZHzFFAnG01CyAXsk30ya1S66w7856UYptVPPE3rQALse6yPKuvhwY9vzkgPRQuuozQ7yWCaJoCPyQNaue39AOiywEixk9Kk0yrUGmv2kd3OXR7FLbdZwAR-CuDhK2i8X0Jj0dpgaiJC7DzQSEAef_zFgUrQs4Lb5YhIPpe-QdshJVXdXw8xavdX5_43pB1fm_m2IemftdoNduK5meforNt29O3bqE3PXzKaD9VYMwf82pUG2ARzNNimHHY8xs-2lny",
    alt: "A breathtaking aerial view of the Swiss Alps at sunset, with golden sunlight catching the snow-capped peaks and deep shadows in the valleys. The atmosphere is cinematic and cold, with a warm amber glow from the setting sun casting long shadows across the rugged terrain. High contrast and luxurious aesthetic.",
    tag: "Adventure",
    isRecommended: false
  },
  {
    id: "venetian",
    title: "Venetian Echoes",
    location: "Venice, Italy",
    price: "₹1,85,000",
    days: "6",
    description: "Immerse yourself in the art, history, and culinary secrets of the floating city with private gondola access and exclusive lagoon tours.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDf0zLPplIWYzj3_m7VDIGrkLJIysyEuEXT1VE8xRtRoq6qPEzdpPGW4QVe4GvGN1A_U75L6CjBeYSo9tFGkxYAJBpd2KCEizGh3XjOUhmUBT9RHwdByzXnEhJm9MwV52srBWh9tRmH-Go2CFwLHF4DsEAHdKiptyssSEeXroPoHa6rE8DJNcyZbP-JyqpvRcinLhRZJ9oDkoFO65ce0BaKFqaDzxp_d_-P1q4yd0WJh4d3zGSiaB0TSEyUzRkYiAQt9nfLjmBh_-4f",
    alt: "A serene morning mist over the canals of Venice, with traditional gondolas moored against ancient stone buildings. The lighting is soft and ethereal, reflecting the cool teal and deep blues of the water against the warm ochre of the architecture. A cinematic, romantic travel atmosphere with high-end photographic quality.",
    tag: "Culture",
    isRecommended: false
  }
];

export default function CuratedJourneys() {
  const router = useRouter();

  const [selectedBudgets, setSelectedBudgets] = useState({
    aegean: "Explorer",
    alpine: "Explorer",
    venetian: "Explorer"
  });

  const [activeViews, setActiveViews] = useState({
    aegean: "image",
    alpine: "image",
    venetian: "image"
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const orbs = document.querySelectorAll(".orb");
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      
      orbs.forEach((orb, index) => {
        const speed = (index + 1) * 30;
        orb.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const getPrice = (id, basePriceStr) => {
    const basePrice = parseInt(basePriceStr.replace(/[^0-9]/g, ""), 10);
    const tier = selectedBudgets[id] || "Explorer";
    let calculated = basePrice;
    if (tier === "Elite") {
      calculated += 150000;
    } else if (tier === "Royal") {
      calculated += 350000;
    }
    return `₹${calculated.toLocaleString("en-IN")}`;
  };

  const handleBudgetChange = (id, tier) => {
    setSelectedBudgets(prev => ({
      ...prev,
      [id]: tier
    }));
  };

  const toggleView = (id, view) => {
    setActiveViews(prev => ({
      ...prev,
      [id]: view
    }));
  };

  const handleBookNow = (journey) => {
    const finalPrice = getPrice(journey.id, journey.price);
    const selectedTier = selectedBudgets[journey.id] || "Explorer";
    
    localStorage.setItem("wandr_trip_planned", "true");
    localStorage.setItem("wandr_planned_destination", `${journey.title} (${selectedTier})`);
    localStorage.setItem("wandr_planned_days", journey.days);
    localStorage.setItem("wandr_planned_budget", finalPrice);
    
    router.push("/orchestrator");
  };

  const handleViewDetails = (title) => {
    alert(`Showing luxury package details for ${title}. Daily VIP concierge itinerary maps locked.`);
  };

  return (
    <>
      <Navbar />

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 grid-bg"></div>
      </div>

      <div className="fixed rounded-full blur-[80px] z-0 opacity-15 orb bg-[#ffc880] w-[400px] h-[400px] -top-[100px] -left-[100px]" />
      <div className="fixed rounded-full blur-[80px] z-0 opacity-15 orb bg-[#00C9A7] w-[350px] h-[350px] bottom-[10%] -right-[50px]" />

      <main className="relative z-10 pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-4xl mx-auto">
        <header className="mb-16">
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg mb-4">Curated Journeys</h1>
          <p className="text-on-surface-variant max-w-2xl text-body-md font-body-md">
            We've analyzed millions of travel patterns and your personal preferences to fetch these exclusive itineraries. Choose the path that speaks to your soul.
          </p>
        </header>

        <div className="space-y-12">
          {JOURNEY_LIST.map((journey) => (
            <div
              key={journey.id}
              className="glass-card rounded-xl overflow-hidden group hover:border-primary/40 transition-all duration-500"
            >
              <div className="flex flex-col md:flex-row">
                {/* Media Container */}
                <div className="relative h-64 md:h-auto md:w-1/3 min-h-[260px] bg-[#0b0e14]">
                  {/* View Toggles (Image / Map) */}
                  <div className="absolute top-4 left-4 z-20 flex gap-1 bg-black/60 backdrop-blur-md p-0.5 rounded-full border border-glass-stroke shadow-lg">
                    {["image", "map"].map((view) => (
                      <button
                        key={view}
                        type="button"
                        onClick={() => toggleView(journey.id, view)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider cursor-pointer border-none uppercase ${
                          activeViews[journey.id] === view
                            ? "bg-primary text-on-primary"
                            : "text-on-surface-variant hover:text-on-surface bg-transparent"
                        }`}
                      >
                        {view}
                      </button>
                    ))}
                  </div>

                  {activeViews[journey.id] === "map" ? (
                    <iframe
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(journey.location)}&t=&z=12&ie=UTF8&iwloc=&output=embed`}
                      className="w-full h-full border-none opacity-85"
                      style={{ filter: "invert(90%) hue-rotate(180deg) contrast(110%) saturate(70%)" }}
                      allowFullScreen=""
                      loading="lazy"
                    ></iframe>
                  ) : (
                    <img
                      alt={journey.alt}
                      className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-102"
                      src={journey.image}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-surface-container-lowest/60 to-transparent pointer-events-none"></div>
                  
                  <div className="absolute bottom-4 left-4 pointer-events-none">
                    {journey.isRecommended ? (
                      <span className="bg-primary/20 text-primary px-3 py-1 rounded-full font-label-sm text-label-sm border border-primary/30 backdrop-blur-md flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                          auto_awesome
                        </span>
                        {journey.tag}
                      </span>
                    ) : (
                      <span className="bg-teal-trust/20 text-teal-trust px-3 py-1 rounded-full font-label-sm text-label-sm border border-teal-trust/30 backdrop-blur-md">
                        {journey.tag}
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Container */}
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div>
                        <h3 className="font-headline-md text-2xl text-on-surface font-bold">{journey.title}</h3>
                        <span className="text-[10px] font-mono tracking-wider text-teal-trust font-bold uppercase">{journey.days} Days Package</span>
                      </div>
                      <span className="font-title-lg text-primary text-2xl font-bold">{getPrice(journey.id, journey.price)}</span>
                    </div>
                    <p className="text-on-surface-variant text-body-md font-body-md mb-6 leading-relaxed">{journey.description}</p>

                    {/* Budget Selectors */}
                    <div className="flex items-center gap-2 mb-6">
                      <span className="text-[10px] font-bold text-on-surface-variant font-mono uppercase tracking-wider">Tier:</span>
                      <div className="flex gap-1 bg-surface-container-low p-0.5 rounded-full border border-glass-stroke">
                        {["Explorer", "Elite", "Royal"].map((tier) => (
                          <button
                            key={tier}
                            type="button"
                            onClick={() => handleBudgetChange(journey.id, tier)}
                            className={`px-3.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer border-none transition-all ${
                              selectedBudgets[journey.id] === tier
                                ? "bg-primary text-on-primary font-bold shadow-sm"
                                : "text-on-surface-variant hover:text-on-surface bg-transparent"
                            }`}
                          >
                            {tier}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 items-center">
                    <button
                      onClick={() => handleViewDetails(journey.title)}
                      className="flex items-center gap-2 text-teal-trust font-label-sm text-label-sm hover:translate-x-1 transition-transform cursor-pointer bg-transparent border-none outline-none"
                    >
                      View Details <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                    <button
                      onClick={() => handleBookNow(journey)}
                      className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-title-lg text-sm hover:shadow-[0_0_20px_rgba(255,200,128,0.3)] transition-all cursor-pointer border-none outline-none font-semibold"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
}
