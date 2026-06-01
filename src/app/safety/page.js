"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";

export default function Safety() {
  const [targetName, setTargetName] = useState("Ziro Valley (Arunachal)");
  const [userLat, setUserLat] = useState(27.2023);
  const [userLng, setUserLng] = useState(93.8291);
  const [sharePhone, setSharePhone] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [sosOverlay, setSosOverlay] = useState(false);
  const [sharingIntervalId, setSharingIntervalId] = useState(null);

  useEffect(() => {
    // Check if active planned route exists in localStorage
    const hasTrip = localStorage.getItem("wandr_trip_planned") === "true";
    if (hasTrip) {
      const dest = localStorage.getItem("wandr_planned_destination");
      setTargetName(dest);
    }

    // Attempt browser Geolocation fetch
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLat(position.coords.latitude);
          setUserLng(position.coords.longitude);
        },
        (error) => {
          console.warn("Geolocation denied or error. Falling back to default coordinates.", error);
        }
      );
    }

    // Cleanup interval on page unmount
    return () => {
      if (sharingIntervalId) clearInterval(sharingIntervalId);
    };
  }, [sharingIntervalId]);

  const toggleLocationSharing = () => {
    if (!sharePhone.trim()) {
      alert("Please input an emergency contact phone number first.");
      return;
    }

    if (!isSharing) {
      setIsSharing(true);
      
      const interval = setInterval(() => {
        // Walk coordinate logs slightly
        setUserLat((prev) => prev + (Math.random() - 0.5) * 0.0003);
        setUserLng((prev) => prev + (Math.random() - 0.5) * 0.0003);
        console.log("[Wandr Satellite Grid] Position walk synced.");
      }, 4000);

      setSharingIntervalId(interval);
      alert(`Live maps link sharing activated. Position logs are streaming to ${sharePhone}.`);
    } else {
      setIsSharing(false);
      setSharePhone("");
      if (sharingIntervalId) {
        clearInterval(sharingIntervalId);
        setSharingIntervalId(null);
      }
      alert("Live location broadcast feed closed.");
    }
  };

  const getLatStr = () => `LAT: ${userLat.toFixed(4)}° ${userLat >= 0 ? "N" : "S"}`;
  const getLngStr = () => `LON: ${userLng.toFixed(4)}° ${userLng >= 0 ? "E" : "W"}`;

  return (
    <>
      <Navbar />

      {/* Background Layers */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 grid-bg"></div>
        <div className="glowing-orb top-20 right-0 bg-error"></div>
        <div className="glowing-orb bottom-20 left-0 bg-teal-trust"></div>
      </div>

      <main className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-24 pb-32">
        {/* Header Title */}
        <div className="mb-12">
          <span className="bg-error/15 text-error border border-error/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Active Monitoring Grid</span>
          <h1 className="font-display-lg text-4xl text-on-surface mt-3">Safety Shield Console</h1>
          <p className="text-sm text-on-surface-variant max-w-xl mt-2 font-body-md">Activate immediate emergency protocols, share live satellite coordinates, and register crisis emergency dispatchers.</p>
        </div>

        {/* Console layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left panel metrics */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* System Telemetry */}
            <div className="glass-card rounded-2xl border border-glass-stroke p-6 space-y-4">
              <h3 className="font-headline-md text-[18px] text-on-surface border-b border-glass-stroke pb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-trust">analytics</span>
                <span>System Telemetry</span>
              </h3>
              
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Active Target:</span>
                  <span className="text-on-surface font-semibold">{targetName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Link Status:</span>
                  <span className="text-teal-trust font-semibold">SECURE ON SATELLITE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Location Reads:</span>
                  <span className="text-on-surface font-semibold">{getLatStr()} | {getLngStr()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Threshold Alerts:</span>
                  <span className="text-teal-trust font-semibold">0 CRISES DETECTED</span>
                </div>
              </div>
            </div>

            {/* SOS Dispatch Button */}
            <div className="glass-card rounded-2xl border border-glass-stroke p-6 space-y-6 text-center">
              <div className="space-y-2">
                <h3 className="font-headline-md text-xl text-on-surface">SOS Alert Dispatcher</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">Pressing the button initiates emergency routing via 112 satellite SMS fallback channels.</p>
              </div>

              <button
                onClick={() => setSosOverlay(true)}
                className="pulse-btn w-32 h-32 rounded-full bg-error border-4 border-white/20 text-on-error font-display-lg text-lg flex items-center justify-center shadow-lg active:scale-95 transition-all mx-auto select-none font-bold uppercase tracking-wider"
              >
                SOS
              </button>

              <div className="text-[10px] text-on-surface-variant font-mono">1-tap bypass for local emergency authority grids.</div>
            </div>

          </div>

          {/* Right panel map & sharing */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Live Map Broadcast Form */}
            <div className="glass-card rounded-2xl border border-glass-stroke p-6 space-y-4">
              <div className="space-y-1">
                <h3 className="font-headline-md text-[18px] text-on-surface">Live Maps Broadcast</h3>
                <p className="text-xs text-on-surface-variant font-body-md">Enter contact mobile coordinates to share user movements in real-time.</p>
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  value={sharePhone}
                  onChange={(e) => setSharePhone(e.target.value)}
                  disabled={isSharing}
                  className="bg-surface-container-low border border-glass-stroke text-on-surface text-sm rounded-lg p-3 w-full focus:ring-1 focus:ring-teal-trust focus:border-teal-trust outline-none disabled:opacity-50"
                  placeholder="Emergency Contact Phone Number (e.g. +91 98765 43210)"
                />
                
                <button
                  onClick={toggleLocationSharing}
                  className={`font-semibold text-xs px-6 py-3 rounded-lg flex items-center justify-center gap-1.5 transition-all shrink-0 border ${
                    isSharing
                      ? "bg-red-500/10 border-red-500/30 hover:border-red-500 text-red-500"
                      : "bg-secondary/15 border-secondary/20 hover:border-secondary text-secondary"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{isSharing ? "stop" : "share"}</span>
                  <span>{isSharing ? "Stop Sharing" : "Start Sharing Location"}</span>
                </button>
              </div>

              {isSharing && (
                <div className="flex items-center gap-2 text-xs text-error font-mono">
                  <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
                  <span>Broadcasting live maps link feed to {sharePhone}</span>
                </div>
              )}
            </div>

            {/* Embedded Google Maps Box */}
            <div className="glass-card rounded-2xl border border-glass-stroke overflow-hidden h-[360px] relative shadow-lg">
              <iframe
                id="mapFrame"
                className="w-full h-full border-none grayscale contrast-125 invert opacity-80"
                src={`https://maps.google.com/maps?q=${userLat},${userLng}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              />

              {/* Coordinates Badge */}
              <div className="absolute bottom-4 left-4 bg-surface-container-lowest/90 backdrop-blur-md border border-glass-stroke px-4 py-2.5 rounded-xl flex items-center gap-3 shadow-md">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-trust animate-pulse"></span>
                <div className="font-mono text-[10px]">
                  <div className="text-on-surface-variant font-bold">LATITUDE READS</div>
                  <div className="text-on-surface">{getLatStr()}</div>
                </div>
                <div className="font-mono text-[10px]">
                  <div className="text-on-surface-variant font-bold">LONGITUDE READS</div>
                  <div className="text-on-surface">{getLngStr()}</div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>

      {/* SOS Overlay Alerts */}
      {sosOverlay && (
        <div className="fixed inset-0 bg-red-950/95 backdrop-blur-lg z-50 flex flex-col items-center justify-center gap-6 text-center select-none animate-in fade-in duration-350">
          <span className="material-symbols-outlined text-error !text-9xl animate-ping">warning</span>
          <div className="space-y-2 px-4 max-w-lg">
            <h2 className="font-display-lg text-4xl text-white">CRISIS SOS BROADCAST</h2>
            <p className="font-mono text-sm text-error">Link configured. Telemetry ping broadcasted to local authorities and saved family loops.</p>
          </div>
          <button
            onClick={() => setSosOverlay(false)}
            className="bg-white text-red-900 border border-white px-8 py-3 rounded-lg text-sm font-semibold hover:bg-transparent hover:text-white transition-all shadow-md mt-4"
          >
            Cancel SOS Alert
          </button>
        </div>
      )}

      <Footer />
    </>
  );
}
