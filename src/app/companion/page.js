"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

const COMPANIONS_DATABASE = [
  { id: "sneha", name: "Sneha K.", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop", trust: 100, fit: 97, desc: "Looking for a trekking buddy in Spiti. Prefers local homestays. ID verified.", tags: ["Trekking", "Solo"], specialty: "Trekking", dest: "Spiti Valley (Himachal)" },
  { id: "david", name: "David P.", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop", trust: 98, fit: 91, desc: "High altitude trekking and camping enthusiast. Keen to check snow leopard trails.", tags: ["Adventure", "Trekking"], specialty: "Trekking", dest: "Spiti Valley (Himachal)" },
  
  { id: "rohan", name: "Rohan M.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop", trust: 100, fit: 96, desc: "Focusing on heritage photography. Heading to Hampi next week. Verified government ID.", tags: ["Photography", "Solo"], specialty: "Photography", dest: "Hampi (Karnataka)" },
  { id: "vikram", name: "Vikram S.", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop", trust: 97, fit: 89, desc: "Exploring ancient monolith architecture and local markets. Happy to pool cab fares.", tags: ["History", "Budget-share"], specialty: "Budget-share", dest: "Hampi (Karnataka)" },
  
  { id: "priya", name: "Priya S.", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop", trust: 100, fit: 94, desc: "Looking to pool taxi costs and explore living root bridges. Voice verified companion.", tags: ["Trekking", "Budget-share"], specialty: "Trekking", dest: "Shillong (Meghalaya)" },
  { id: "rahul", name: "Rahul R.", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop", trust: 96, fit: 88, desc: "Jungle trekking and waterfall photography. Deep interest in local Khasi foods.", tags: ["Nature", "Culture"], specialty: "Culture", dest: "Shillong (Meghalaya)" },
  
  { id: "karan", name: "Karan D.", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop", trust: 100, fit: 91, desc: "Exploring remote villages and local cuisines. Booking shared homestays. ID verified.", tags: ["Culture", "Foodie"], specialty: "Culture", dest: "Ziro (Arunachal)" },
  { id: "jessica", name: "Jessica L.", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop", trust: 99, fit: 92, desc: "Documentary photographer capturing tribal communities and bamboo structures.", tags: ["Photography", "Solo"], specialty: "Photography", dest: "Ziro (Arunachal)" },
  
  { id: "amit", name: "Amit P.", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop", trust: 100, fit: 89, desc: "Sharing a private cab from Leh to Nubra Valley. Splitting expenses equally.", tags: ["Budget-share", "Adventurer"], specialty: "Budget-share", dest: "Leh Wilderness (Ladakh)" },
  { id: "sophia", name: "Sophia W.", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop", trust: 98, fit: 93, desc: "Backpacking across high-altitude cold deserts and capturing landscape media loops.", tags: ["Adventure", "Photography"], specialty: "Photography", dest: "Leh Wilderness (Ladakh)" },
  
  { id: "anjali", name: "Anjali T.", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop", trust: 100, fit: 92, desc: "Misty tea estate walks, bird watching, and botanical photography. Staying at eco-lodges.", tags: ["Leisure", "Nature"], specialty: "Leisure", dest: "Munnar (Kerala)" },
  { id: "matthew", name: "Matthew G.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop", trust: 95, fit: 86, desc: "Splitting transport costs around Kolukkumalai estates. Food enthusiast.", tags: ["Leisure", "Budget-share"], specialty: "Budget-share", dest: "Munnar (Kerala)" },

  { id: "chloe", name: "Chloe B.", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop", trust: 100, fit: 95, desc: "Enjoying the Aegean Sanctuary cruise, luxury transfers, and caldera sunsets.", tags: ["Luxury", "Leisure"], specialty: "Leisure", dest: "Santorini (Greece)" },
  { id: "marcus", name: "Marcus A.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop", trust: 99, fit: 91, desc: "Capturing sunset landscape photography on high-end luxury cruises.", tags: ["Photography", "Luxury"], specialty: "Photography", dest: "Santorini (Greece)" },

  { id: "hans", name: "Hans S.", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop", trust: 100, fit: 94, desc: "Trekking through the Bernese Oberland peaks and exploring hidden alpine glacier lakes.", tags: ["Adventure", "Trekking"], specialty: "Trekking", dest: "Swiss Alps (Switzerland)" },
  { id: "clara", name: "Clara V.", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop", trust: 97, fit: 89, desc: "Backpacking across Switzerland. Seeking to share premium peak rail passes.", tags: ["Leisure", "Adventure"], specialty: "Leisure", dest: "Swiss Alps (Switzerland)" },

  { id: "elena", name: "Elena M.", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop", trust: 100, fit: 96, desc: "Immersing in lagoon history, classical architecture, and art galleries. Seeking a fellow culture enthusiast.", tags: ["Culture", "Photography"], specialty: "Culture", dest: "Venice (Italy)" },
  { id: "francesco", name: "Francesco B.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop", trust: 98, fit: 90, desc: "Exploring floating canal secrets, local seafood dining, and private lagoon routes.", tags: ["Foodie", "Culture"], specialty: "Culture", dest: "Venice (Italy)" }
];

export default function Companion() {
  const router = useRouter();
  const [plannedDest, setPlannedDest] = useState("All Destinations");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("chats");
  const [isTripPlanned, setIsTripPlanned] = useState(false);
  const [userPlannedDest, setUserPlannedDest] = useState("");
  
  const [chatUser, setChatUser] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  const [aiMessages, setAiMessages] = useState([
    { id: 1, sender: "them", text: "Hello! I am your Match AI Guide. Ask me anything about finding matching companions, traveler trust verification, or meets safety." }
  ]);
  const [aiInput, setAiInput] = useState("");
  const [aiIsTyping, setAiIsTyping] = useState(false);

  const cardRef = useRef(null);
  const dragStartPos = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    verifyLock();
  }, []);

  const verifyLock = () => {
    const planned = localStorage.getItem("wandr_trip_planned") === "true";
    const dest = localStorage.getItem("wandr_planned_destination") || "";
    
    setIsTripPlanned(planned);
    setUserPlannedDest(dest);
    setPlannedDest(dest || "All Destinations");
  };

  const resetTrip = () => {
    localStorage.removeItem("wandr_trip_planned");
    localStorage.removeItem("wandr_planned_destination");
    verifyLock();
  };

  const getFilteredCompanions = () => {
    let list = COMPANIONS_DATABASE;

    if (isTripPlanned && userPlannedDest) {
      const destLower = userPlannedDest.toLowerCase();
      list = COMPANIONS_DATABASE.filter(c => {
        const compDest = c.dest.toLowerCase();
        if (destLower.includes("ziro") && compDest.includes("ziro")) return true;
        if (destLower.includes("spiti") && compDest.includes("spiti")) return true;
        if (destLower.includes("meghalaya") && compDest.includes("meghalaya")) return true;
        if (destLower.includes("shillong") && compDest.includes("meghalaya")) return true;
        if (destLower.includes("hampi") && compDest.includes("hampi")) return true;
        if (destLower.includes("ladakh") && compDest.includes("ladakh")) return true;
        if (destLower.includes("leh") && compDest.includes("ladakh")) return true;
        if (destLower.includes("munnar") && compDest.includes("munnar")) return true;
        
        if (destLower.includes("aegean") && (compDest.includes("aegean") || compDest.includes("greece") || compDest.includes("santorini"))) return true;
        if (destLower.includes("alpine") && (compDest.includes("alpine") || compDest.includes("swiss") || compDest.includes("alps"))) return true;
        if (destLower.includes("venetian") && (compDest.includes("venice") || compDest.includes("venetian") || compDest.includes("italy"))) return true;
        
        return compDest.includes(destLower) || destLower.includes(compDest);
      });
    }

    if (specialtyFilter !== "all") {
      list = list.filter(c => c.specialty === specialtyFilter || c.tags.includes(specialtyFilter));
    }

    return list;
  };

  const currentCompanions = getFilteredCompanions();
  const activeCompanion = currentCompanions[currentIndex];

  const handleDragStart = (e) => {
    setIsDragging(true);
    const clientX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
    dragStartPos.current = clientX;
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
    const offset = clientX - dragStartPos.current;
    setDragOffset(offset);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragOffset > 130) {
      triggerSwipeAction(true);
    } else if (dragOffset < -130) {
      triggerSwipeAction(false);
    } else {
      setDragOffset(0);
    }
  };

  const triggerSwipeAction = (isLike) => {
    const companion = activeCompanion;
    if (isLike && companion) {
      setTimeout(() => {
        startConversation(companion);
      }, 300);
    }
    
    setDragOffset(0);
    setCurrentIndex((prev) => prev + 1);
  };

  const startConversation = (companion) => {
    setChatUser(companion);
    setChatMessages([
      { sender: "system", text: "🛡 Verified safety channel connected. Meets-ups only at Wandr Zones." },
      { sender: "them", text: `Hi! Just noticed we are planning trips to ${companion.dest} around the same time. Looking to split cabs or organize hikes?` }
    ]);
    setActiveTab("chats");
  };

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || !chatUser) return;

    const userText = chatInput;
    setChatMessages((prev) => [...prev, { sender: "me", text: userText }]);
    setChatInput("");

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { sender: "them", text: "That sounds great! Let's connect over voice check inside the app safety grid first to finalize timing." }
      ]);
    }, 1500);
  };

  const handleSendAiMessage = (e) => {
    if (e) e.preventDefault();
    if (!aiInput.trim()) return;

    const userText = aiInput;
    setAiMessages((prev) => [...prev, { sender: "me", text: userText }]);
    setAiInput("");
    setAiIsTyping(true);

    setTimeout(() => {
      setAiIsTyping(false);
      let reply = `To find companions, ensure your itinerary is locked. We match based on tags such as "Trekking", "Photography", "Culture", and "Budget-share". Let me know if you want to know more about our trust score.`;
      
      const query = userText.toLowerCase();
      if (query.includes("trust") || query.includes("score") || query.includes("verify") || query.includes("verified")) {
        reply = `Our Trust Score evaluates ID checks, phone logs, and traveler reviews. Verified profiles carry a badge indicating government ID and facial biometrics are validated.`;
      } else if (query.includes("safety") || query.includes("zone") || query.includes("emergency") || query.includes("sos")) {
        reply = `Meets are restricted to Wandr Zones (verified local partner cafes/hotels). Safety Shield monitoring keeps emergency contacts in the loop during active segments.`;
      } else if (query.includes("tag") || query.includes("specialty") || query.includes("filter")) {
        reply = `We support filters for Trekking, Photography, Culture, and Budget-share. Matching travelers must align on at least one specialty tag.`;
      }

      setAiMessages((prev) => [...prev, { sender: "them", text: reply }]);
    }, 1200);
  };

  const handleAiSuggestion = (query) => {
    setAiInput(query);
    setTimeout(() => {
      handleSendAiMessage();
    }, 50);
  };

  return (
    <>
      <Navbar />

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 grid-bg"></div>
        <div className="glowing-orb top-20 left-0 bg-primary"></div>
        <div className="glowing-orb bottom-20 right-0 bg-teal-trust"></div>
      </div>

      <main className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-24 pb-32">
        <section className="space-y-8 animate-in fade-in duration-300">
          <div className="glass-card rounded-2xl border border-glass-stroke p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="bg-teal-trust/15 text-teal-trust border border-teal-trust/20 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">Active Group Matchmaking</span>
              <h2 className="font-headline-md text-2xl text-on-surface mt-2">{plannedDest}</h2>
            </div>
            {isTripPlanned ? (
              <button onClick={resetTrip} className="text-xs text-error hover:underline flex items-center gap-1 border-none bg-transparent outline-none cursor-pointer font-semibold">
                <span className="material-symbols-outlined text-sm font-semibold">delete_forever</span>
                <span>Reset Current Trip</span>
              </button>
            ) : (
              <Link href="/planner" className="bg-primary/20 border border-primary/30 text-primary hover:bg-primary hover:text-on-primary text-xs px-4 py-2 rounded-full font-semibold transition-all">
                Plan a Trip
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              <div className="glass-card rounded-xl border border-glass-stroke p-4 flex justify-between items-center gap-4">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider font-mono">Specialty Filter</span>
                <select
                  value={specialtyFilter}
                  onChange={(e) => {
                    setSpecialtyFilter(e.target.value);
                    setCurrentIndex(0);
                  }}
                  className="bg-surface-container-low border border-glass-stroke text-on-surface text-xs rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                >
                  <option value="all">All Specialties</option>
                  <option value="Trekking">Trekking</option>
                  <option value="Photography">Photography</option>
                  <option value="Culture">Culture</option>
                  <option value="Budget-share">Budget-share</option>
                  <option value="Leisure">Leisure</option>
                </select>
              </div>

              <div className="h-[460px] relative w-full select-none">
                {currentIndex >= currentCompanions.length ? (
                  <div className="glass-card rounded-2xl border border-glass-stroke p-8 flex flex-col items-center justify-center h-full text-center gap-3">
                    <span className="material-symbols-outlined text-teal-trust !text-5xl animate-pulse">check_circle</span>
                    <div>
                      <h4 className="font-bold text-on-surface font-headline-md text-lg">End of Stack Reached</h4>
                      <p className="text-xs text-on-surface-variant max-w-xs mt-1 leading-relaxed">
                        Adjust filter chips, reset current trip parameters, or create a new itinerary to scan for active nodes.
                      </p>
                    </div>
                  </div>
                ) : (
                  currentCompanions.map((comp, idx) => {
                    if (idx < currentIndex) return null;
                    const isTopCard = idx === currentIndex;
                    
                    const scale = 1 - (idx - currentIndex) * 0.03;
                    const yOffset = (idx - currentIndex) * -10;
                    
                    const cardStyle = isTopCard
                      ? {
                          transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.08}deg)`,
                          zIndex: 100
                        }
                      : {
                          transform: `scale(${scale}) translateY(${yOffset}px)`,
                          zIndex: 50 - idx
                        };

                    return (
                      <div
                        key={comp.id}
                        ref={isTopCard ? cardRef : null}
                        onMouseDown={isTopCard ? handleDragStart : null}
                        onTouchStart={isTopCard ? handleDragStart : null}
                        onMouseMove={isTopCard && isDragging ? handleDragMove : null}
                        onTouchMove={isTopCard && isDragging ? handleDragMove : null}
                        onMouseUp={isTopCard ? handleDragEnd : null}
                        onMouseLeave={isTopCard && isDragging ? handleDragEnd : null}
                        onTouchEnd={isTopCard ? handleDragEnd : null}
                        className="swipe-card glass-card rounded-2xl border border-glass-stroke p-6 shadow-xl flex flex-col justify-between"
                        style={cardStyle}
                      >
                        {isTopCard && dragOffset > 30 && (
                          <div className="stamp stamp-like" style={{ opacity: Math.min(dragOffset / 100, 1) }}>LIKE</div>
                        )}
                        {isTopCard && dragOffset < -30 && (
                          <div className="stamp stamp-nope" style={{ opacity: Math.min(Math.abs(dragOffset) / 100, 1) }}>NOPE</div>
                        )}

                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <img src={comp.image} alt={comp.name} className="w-14 h-14 rounded-full object-cover border border-glass-stroke shrink-0" />
                              <div>
                                <h4 className="font-bold text-md text-on-surface flex items-center gap-1">
                                  <span>{comp.name}</span>
                                  <span className="material-symbols-outlined text-teal-trust text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                </h4>
                                <span className="text-[10px] text-on-surface-variant font-mono">Trust Score: {comp.trust}%</span>
                              </div>
                            </div>
                            <span className="bg-secondary/15 text-secondary border border-secondary/20 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider">{comp.fit}% Fit</span>
                          </div>
                          
                          <p className="text-xs text-on-surface-variant leading-relaxed">{comp.desc}</p>
                          
                          <div className="flex flex-wrap gap-1.5">
                            {comp.tags.map((t, tIdx) => (
                              <span key={tIdx} className="bg-glass-fill border border-glass-stroke text-[9px] px-2 py-0.5 rounded-full text-on-surface-variant font-mono">{t}</span>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-glass-stroke pt-4 flex justify-between items-center text-[10px] text-on-surface-variant">
                          <span className="flex items-center gap-1 font-mono">
                            <span className="material-symbols-outlined text-xs">navigation</span>
                            <span>{comp.dest}</span>
                          </span>
                          <span className="font-semibold text-teal-trust font-mono uppercase tracking-wider">ID Vetted</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {currentIndex < currentCompanions.length && (
                <div className="flex justify-center items-center gap-6 mt-4">
                  <button
                    onClick={() => triggerSwipeAction(false)}
                    className="w-14 h-14 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-500 rounded-full flex items-center justify-center transition-all shadow-md active:scale-90 cursor-pointer outline-none"
                  >
                    <span className="material-symbols-outlined !text-2xl font-bold">close</span>
                  </button>
                  <button
                    onClick={() => triggerSwipeAction(true)}
                    className="w-14 h-14 bg-teal-trust/10 border border-teal-trust/30 hover:bg-teal-trust/20 text-teal-trust rounded-full flex items-center justify-center transition-all shadow-md active:scale-90 cursor-pointer outline-none"
                  >
                    <span className="material-symbols-outlined !text-2xl font-bold">favorite</span>
                  </button>
                </div>
              )}
            </div>

            <div className="lg:col-span-5 flex flex-col h-[600px] glass-card rounded-2xl border border-glass-stroke overflow-hidden shadow-2xl">
              <div className="flex border-b border-glass-stroke bg-surface-container-low shrink-0">
                <button
                  onClick={() => setActiveTab("chats")}
                  className={`flex-1 py-3 text-xs font-semibold tracking-wider uppercase border-r border-glass-stroke transition-all cursor-pointer border-none outline-none ${
                    activeTab === "chats"
                      ? "bg-primary/10 text-primary border-b-2 border-primary"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Companion Chats
                </button>
                <button
                  onClick={() => setActiveTab("guide")}
                  className={`flex-1 py-3 text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer border-none outline-none ${
                    activeTab === "guide"
                      ? "bg-primary/10 text-primary border-b-2 border-primary"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Match AI Guide
                </button>
              </div>

              {activeTab === "chats" ? (
                chatUser ? (
                  <>
                    <div className="bg-surface-container-low border-b border-glass-stroke p-4 flex items-center gap-3 shrink-0 animate-in fade-in duration-300">
                      <div className="relative">
                        <img src={chatUser.image} alt={chatUser.name} className="w-10 h-10 rounded-full object-cover border border-glass-stroke shrink-0" />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-teal-trust border border-surface-container-low rounded-full"></span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-on-surface flex items-center gap-1">
                          <span>{chatUser.name}</span>
                          <span className="material-symbols-outlined text-teal-trust text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        </h4>
                        <span className="text-[10px] text-on-surface-variant font-mono">TRUST SCORE: {chatUser.trust}%</span>
                      </div>
                    </div>

                    <div className="flex-grow p-4 overflow-y-auto space-y-4 no-scrollbar bg-deep-navy-bg/30">
                      {chatMessages.map((msg, idx) => {
                        if (msg.sender === "system") {
                          return (
                            <div key={idx} className="flex justify-center">
                              <div className="bg-glass-fill border border-glass-stroke px-4 py-2.5 rounded-2xl max-w-[90%] text-[10px] text-on-surface-variant text-center font-mono uppercase tracking-wider">
                                {msg.text}
                              </div>
                            </div>
                          );
                        }
                        
                        const isMe = msg.sender === "me";
                        return (
                          <div key={idx} className={`flex gap-3 ${isMe ? "justify-end" : ""}`}>
                            {!isMe && (
                              <img src={chatUser.image} alt={chatUser.name} className="w-8 h-8 rounded-full object-cover shrink-0 border border-glass-stroke" />
                            )}
                            <div
                              className={`px-4 py-2.5 rounded-2xl max-w-[75%] text-xs text-on-surface whitespace-pre-line ${
                                isMe
                                  ? "bg-primary/20 border border-primary/45 rounded-tr-none text-right"
                                  : "bg-glass-fill border border-glass-stroke rounded-tl-none"
                              }`}
                            >
                              {msg.text}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <form onSubmit={handleSendMessage} className="bg-surface-container-low border-t border-glass-stroke p-3 flex gap-2 shrink-0">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className="bg-surface-container-lowest border border-glass-stroke text-on-surface text-xs rounded-lg p-2.5 w-full focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                        placeholder={`Send message to ${chatUser.name}...`}
                      />
                      <button type="submit" className="bg-primary text-on-primary px-4 rounded-lg hover:scale-95 active:scale-95 transition-all flex items-center justify-center shrink-0 border-none outline-none cursor-pointer">
                        <span className="material-symbols-outlined text-sm font-semibold">send</span>
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-grow flex flex-col items-center justify-center p-8 text-center gap-3 animate-in fade-in duration-300">
                    <span className="material-symbols-outlined text-on-surface-variant/20 !text-6xl animate-pulse">forum</span>
                    <h4 className="font-bold text-sm text-on-surface font-headline-md text-base">Messenger Locked</h4>
                    <p className="text-xs text-on-surface-variant max-w-xs mt-0.5 leading-relaxed">
                      Swipe RIGHT or click favorite on traveler cards to unlock matching coordinates and start chat synchronization.
                    </p>
                  </div>
                )
              ) : (
                <div className="flex-grow flex flex-col h-full bg-deep-navy-bg/10 animate-in fade-in duration-300">
                  <div className="flex-grow p-4 overflow-y-auto space-y-4 no-scrollbar">
                    {aiMessages.map((msg) => {
                      const isMe = msg.sender === "me";
                      return (
                        <div key={msg.id} className={`flex gap-3 ${isMe ? "justify-end" : ""}`}>
                          {!isMe && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-teal-trust flex items-center justify-center shrink-0 shadow-md">
                              <span className="material-symbols-outlined text-on-primary text-[15px] font-bold">auto_awesome</span>
                            </div>
                          )}
                          <div
                            className={`px-4 py-2.5 rounded-2xl max-w-[75%] text-xs text-on-surface whitespace-pre-line ${
                              isMe
                                ? "bg-primary/20 border border-primary/45 rounded-tr-none text-right"
                                : "bg-glass-fill border-glass-stroke rounded-tl-none"
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      );
                    })}
                    {aiIsTyping && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-teal-trust flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-on-primary text-[15px] font-bold">auto_awesome</span>
                        </div>
                        <div className="bg-glass-fill border border-glass-stroke px-4 py-2.5 rounded-2xl rounded-tl-none">
                          <div className="flex gap-1 items-center h-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "200ms" }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "400ms" }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-3 border-t border-glass-stroke bg-surface-container-low shrink-0 space-y-3">
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                      <button
                        onClick={() => handleAiSuggestion("How are travelers verified?")}
                        className="shrink-0 px-3 py-1 bg-teal-trust/10 border border-teal-trust/20 text-teal-trust rounded-full text-[10px] font-mono hover:bg-teal-trust/20 cursor-pointer outline-none"
                      >
                        Trust Check
                      </button>
                      <button
                        onClick={() => handleAiSuggestion("What are Wandr Zones?")}
                        className="shrink-0 px-3 py-1 bg-teal-trust/10 border border-teal-trust/20 text-teal-trust rounded-full text-[10px] font-mono hover:bg-teal-trust/20 cursor-pointer outline-none"
                      >
                        Wandr Zones
                      </button>
                      <button
                        onClick={() => handleAiSuggestion("How do I filter by tags?")}
                        className="shrink-0 px-3 py-1 bg-teal-trust/10 border border-teal-trust/20 text-teal-trust rounded-full text-[10px] font-mono hover:bg-teal-trust/20 cursor-pointer outline-none"
                      >
                        Tag Filter
                      </button>
                    </div>
                    <form onSubmit={handleSendAiMessage} className="flex gap-2">
                      <input
                        type="text"
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        className="bg-surface-container-lowest border border-glass-stroke text-on-surface text-xs rounded-lg p-2.5 w-full focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                        placeholder="Ask Match AI Guide..."
                      />
                      <button type="submit" className="bg-primary text-on-primary px-4 rounded-lg hover:scale-95 active:scale-95 transition-all flex items-center justify-center shrink-0 border-none outline-none cursor-pointer">
                        <span className="material-symbols-outlined text-sm font-semibold">send</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>

          </div>

          <div className="glass-card rounded-2xl border border-glass-stroke p-8 max-w-4xl mx-auto mt-12 space-y-4">
            <h3 className="font-headline-md text-xl text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">info</span>
              How Companion Finding Works
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Wandr AI connects verified travelers heading to matching destinations. Our algorithmic matchmaking engine evaluates your planned itinerary dates, destination coordinates, budget tiers, and travel preferences to score compatibility. 
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-[11px] text-on-surface-variant">
              <div className="p-4 bg-glass-fill border border-glass-stroke rounded-xl space-y-2">
                <div className="font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-teal-trust text-sm">verified_user</span>
                  1. Identity Verification
                </div>
                <p>All members complete facial verification and government ID checks to confirm legitimacy before matching.</p>
              </div>
              <div className="p-4 bg-glass-fill border border-glass-stroke rounded-xl space-y-2">
                <div className="font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-teal-trust text-sm">location_on</span>
                  2. Destination Alignment
                </div>
                <p>Matches are exclusively filtered to show travelers planned for your exact destination segments during overlapping windows.</p>
              </div>
              <div className="p-4 bg-glass-fill border border-glass-stroke rounded-xl space-y-2">
                <div className="font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-teal-trust text-sm">handshake</span>
                  3. Double Opt-in Match
                </div>
                <p>Conversations are only enabled after mutual likes. Emergency loops and safety check-ins stay active throughout the joint route.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
