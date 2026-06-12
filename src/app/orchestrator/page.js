"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const TRIP_DATA = {
  "Aegean Sanctuary": {
    location: "Santorini, Greece",
    welcome: "Your Santorini Caldera Cruise and cliffside dining are confirmed. I've secured the sunset catamaran reservation and private luxury transfers. Any adjustments needed for tonight?",
    markers: [
      {
        id: 1,
        name: "Catamaran Cruise",
        time: "16:30",
        type: "Sunset Sailing",
        top: "25%",
        left: "20%",
        color: "bg-teal-trust"
      },
      {
        id: 2,
        name: "Caldera View Dining",
        time: "20:00",
        type: "Michelin Star Restaurant",
        top: "65%",
        right: "25%",
        color: "bg-[#f5a623]"
      }
    ]
  },
  "Alpine Mystique": {
    location: "Bernese Oberland, Switzerland",
    welcome: "Your Bernese Oberland High-Altitude Trail is configured. I've confirmed the Swiss peaks pass and alpine lakeside lodging check-in. Any adjustments needed for tonight?",
    markers: [
      {
        id: 1,
        name: "Bernese Peak Summit",
        time: "10:00",
        type: "Cable Car Ascent",
        top: "20%",
        left: "30%",
        color: "bg-teal-trust"
      },
      {
        id: 2,
        name: "Alpine Lake Resort",
        time: "17:00",
        type: "Wilderness Lodging",
        top: "60%",
        right: "20%",
        color: "bg-[#f5a623]"
      }
    ]
  },
  "Venetian Echoes": {
    location: "Venice, Italy",
    welcome: "Your Venetian Echoes canal tour is finalized. The private morning gondola reservation and historic lagoon excursion tickets are active. Any adjustments needed for tonight?",
    markers: [
      {
        id: 1,
        name: "Grand Canal Gondola",
        time: "09:00",
        type: "Private Gondola Tour",
        top: "30%",
        left: "25%",
        color: "bg-teal-trust"
      },
      {
        id: 2,
        name: "Historic Lagoon Excursion",
        time: "14:30",
        type: "Island Hop & Lunch",
        top: "70%",
        right: "30%",
        color: "bg-[#f5a623]"
      }
    ]
  },
  "Tokyo Fallback": {
    location: "Tokyo, Japan",
    welcome: "Your Tokyo Nightline is ready. I've secured the jazz lounge reservation and confirmed the private driver. Any adjustments needed for tonight?",
    markers: [
      {
        id: 1,
        name: "Park Hyatt Lounge",
        time: "19:00",
        type: "Cocktails",
        top: "25%",
        left: "20%",
        color: "bg-teal-trust"
      },
      {
        id: 2,
        name: "Secret Omakase",
        time: "21:30",
        type: "Private",
        top: "65%",
        right: "25%",
        color: "bg-[#f5a623]"
      }
    ]
  }
};

export default function TripOrchestrator() {
  const router = useRouter();
  const [destination, setDestination] = useState("Tokyo Fallback");
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const [isSosActive, setIsSosActive] = useState(false);
  const [userLat, setUserLat] = useState(27.2023);
  const [userLng, setUserLng] = useState(93.8291);

  const [activePanel, setActivePanel] = useState("map");
  const [tripTimeline, setTripTimeline] = useState([]);
  const [mapsUrl, setMapsUrl] = useState("");
  const [tripDetails, setTripDetails] = useState({
    title: "Ziro Valley Cultural Expedition",
    location: "Ziro, Arunachal Pradesh",
    days: 3,
    budgetTier: "Explorer"
  });

  useEffect(() => {
    const isPlanned = localStorage.getItem("wandr_trip_planned") === "true";
    
    if (!isPlanned) {
      router.replace("/planner");
      return;
    }

    let dest = localStorage.getItem("wandr_planned_destination") || "Ziro Valley Cultural Expedition";
    let days = localStorage.getItem("wandr_planned_days") || "3";
    let budget = localStorage.getItem("wandr_planned_budget") || "Explorer";

    // Determine clean title and budget tier
    let calculatedTier = "Explorer";
    if (budget.toLowerCase().includes("royal") || dest.toLowerCase().includes("royal")) {
      calculatedTier = "Royal";
    } else if (
      budget.toLowerCase().includes("elite") ||
      dest.toLowerCase().includes("elite") ||
      budget.toLowerCase().includes("premium") ||
      dest.toLowerCase().includes("premium")
    ) {
      calculatedTier = "Elite";
    } else if (budget.toLowerCase().includes("explorer") || dest.toLowerCase().includes("explorer")) {
      calculatedTier = "Explorer";
    }

    const cleanDest = dest.replace(/\(Explorer\)|\(Elite\)|\(Royal\)/gi, "").trim();

    // Look for matching key in TRIP_DATA
    let activeTripInfo = null;
    let mappedKey = "Tokyo Fallback";
    
    const hardcodedKey = Object.keys(TRIP_DATA).find(
      (k) =>
        k.toLowerCase() === cleanDest.toLowerCase() ||
        cleanDest.toLowerCase().includes(k.toLowerCase()) ||
        k.toLowerCase().includes(cleanDest.toLowerCase())
    );
    
    if (hardcodedKey) {
      mappedKey = hardcodedKey;
      activeTripInfo = TRIP_DATA[hardcodedKey];
    } else {
      activeTripInfo = {
        location: cleanDest,
        welcome: `Welcome to your curated ${days}-day ${cleanDest} adventure! I have compiled your custom concierge route in the ${calculatedTier} tier. Let me know if you would like me to coordinate premium transport or reserve local dining options.`,
        markers: [
          { id: 1, name: "Luxury Arrival Point", time: "11:00 AM", type: "Arrival Check-in", top: "35%", left: "40%", color: "bg-teal-trust" },
          { id: 2, name: "Premium Activity", time: "3:30 PM", type: "Afternoon Tour", top: "55%", right: "35%", color: "bg-[#f5a623]" }
        ]
      };
    }

    setDestination(mappedKey);
    
    setTripDetails({
      title: cleanDest,
      location: activeTripInfo.location || cleanDest,
      days: parseInt(days, 10) || 3,
      budgetTier: calculatedTier
    });

    // Read saved timeline activity titles for map waypoints
    let timelineActivities = [];
    try {
      timelineActivities = JSON.parse(localStorage.getItem("wandr_planned_timeline") || "[]");
    } catch {}
    setTripTimeline(timelineActivities);

    // Build Google Maps Directions embed URL from activity names + destination
    const buildMapsUrl = (destination, activities) => {
      const stops = activities.filter(Boolean).slice(0, 8); // max 8 waypoints for Maps
      if (stops.length === 0) {
        // Fallback: just show the destination
        return `https://maps.google.com/maps?q=${encodeURIComponent(destination)}&t=k&z=13&ie=UTF8&iwloc=&output=embed`;
      }
      if (stops.length === 1) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(stops[0] + " " + destination)}&t=k&z=14&ie=UTF8&iwloc=&output=embed`;
      }
      // Use Google Maps Directions embed with origin, waypoints, destination
      const origin = encodeURIComponent(`${stops[0]}, ${destination}`);
      const dest = encodeURIComponent(`${stops[stops.length - 1]}, ${destination}`);
      const waypoints = stops.slice(1, -1)
        .map(s => encodeURIComponent(`${s}, ${destination}`))
        .join("|");
      const waypointsParam = waypoints ? `&waypoints=${waypoints}` : "";
      return `https://www.google.com/maps/embed/v1/directions?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ""}&origin=${origin}&destination=${dest}${waypointsParam}&mode=driving`;
    };

    setMapsUrl(buildMapsUrl(cleanDest, timelineActivities));

    setMessages([
      {
        id: 1,
        role: "assistant",
        content: activeTripInfo.welcome,
        time: "14:02 PM"
      }
    ]);
  }, []);

  useEffect(() => {
    if (messages.length > 1 || isTyping) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (text = inputValue) => {
    const messageContent = typeof text === "string" ? text.trim() : inputValue.trim();
    if (!messageContent) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: messageContent,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    if (typeof text !== "string" || text === inputValue) {
      setInputValue("");
    }
    setIsTyping(true);

    try {
      const history = updatedMessages.map(m => ({
        role: m.role === "assistant" || m.role === "model" ? "model" : "user",
        content: m.content
      }));

      const tripId = localStorage.getItem("wandr_trip_id");
      let response;
      if (tripId) {
        response = await fetch("/api/orchestrator/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: messageContent,
            trip_id: tripId,
            history: history.slice(0, -1)
          })
        });
      } else {
        response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history
          })
        });
      }

      const res = await response.json();
      const aiResponseText = res.success ? (res.data?.reply || res.reply) : (res.reply || "I am having trouble answering right now. Please try again.");

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: aiResponseText,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } catch (err) {
      console.error("Orchestrator AI error:", err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (query) => {
    setInputValue(query);
    handleSendMessage(query);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmergencySOS = async () => {
    setIsSosActive(true);
    
    const sendN8nAlert = async (lat, lng, addressText = "") => {
      try {
        await fetch("/api/safety/n8n", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat, lng, addressText })
        });
      } catch (err) {
        console.error("N8n SOS failed:", err);
      }
    };

    const triggerSOS = (lat, lng, addressText = "") => {
      setUserLat(lat);
      setUserLng(lng);
      sendN8nAlert(lat, lng, addressText);
      const tripId = localStorage.getItem("wandr_trip_id");
      if (tripId) {
        fetch("/api/safety/sos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trip_id: tripId, lat, lng })
        }).catch(err => console.error("SOS API error:", err));
      }
      alert(`SOS ACTIVATED. Dispatching location to emergency services.\n\nLocation sent:\nLAT: ${lat.toFixed(4)}°\nLON: ${lng.toFixed(4)}°\n${addressText}`);
    };

    const handleFallbackLocation = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data && data.latitude && data.longitude) {
          triggerSOS(data.latitude, data.longitude, `${data.city}, ${data.region}, ${data.country_name}`);
        } else {
          throw new Error("IP Geolocation failed");
        }
      } catch (e) {
        // Absolute fallback if everything fails
        triggerSOS(userLat, userLng, "Fallback Location");
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          triggerSOS(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn("Geolocation failed during SOS.", error);
          handleFallbackLocation();
        },
        { timeout: 5000, maximumAge: 0 }
      );
    } else {
      handleFallbackLocation();
    }
  };

  const activeTrip = TRIP_DATA[destination] || TRIP_DATA["Tokyo Fallback"];

  const getBudgetBreakdown = (tier, days) => {
    const rates = {
      Explorer: {
        accommodation: { title: "Boutique Homestays & Eco-Lodges", price: 6500 },
        transport: { title: "Regional Public Transit & Shared Cabs", price: 3000 },
        dining: { title: "Local Diners & Street Food Trails", price: 4000 },
        activities: { title: "Self-Guided Hikes & Public Sightseeing", price: 5000 },
        concierge: { title: "Wandr AI Standard Support", price: 2500, flat: true }
      },
      Elite: {
        accommodation: { title: "4-Star Resorts & Private Villa Stays", price: 28000 },
        transport: { title: "Private Chauffeur Sedan Transfers", price: 15000 },
        dining: { title: "Fine Dining & Boutique Bistro Tours", price: 18000 },
        activities: { title: "Curated Private Tours & Priority Access", price: 22000 },
        concierge: { title: "Wandr AI Elite Priority Support", price: 15000, flat: true }
      },
      Royal: {
        accommodation: { title: "5-Star Ultra-Luxury Heritage Stays", price: 85000 },
        transport: { title: "Private SUV, Yacht Cruises, & Flights", price: 45000 },
        dining: { title: "Michelin Dining & Private Chef Service", price: 50000 },
        activities: { title: "Exclusive VIP Access & Helicopter Charter", price: 60000 },
        concierge: { title: "24/7 Dedicated Concierge & Flight Loop", price: 40000, flat: true }
      }
    };

    const currentRates = rates[tier] || rates.Explorer;
    const accommodationTotal = currentRates.accommodation.price * days;
    const transportTotal = currentRates.transport.price * days;
    const diningTotal = currentRates.dining.price * days;
    const activitiesTotal = currentRates.activities.price * days;
    const conciergeTotal = currentRates.concierge.price;

    const total = accommodationTotal + transportTotal + diningTotal + activitiesTotal + conciergeTotal;

    return {
      categories: [
        { name: "Accommodation", detail: currentRates.accommodation.title, val: accommodationTotal, icon: "hotel", pct: Math.round((accommodationTotal / total) * 100) },
        { name: "Transportation", detail: currentRates.transport.title, val: transportTotal, icon: "directions_car", pct: Math.round((transportTotal / total) * 100) },
        { name: "Gastronomy & Dining", detail: currentRates.dining.title, val: diningTotal, icon: "restaurant", pct: Math.round((diningTotal / total) * 100) },
        { name: "Curated Experiences", detail: currentRates.activities.title, val: activitiesTotal, icon: "local_activity", pct: Math.round((activitiesTotal / total) * 100) },
        { name: "Wandr Concierge Fee", detail: currentRates.concierge.title, val: conciergeTotal, icon: "room_service", pct: Math.round((conciergeTotal / total) * 100) }
      ],
      total: total
    };
  };

  const budgetBreakdown = getBudgetBreakdown(tripDetails.budgetTier, tripDetails.days);

  const formatPrice = (val) => {
    return `₹${val.toLocaleString("en-IN")}`;
  };

  return (
    <>
      <Navbar />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatOrb {
          0% { transform: translate(0px, 0px) scale(1); }
          100% { transform: translate(80px, 40px) scale(1.15); }
        }
        .orchestrator-orb {
          animation: floatOrb 20s infinite alternate ease-in-out;
        }
      `}} />

      <div className="fixed rounded-full blur-[80px] z-0 opacity-15 orchestrator-orb bg-[#ffc880] w-[500px] h-[500px] -top-[100px] -left-[100px]" />
      <div className="fixed rounded-full blur-[80px] z-0 opacity-15 orchestrator-orb bg-[#00C9A7] w-[600px] h-[600px] -bottom-[200px] -right-[100px]" style={{ animationDelay: "-5s" }} />

      <main className="pt-16 min-h-screen flex flex-col md:flex-row gap-0 overflow-hidden relative z-10">
        
        <section className="w-full md:w-3/5 relative h-[512px] md:h-[calc(100vh-4rem)] bg-surface-container-lowest border-r border-glass-stroke overflow-hidden group">
          
          {/* Tab Selector */}
          <div className="absolute top-4 right-4 z-30 flex gap-1 bg-black/60 backdrop-blur-md p-1 rounded-full border border-glass-stroke shadow-lg">
            {["map", "budget"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActivePanel(tab)}
                className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider cursor-pointer border-none uppercase transition-all ${
                  activePanel === tab
                    ? "bg-primary text-on-primary shadow-md"
                    : "text-on-surface-variant hover:text-on-surface bg-transparent"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activePanel === "budget" ? (
            <div className="absolute inset-0 bg-surface-container-lowest/95 overflow-y-auto p-6 md:p-8 pt-20 no-scrollbar z-10 flex flex-col justify-between h-full">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-glass-stroke pb-4 mb-6 gap-4">
                  <div>
                    <h3 className="font-display-lg text-2xl text-primary font-bold">{tripDetails.title}</h3>
                    <p className="text-xs text-on-surface-variant font-mono uppercase tracking-wider mt-1">
                      {tripDetails.budgetTier} Tier • {tripDetails.days} Days Coordinator Breakdowns
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-[10px] font-bold text-on-surface-variant font-mono uppercase tracking-wider block">Estimated Total Cost</span>
                    <span className="text-2xl font-bold text-teal-trust">{formatPrice(budgetBreakdown.total)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {budgetBreakdown.categories.map((cat, idx) => (
                    <div key={idx} className="bg-glass-fill border border-glass-stroke p-4 rounded-xl flex flex-col gap-2 hover:border-primary/30 transition-all duration-300">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-primary bg-primary/10 p-2.5 rounded-lg text-xl">{cat.icon}</span>
                          <div>
                            <h4 className="font-title-lg text-sm text-on-surface font-semibold">{cat.name}</h4>
                            <p className="text-xs text-on-surface-variant mt-0.5 leading-normal">{cat.detail}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-on-surface font-mono">{formatPrice(cat.val)}</span>
                          <div className="text-[9px] text-on-surface-variant font-mono mt-0.5">{cat.pct}% of budget</div>
                        </div>
                      </div>
                      
                      {/* Premium Percentage Progress Bar */}
                      <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden mt-1">
                        <div 
                          className="bg-primary h-full rounded-full transition-all duration-700" 
                          style={{ width: `${cat.pct}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Concierge quote & billing block */}
              <div className="mt-8 border-t border-glass-stroke pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-[10px] text-on-surface-variant/70 font-mono italic max-w-md text-center sm:text-left">
                  *All prices calculated are luxury guidelines based on average partner tariffs for active seasonal slots. Concierge coordination secures instant booking locks on confirmation.
                </p>
                <button
                  onClick={() => alert("Proceeding to premium checkout gateway...")}
                  className="bg-primary text-on-primary px-6 py-2.5 rounded-lg text-xs font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all border-none cursor-pointer shrink-0"
                >
                  Pay & Confirm Trip
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Dynamic Google Maps Directions — shows real route between itinerary stops */}
              <div className="absolute inset-0 bg-[#0b0e14]">
                {mapsUrl ? (
                  <iframe
                    src={mapsUrl}
                    className="w-full h-full border-none"
                    style={{ filter: "invert(92%) hue-rotate(180deg) contrast(105%) saturate(65%)" }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3 text-on-surface-variant">
                      <span className="material-symbols-outlined text-5xl animate-pulse text-primary">map</span>
                      <p className="text-sm font-mono">Loading route map…</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Scrollable stop cards — top-left overlay showing itinerary stops */}
              {tripTimeline.length > 0 && (
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 max-h-[60%] overflow-y-auto no-scrollbar">
                  {tripTimeline.slice(0, 9).map((stop, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 bg-black/70 backdrop-blur-md border border-white/10 py-1.5 px-3 rounded-full hover:border-primary/50 transition-all duration-200 cursor-default group"
                    >
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 shadow"
                        style={{
                          background: idx === 0
                            ? "#00C9A7"
                            : idx === tripTimeline.slice(0, 9).length - 1
                            ? "#f5a623"
                            : "rgba(255,255,255,0.15)",
                          color: idx === 0 || idx === tripTimeline.slice(0, 9).length - 1 ? "#000" : "#fff"
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span className="text-[11px] text-white/90 font-medium truncate max-w-[180px]">{stop}</span>
                    </div>
                  ))}
                  {/* Route line indicator */}
                  <div className="flex items-center gap-2 px-3 py-1 mt-1">
                    <div className="flex-1 h-px bg-gradient-to-r from-teal-400 to-amber-400 opacity-60" />
                    <span className="text-[9px] text-white/40 font-mono uppercase tracking-wider shrink-0">Driving Route</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-amber-400 to-teal-400 opacity-60" />
                  </div>
                </div>
              )}

              {/* Bottom action buttons */}
              <div className="absolute bottom-10 left-10 flex flex-col gap-4 z-20">
                <button
                  onClick={() => router.push("/companion")}
                  className="group relative bg-[#f5a623] hover:bg-[#ffb955] text-on-primary px-8 py-4 rounded-xl font-title-lg text-lg hover:scale-[1.02] active:scale-95 flex items-center gap-3 transition-all cursor-pointer shadow-lg shadow-[#f5a623]/20 border-none outline-none"
                >
                  <span className="material-symbols-outlined text-2xl">person_add_alt</span>
                  <span className="relative z-10">Find Travel Companion</span>
                </button>
                <button
                  onClick={handleEmergencySOS}
                  className="bg-red-600 hover:bg-red-500 text-white flex items-center gap-3 px-8 py-4 rounded-xl font-title-lg text-lg border border-red-400/30 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-lg shadow-red-600/30"
                  style={{ animation: "emergencyPulse 2s infinite" }}
                >
                  <span className="material-symbols-outlined text-2xl animate-pulse">emergency</span>
                  <span>Emergency SOS</span>
                </button>
              </div>
            </>
          )}
        </section>

        <section className="w-full md:w-2/5 flex flex-col h-[614px] md:h-[calc(100vh-4rem)] bg-surface">
          <div className="p-6 border-b border-glass-stroke bg-surface-container-low">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-headline-md text-headline-md text-primary">Trip Orchestrator</h2>
                <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 bg-teal-trust rounded-full animate-pulse"></span>
                  AI Concierge Online
                </p>
              </div>
              <button
                onClick={() => {
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: Date.now(),
                      role: "system",
                      content: "System coordinates locked. External menu actions are restricted during active routing.",
                      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    }
                  ]);
                }}
                className="p-2 hover:bg-glass-fill rounded-full transition-colors cursor-pointer bg-transparent border-none outline-none"
              >
                <span className="material-symbols-outlined text-on-surface-variant">more_vert</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            {messages.map((message) => {
              if (message.role === "system") {
                return (
                  <div key={message.id} className="w-full text-center py-2.5 px-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-mono">
                    {message.content}
                  </div>
                );
              }
              return (
                <div key={message.id} className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                  {message.role === "user" ? (
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-glass-stroke flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-on-surface text-[18px]">person</span>
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-teal-trust flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-on-primary text-[18px]">auto_awesome</span>
                    </div>
                  )}
                  <div
                    className={`border p-4 rounded-2xl ${
                      message.role === "user"
                        ? "bg-primary/10 border-primary/20 rounded-tr-none"
                        : "bg-glass-fill border-glass-stroke rounded-tl-none"
                    } max-w-[85%]`}
                  >
                    <p className="text-on-surface text-body-md font-body-md whitespace-pre-line">{message.content}</p>
                    <span className="text-[10px] text-on-surface-variant/60 block mt-2">{message.time}</span>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-teal-trust flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-primary text-[18px]">auto_awesome</span>
                </div>
                <div className="bg-glass-fill border border-glass-stroke px-4 py-3 rounded-2xl rounded-tl-none">
                  <div className="flex gap-1 items-center h-4">
                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "200ms" }}></div>
                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "400ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-6 bg-surface-container-low border-t border-glass-stroke">
            <div className="relative group">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-glass-fill border border-glass-stroke focus:border-teal-trust focus:ring-0 rounded-2xl p-4 pr-12 text-on-surface font-body-md resize-none transition-all placeholder:text-on-surface-variant/40 outline-none"
                placeholder="Ask anything about your trip..."
                rows="1"
              ></textarea>
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim()}
                className="absolute right-3 bottom-3 p-2 bg-primary text-on-primary rounded-xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 cursor-pointer border-none outline-none"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </div>
            
            <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar">
              <button
                onClick={() => handleSuggestionClick("Dietary Preferences")}
                className="shrink-0 px-4 py-1.5 bg-teal-trust/10 border border-teal-trust/20 text-teal-trust rounded-full text-label-sm font-label-sm hover:bg-teal-trust/20 transition-colors cursor-pointer outline-none"
              >
                Dietary Preferences
              </button>
              <button
                onClick={() => handleSuggestionClick("Weather Forecast")}
                className="shrink-0 px-4 py-1.5 bg-teal-trust/10 border border-teal-trust/20 text-teal-trust rounded-full text-label-sm font-label-sm hover:bg-teal-trust/20 transition-colors cursor-pointer outline-none"
              >
                Weather Forecast
              </button>
              <button
                onClick={() => handleSuggestionClick("Transport Options")}
                className="shrink-0 px-4 py-1.5 bg-teal-trust/10 border border-teal-trust/20 text-teal-trust rounded-full text-label-sm font-label-sm hover:bg-teal-trust/20 transition-colors cursor-pointer outline-none"
              >
                Transport Options
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* SOS Active Overlay */}
      {isSosActive && (
        <div className="fixed inset-0 bg-red-950/95 backdrop-blur-lg z-[100] flex flex-col items-center justify-center gap-6 text-center select-none animate-in fade-in duration-350">
          <span className="material-symbols-outlined text-[#E63946] !text-9xl animate-ping">warning</span>
          <div className="space-y-2 px-4 max-w-lg">
            <h2 className="font-display-lg text-4xl text-white">CRISIS SOS BROADCAST</h2>
            <p className="font-mono text-sm text-red-500">Link configured. Telemetry ping broadcasted to local authorities and saved family loops.</p>
            <p className="font-mono text-xs text-white bg-red-900/50 border border-red-500/30 px-3 py-2 rounded mt-2">
              CURRENT COORDINATES: LAT {userLat.toFixed(4)}° | LON {userLng.toFixed(4)}°
            </p>
          </div>
          <button
            onClick={() => setIsSosActive(false)}
            className="bg-white text-red-900 border border-white px-8 py-3 rounded-lg text-sm font-semibold hover:bg-transparent hover:text-white transition-all shadow-md mt-4 animate-bounce"
          >
            Cancel SOS Alert
          </button>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes emergencyPulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}} />
    </>
  );
}
