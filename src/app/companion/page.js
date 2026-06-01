"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

const COMPANIONS_DATABASE = [
  { id: 'sneha', name: 'Sneha K.', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop', trust: 100, fit: 97, desc: 'Looking for a trekking buddy in Spiti. Prefers local homestays. ID verified.', tags: ['Trekking', 'Solo'], specialty: 'Trekking', dest: 'Spiti Valley (Himachal)' },
  { id: 'rohan', name: 'Rohan M.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop', trust: 100, fit: 96, desc: 'Focusing on heritage photography. Heading to Hampi next week. Verified government ID.', tags: ['Photography', 'Solo'], specialty: 'Photography', dest: 'Hampi (Karnataka)' },
  { id: 'priya', name: 'Priya S.', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop', trust: 100, fit: 94, desc: 'Looking to pool taxi costs and explore living root bridges. Voice verified companion.', tags: ['Trekking', 'Budget-share'], specialty: 'Trekking', dest: 'Shillong (Meghalaya)' },
  { id: 'karan', name: 'Karan D.', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop', trust: 100, fit: 91, desc: 'Exploring remote villages and local cuisines. Booking shared homestays. ID verified.', tags: ['Culture', 'Foodie'], specialty: 'Culture', dest: 'Ziro (Arunachal)' },
  { id: 'amit', name: 'Amit P.', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop', trust: 100, fit: 89, desc: 'Sharing a private cab from Leh to Nubra Valley. Splitting expenses equally.', tags: ['Budget-share', 'Adventurer'], specialty: 'Budget-share', dest: 'Leh Wilderness (Ladakh)' }
];

export default function Companion() {
  const router = useRouter();
  const [isLocked, setIsLocked] = useState(true);
  const [plannedDest, setPlannedDest] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [chatUser, setChatUser] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Swipe gesture hooks
  const cardRef = useRef(null);
  const dragStartPos = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    verifyLock();
  }, []);

  const verifyLock = () => {
    const isTripPlanned = localStorage.getItem("wandr_trip_planned") === "true";
    if (isTripPlanned) {
      setIsLocked(false);
      setPlannedDest(localStorage.getItem("wandr_planned_destination") || "Ziro Valley");
    } else {
      setIsLocked(true);
    }
  };

  const forceUnlock = () => {
    localStorage.setItem("wandr_trip_planned", "true");
    localStorage.setItem("wandr_planned_destination", "Ziro Valley Cultural Expedition");
    verifyLock();
  };

  const resetTrip = () => {
    localStorage.removeItem("wandr_trip_planned");
    localStorage.removeItem("wandr_planned_destination");
    verifyLock();
  };

  const getFilteredCompanions = () => {
    if (specialtyFilter === "all") return COMPANIONS_DATABASE;
    return COMPANIONS_DATABASE.filter(c => c.specialty === specialtyFilter);
  };

  const currentCompanions = getFilteredCompanions();
  const activeCompanion = currentCompanions[currentIndex];

  // Drag handlers
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
      // LIKE (Right Swipe)
      triggerSwipeAction(true);
    } else if (dragOffset < -130) {
      // NOPE (Left Swipe)
      triggerSwipeAction(false);
    } else {
      setDragOffset(0);
    }
  };

  const triggerSwipeAction = (isLike) => {
    const companion = activeCompanion;
    if (isLike && companion) {
      setTimeout(() => {
        alert(`Match Unlocked with ${companion.name}! Connection coordinates registered to chat channel.`);
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
  };

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || !chatUser) return;

    const userText = chatInput;
    setChatMessages((prev) => [...prev, { sender: "me", text: userText }]);
    setChatInput("");

    // Simulate reply
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { sender: "them", text: "That sounds great! Let's connect over voice check inside the app safety grid first to finalize timing." }
      ]);
    }, 1500);
  };

  return (
    <>
      <Navbar />

      {/* Background Layers */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 grid-bg"></div>
        <div className="glowing-orb top-20 left-0 bg-primary"></div>
        <div className="glowing-orb bottom-20 right-0 bg-teal-trust"></div>
      </div>

      <main className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-24 pb-32">
        {isLocked ? (
          /* Lock screen overlay */
          <section className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-6 max-w-md mx-auto">
            <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-primary !text-4xl animate-bounce">lock</span>
            </div>
            <div className="space-y-2">
              <h2 className="font-headline-md text-2xl text-on-surface">Itinerary Unlock Required</h2>
              <p className="text-sm text-on-surface-variant">Configure and lock your travel parameters in the planner to find matching companions heading to your destination.</p>
            </div>
            <div className="flex flex-col gap-3 w-full">
              <button onClick={() => router.push("/planner")} className="bg-primary-container text-on-primary-container py-3.5 rounded-lg text-sm font-semibold hover:scale-98 transition-all shadow-md text-center">
                Configure Planner Route
              </button>
              <button onClick={forceUnlock} className="border border-glass-stroke bg-glass-fill hover:border-teal-trust text-xs py-3 rounded-lg text-on-surface transition-all">
                Bypass & Force Unlock (Demo)
              </button>
            </div>
          </section>
        ) : (
          /* Main Workspace Dashboard */
          <section className="space-y-8">
            {/* Dest information bar */}
            <div className="glass-card rounded-2xl border border-glass-stroke p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="bg-teal-trust/15 text-teal-trust border border-teal-trust/20 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">Active Group Matchmaking</span>
                <h2 className="font-headline-md text-2xl text-on-surface mt-2">{plannedDest}</h2>
              </div>
              <button onClick={resetTrip} className="text-xs text-error hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">delete_forever</span>
                <span>Reset Current Trip</span>
              </button>
            </div>

            {/* Deck & Chat panels grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Swipe Deck */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                
                {/* Filters selection */}
                <div className="glass-card rounded-xl border border-glass-stroke p-4 flex justify-between items-center gap-4">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Specialty Filter</span>
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
                  </select>
                </div>

                {/* Stack box */}
                <div className="h-[460px] relative w-full select-none">
                  {currentIndex >= currentCompanions.length ? (
                    <div className="glass-card rounded-2xl border border-glass-stroke p-8 flex flex-col items-center justify-center h-full text-center gap-3">
                      <span className="material-symbols-outlined text-teal-trust !text-5xl animate-pulse">check_circle</span>
                      <div>
                        <h4 className="font-bold text-on-surface">End of Stack Reached</h4>
                        <p className="text-xs text-on-surface-variant max-w-xs mt-1">Adjust specialty filters or expand trip duration options to verify new traveler matching nodes.</p>
                      </div>
                    </div>
                  ) : (
                    /* Swipe card stack */
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
                          {/* LIKE/NOPE labels */}
                          {isTopCard && dragOffset > 30 && (
                            <div className="stamp stamp-like" style={{ opacity: Math.min(dragOffset / 100, 1) }}>LIKE</div>
                          )}
                          {isTopCard && dragOffset < -30 && (
                            <div className="stamp stamp-nope" style={{ opacity: Math.min(Math.abs(dragOffset) / 100, 1) }}>NOPE</div>
                          )}

                          <div className="space-y-4">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                <img src={comp.image} alt={comp.name} className="w-14 h-14 rounded-full object-cover border border-glass-stroke" />
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

                {/* Left/Right CTA Swipe buttons */}
                {currentIndex < currentCompanions.length && (
                  <div className="flex justify-center items-center gap-6 mt-4">
                    <button
                      onClick={() => triggerSwipeAction(false)}
                      className="w-14 h-14 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-500 rounded-full flex items-center justify-center transition-all shadow-md active:scale-90"
                    >
                      <span className="material-symbols-outlined !text-2xl font-bold">close</span>
                    </button>
                    <button
                      onClick={() => triggerSwipeAction(true)}
                      className="w-14 h-14 bg-teal-trust/10 border border-teal-trust/30 hover:bg-teal-trust/20 text-teal-trust rounded-full flex items-center justify-center transition-all shadow-md active:scale-90"
                    >
                      <span className="material-symbols-outlined !text-2xl font-bold">favorite</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Chat Messenger Column */}
              <div className="lg:col-span-5 flex flex-col h-[600px] glass-card rounded-2xl border border-glass-stroke overflow-hidden shadow-2xl">
                {chatUser ? (
                  <>
                    {/* Active messenger header */}
                    <div className="bg-surface-container-low border-b border-glass-stroke p-4 flex items-center gap-3">
                      <div className="relative">
                        <img src={chatUser.image} alt={chatUser.name} className="w-10 h-10 rounded-full object-cover border border-glass-stroke" />
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

                    {/* Messages feed */}
                    <div className="flex-grow p-4 overflow-y-auto space-y-4 no-scrollbar bg-deep-navy-bg/30">
                      {chatMessages.map((msg, idx) => {
                        if (msg.sender === "system") {
                          return (
                            <div key={idx} className="flex items-start gap-2.5">
                              <div className="bg-glass-fill border border-glass-stroke px-4 py-2.5 rounded-2xl max-w-[80%] text-xs text-on-surface-variant mx-auto text-center font-mono">
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
                              className={`px-4 py-2.5 rounded-2xl max-w-[70%] text-xs text-on-surface ${
                                isMe
                                  ? "bg-primary/20 border border-primary/45 text-right"
                                  : "bg-glass-fill border border-glass-stroke"
                              }`}
                            >
                              {msg.text}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Chat Text Form */}
                    <form onSubmit={handleSendMessage} className="bg-surface-container-low border-t border-glass-stroke p-3 flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className="bg-surface-container-lowest border border-glass-stroke text-on-surface text-sm rounded-lg p-2.5 w-full focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                        placeholder={`Send message to ${chatUser.name}...`}
                      />
                      <button type="submit" className="bg-primary text-on-primary px-4 rounded-lg hover:scale-95 active:scale-95 transition-all flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-sm">send</span>
                      </button>
                    </form>
                  </>
                ) : (
                  /* Initial chat idle panel */
                  <div className="flex-grow flex flex-col items-center justify-center p-8 text-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant/20 !text-6xl animate-pulse">forum</span>
                    <h4 className="font-bold text-sm text-on-surface">Messenger Locked</h4>
                    <p className="text-xs text-on-surface-variant max-w-xs mt-0.5">Swipe RIGHT on companion stack cards to unlock matching chats and coordinate trips.</p>
                  </div>
                )}
              </div>

            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
