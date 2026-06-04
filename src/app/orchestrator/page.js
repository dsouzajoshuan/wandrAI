"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState, useRef } from "react";
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

  useEffect(() => {
    const active = localStorage.getItem("wandr_planned_destination") || "Tokyo Fallback";
    const mappedKey = TRIP_DATA[active] ? active : "Tokyo Fallback";
    setDestination(mappedKey);

    const activeTripInfo = TRIP_DATA[mappedKey];
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

  const handleSendMessage = (text = inputValue) => {
    const messageContent = typeof text === "string" ? text.trim() : inputValue.trim();
    if (!messageContent) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: messageContent,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMessage]);
    if (typeof text !== "string" || text === inputValue) {
      setInputValue("");
    }
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let aiResponseText = `I have received your request regarding "${messageContent}". I am actively syncing coordinates with regional coordinators.`;
      
      const query = messageContent.toLowerCase();
      if (query.includes("weather") || query.includes("temperature")) {
        aiResponseText = `Current local weather at your destination looks excellent. It is estimated to range between 18°C and 23°C with clear skies.`;
      } else if (query.includes("diet") || query.includes("food") || query.includes("preference")) {
        aiResponseText = `Understood. Your special culinary profile and dietary requirements have been successfully registered with our local gourmet partners.`;
      } else if (query.includes("transport") || query.includes("driver") || query.includes("taxi")) {
        aiResponseText = `All airport and inner-city private driver arrangements are verified. The vehicle will stand by at your lobby exactly 15 minutes before the departure window.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: aiResponseText,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }, 1500);
  };

  const handleSuggestionClick = (query) => {
    handleSendMessage(query);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmergencySOS = () => {
    router.push("/safety");
  };

  const activeTrip = TRIP_DATA[destination];

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
          <div className="absolute inset-0 bg-[#0b0e14]">
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(activeTrip.location)}&t=&z=12&ie=UTF8&iwloc=&output=embed`}
              className="w-full h-full border-none opacity-80"
              style={{ filter: "invert(90%) hue-rotate(180deg) contrast(110%) saturate(70%)" }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>

          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-85" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 600">
            <path d="M150,480 Q320,420 420,220 T720,120" fill="none" stroke="url(#lineGradient)" strokeDasharray="6,4" strokeWidth="3"></path>
            <defs>
              <linearGradient id="lineGradient" x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset="0%" style={{ stopColor: "#00C9A7", stopOpacity: 1 }}></stop>
                <stop offset="100%" style={{ stopColor: "#f5a623", stopOpacity: 1 }}></stop>
              </linearGradient>
            </defs>
          </svg>

          {activeTrip.markers.map((marker) => (
            <div
              key={marker.id}
              className="absolute z-10"
              style={{
                top: marker.top,
                left: marker.left ? marker.left : undefined,
                right: marker.right ? marker.right : undefined
              }}
            >
              <div className="group/card flex items-center gap-3 bg-black/50 backdrop-blur-md border border-glass-stroke py-2 px-4 rounded-full hover:bg-black/70 transition-all duration-300 cursor-pointer">
                <span className={`w-6 h-6 ${marker.color} rounded-full flex items-center justify-center text-[10px] font-bold text-on-secondary-fixed shadow-lg`}>
                  {marker.id}
                </span>
                <div>
                  <h3 className="font-title-lg text-sm text-on-surface leading-none">{marker.name}</h3>
                  <p className="text-[10px] text-on-surface-variant/80 mt-1 uppercase tracking-wider">{marker.time} • {marker.type}</p>
                </div>
              </div>
            </div>
          ))}

          <div className="absolute bottom-10 left-10 flex flex-col gap-4">
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
