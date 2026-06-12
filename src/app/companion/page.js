"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";



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

  const [companionsList, setCompanionsList] = useState([]);

  useEffect(() => {
    verifyLock();
    loadCompanionsData();
  }, []);

  const verifyLock = () => {
    const planned = localStorage.getItem("wandr_trip_planned") === "true";
    const dest = localStorage.getItem("wandr_planned_destination") || "";
    
    setIsTripPlanned(planned);
    setUserPlannedDest(dest);
    setPlannedDest(dest || "All Destinations");
  };

  const loadCompanionsData = async () => {
    try {
      const destRes = await fetch("/api/destinations");
      const destData = await destRes.json();
      const destinations = destData.success ? destData.data : [];

      const compRes = await fetch("/api/companions");
      const compData = await compRes.json();
      const companions = compData.success ? compData.data : [];

      const mapped = companions.map(c => {
        const matchingDest = destinations.find(d => d.id === c.current_destination_id);
        const destTitle = matchingDest ? `${matchingDest.title} (${matchingDest.country})` : "Remote Location";
        return {
          id: c.id,
          name: c.full_name || "Traveler",
          image: c.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
          trust: c.trust_score ?? 80,
          fit: 90 + ((c.trust_score ?? 80) % 10),
          desc: c.bio || "No bio available.",
          tags: c.tags || [],
          specialty: c.specialty || "Explorer",
          dest: destTitle
        };
      });

      setCompanionsList(mapped);
    } catch (err) {
      console.error("Failed to load companions data:", err);
    }
  };

  const resetTrip = () => {
    localStorage.removeItem("wandr_trip_planned");
    localStorage.removeItem("wandr_planned_destination");
    verifyLock();
  };

  const getFilteredCompanions = () => {
    let list = companionsList;

    if (isTripPlanned && userPlannedDest) {
      const destLower = userPlannedDest.toLowerCase();
      list = list.filter(c => {
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

  const triggerSwipeAction = async (isLike) => {
    const companion = activeCompanion;
    if (companion) {
      try {
        // 1. Ensure the match row exists in DB
        await fetch("/api/companions/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companion_id: companion.id })
        });

        // 2. Register swipe status
        await fetch(`/api/companions/${companion.id}/swipe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: isLike ? "like" : "pass" })
        });
      } catch (err) {
        console.error("Swipe API error:", err);
      }

      if (isLike) {
        setTimeout(() => {
          startConversation(companion);
        }, 300);
      }
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

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || !chatUser) return;

    const userText = chatInput;
    setChatMessages((prev) => [...prev, { sender: "me", text: userText }]);
    setChatInput("");

    try {
      const history = chatMessages
        .filter(m => m.sender !== "system")
        .map(m => ({
          role: m.sender === "me" ? "user" : "model",
          content: m.text
        }));

      const response = await fetch("/api/companion-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          companion_id: chatUser.id,
          history: history
        })
      });

      const res = await response.json();
      const aiResponseText = res.success ? (res.data?.reply || res.reply) : "I'm offline right now. Let's connect inside the safety grid later!";

      setChatMessages((prev) => [
        ...prev,
        { sender: "them", text: aiResponseText }
      ]);
    } catch (err) {
      console.error("Companion chat error:", err);
      setChatMessages((prev) => [
        ...prev,
        { sender: "them", text: "I'm offline right now. Let's connect inside the safety grid later!" }
      ]);
    }
  };

  const handleSendAiMessage = async (e, directText = "") => {
    if (e && e.preventDefault) e.preventDefault();
    const userText = directText || aiInput;
    if (!userText.trim()) return;

    setAiMessages((prev) => [...prev, { sender: "me", text: userText }]);
    setAiInput("");
    setAiIsTyping(true);

    try {
      const history = aiMessages.map(m => ({
        role: m.sender === "me" ? "user" : "model",
        content: m.text
      }));

      const response = await fetch("/api/companion-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: history
        })
      });

      const res = await response.json();
      const reply = res.success ? (res.data?.reply || res.reply) : "I am having trouble answering right now. Please try again.";

      setAiMessages((prev) => [...prev, { sender: "them", text: reply }]);
    } catch (err) {
      console.error("Match AI Guide error:", err);
      setAiMessages((prev) => [...prev, { sender: "them", text: "I am having trouble answering right now. Please try again." }]);
    } finally {
      setAiIsTyping(false);
    }
  };

  const handleAiSuggestion = (query) => {
    setAiInput(query);
    handleSendAiMessage(null, query);
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
