"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";

export default function Safety() {
  const [userLat, setUserLat] = useState(27.2023);
  const [userLng, setUserLng] = useState(93.8291);
  const [timerSeconds, setTimerSeconds] = useState(7969); // 02:12:49
  const [isSosActive, setIsSosActive] = useState(false);
  
  // Contact States
  const [showContactModal, setShowContactModal] = useState(false);
  const [contacts, setContacts] = useState([
    { name: "Mom", phone: "+91 98765 43210" },
    { name: "Dad", phone: "+91 98765 43211" },
    { name: "Brother", phone: "+91 98765 43212" }
  ]);

  // Settings States
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settings, setSettings] = useState({
    syncRate: "2 minutes",
    checkinInterval: "2 hours",
    trackingMode: "Smart Sync",
    alertLocalAuthorities: true,
    smsFallback: true
  });

  useEffect(() => {
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

    // Load saved contacts from storage (Linked with Profile Page)
    const savedContacts = localStorage.getItem("wandr_emergency_contacts");
    if (savedContacts) {
      try {
        setContacts(JSON.parse(savedContacts));
      } catch (e) {
        console.warn("Failed to parse safety contacts.", e);
      }
    } else {
      // Set default contacts and save to local storage immediately
      const defaultContacts = [
        { name: "Mom", phone: "+91 98765 43210" },
        { name: "Dad", phone: "+91 98765 43211" },
        { name: "Brother", phone: "+91 98765 43212" }
      ];
      setContacts(defaultContacts);
      localStorage.setItem("wandr_emergency_contacts", JSON.stringify(defaultContacts));
    }

    // Load saved settings from storage
    const savedSettings = localStorage.getItem("wandr_safety_settings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.warn("Failed to parse safety settings.", e);
      }
    }
  }, []);

  // Timer Countdown Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600).toString().padStart(2, "0");
    const mins = Math.floor((totalSecs % 3600) / 60).toString().padStart(2, "0");
    const secs = (totalSecs % 60).toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const handleSosTrigger = () => {
    const confirmSOS = confirm('Activate SOS Emergency Services? Your contacts and local emergency responders will be alerted immediately.');
    if (confirmSOS) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setUserLat(lat);
            setUserLng(lng);
            setIsSosActive(true);
            alert(`SOS ACTIVATED. Dispatching location to emergency services. Please remain where you are if safe.\n\nCoordinates sent:\nLAT: ${lat.toFixed(4)}°\nLON: ${lng.toFixed(4)}°`);
          },
          (error) => {
            console.warn("Geolocation failed during SOS.", error);
            setIsSosActive(true);
            alert(`SOS ACTIVATED. Dispatching location to emergency services. Please remain where you are if safe.\n\n(Fallback coordinates: LAT: ${userLat.toFixed(4)}°, LON: ${userLng.toFixed(4)}°)`);
          }
        );
      } else {
        setIsSosActive(true);
        alert(`SOS ACTIVATED. Dispatching location to emergency services. Please remain where you are if safe.\n\n(Fallback coordinates: LAT: ${userLat.toFixed(4)}°, LON: ${userLng.toFixed(4)}°)`);
      }
    }
  };

  const saveContacts = (updatedContacts) => {
    setContacts(updatedContacts);
    localStorage.setItem("wandr_emergency_contacts", JSON.stringify(updatedContacts));
  };

  const saveSettings = (updatedSettings) => {
    setSettings(updatedSettings);
    localStorage.setItem("wandr_safety_settings", JSON.stringify(updatedSettings));
  };

  return (
    <>
      <Navbar />

      {/* Global Background Layers to strictly match other pages */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 grid-bg"></div>
        <div className="glowing-orb top-20 right-0 bg-primary"></div>
        <div className="glowing-orb bottom-20 left-0 bg-teal-trust"></div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .material-symbols-outlined {
          font-variation-settings: "FILL" 0, "wght" 300, "GRAD" 0, "opsz" 24
        }
        .sos-pulse::before, .sos-pulse::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2px solid #E63946;
          animation: pulse-ring 3s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
          opacity: 0
        }
        .sos-pulse::after {
          animation-delay: 1.5s
        }
        @keyframes pulse-ring {
          0% {
            transform: translate(-50%, -50%) scale(0.9);
            opacity: 0;
          } 50% {
            opacity: 0.4;
          } 100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
      `}} />

      <main className="relative z-10 min-h-screen flex flex-col justify-center items-center pt-24 pb-20">
        <div className="max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          {/* Left Side: Emergency Interface */}
          <div className="flex flex-col items-center lg:items-start space-y-16 order-2 lg:order-1">
            
            {/* Primary SOS Focal Point */}
            <div className="relative flex items-center justify-center">
              <div className={`sos-pulse absolute w-72 h-72 ${isSosActive ? 'animate-ping' : ''}`}></div>
              <button 
                onClick={handleSosTrigger}
                className="relative z-10 w-56 h-56 rounded-full bg-error flex items-center justify-center shadow-[0_0_60px_rgba(230,57,70,0.5)] hover:shadow-[0_0_80px_rgba(230,57,70,0.6)] active:scale-95 transition-all duration-300 group" 
                id="sos-trigger"
              >
                <span className="font-display-lg text-[64px] text-white tracking-widest font-bold group-hover:scale-105 transition-transform">
                  SOS
                </span>
              </button>
            </div>

            {/* Essential Status Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl">
              
              {/* Live Status */}
              <div className={`glass-card p-6 rounded-xl flex items-center gap-5 transition-all duration-300 ${isSosActive ? 'border-error bg-error-container/10' : ''}`}>
                <div className="relative">
                  <div className={`w-3 h-3 rounded-full ${isSosActive ? 'bg-error shadow-[0_0_12px_rgba(230,57,70,0.8)]' : 'bg-teal-trust shadow-[0_0_12px_rgba(0,201,167,0.8)]'}`}></div>
                  <div className={`absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-40 ${isSosActive ? 'bg-error' : 'bg-teal-trust'}`}></div>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest mb-1">Protection Status</span>
                  <span className={`text-title-lg font-bold ${isSosActive ? 'text-error animate-pulse' : 'text-on-surface'}`}>
                    {isSosActive ? 'SOS ACTIVE' : 'Monitoring Active'}
                  </span>
                </div>
              </div>

              {/* Satellite Connectivity */}
              <div className="glass-card p-6 rounded-xl flex items-center gap-5">
                <span className={`material-symbols-outlined text-[24px] ${isSosActive ? 'text-error animate-pulse' : 'text-primary'}`}>satellite_alt</span>
                <div className="flex flex-col text-left">
                  <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest mb-1">Signal Link</span>
                  <span className="text-title-lg font-bold text-on-surface">
                    {isSosActive ? 'SOS Link Live' : 'Secured via Satellite'}
                  </span>
                </div>
              </div>

              {/* Active Contacts */}
              <div className="glass-card p-6 rounded-xl flex items-center gap-5">
                <span className={`material-symbols-outlined text-[24px] ${isSosActive ? 'text-error' : 'text-secondary'}`}>group</span>
                <div className="flex flex-col text-left">
                  <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest mb-1">Safety Circle</span>
                  <span className="text-title-lg font-bold text-on-surface">
                    {isSosActive ? 'Contacts Notified' : `${contacts.length} Contact${contacts.length !== 1 ? 's' : ''} Notified`}
                  </span>
                </div>
              </div>

              {/* Check-in Timer */}
              <div className="glass-card p-6 rounded-xl flex items-center gap-5">
                <span className="material-symbols-outlined text-primary text-[24px]">timer</span>
                <div className="flex flex-col text-left">
                  <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest mb-1">Next Check-in</span>
                  <span className="text-title-lg font-bold text-on-surface" id="timer">
                    {formatTime(timerSeconds)}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Right Side: Content & Controls */}
          <div className="flex flex-col space-y-10 order-1 lg:order-2 text-center lg:text-left">
            <div className="space-y-4">
              <h1 className="text-on-surface-variant max-w-lg text-title-lg leading-relaxed font-light mx-auto lg:mx-0">
                A dedicated security console designed to keep you connected and protected, no matter how far you wander.
              </h1>
            </div>
            
            <div className="space-y-6 pt-4">
              <div className="flex flex-wrap justify-center lg:justify-start gap-x-12 gap-y-6">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary font-light">location_on</span>
                  <span className="font-body-md text-on-surface">Live Location Sharing</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary font-light">call</span>
                  <span className="font-body-md text-on-surface">Emergency Auto-dial</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary font-light">verified_user</span>
                  <span className="font-body-md text-on-surface">Verified Safe Zones</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
              <button 
                onClick={() => setShowContactModal(true)}
                className="bg-primary text-on-primary-fixed px-10 py-5 rounded-lg font-bold uppercase tracking-[0.15em] text-label-sm hover:bg-primary-container transition-all shadow-[0_4px_20px_rgba(245,166,35,0.2)]"
              >
                Manage Safety Circles
              </button>
              <button 
                onClick={() => setShowSettingsModal(true)}
                className="border border-glass-stroke text-on-surface px-10 py-5 rounded-lg font-bold uppercase tracking-[0.15em] text-label-sm hover:bg-glass-fill transition-all"
              >
                Security Settings
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* SOS Active Overlay */}
      {isSosActive && (
        <div className="fixed inset-0 bg-red-950/95 backdrop-blur-lg z-50 flex flex-col items-center justify-center gap-6 text-center select-none animate-in fade-in duration-350">
          <span className="material-symbols-outlined text-error !text-9xl animate-ping">warning</span>
          <div className="space-y-2 px-4 max-w-lg">
            <h2 className="font-display-lg text-4xl text-white">CRISIS SOS BROADCAST</h2>
            <p className="font-mono text-sm text-error">Link configured. Telemetry ping broadcasted to local authorities and saved family loops.</p>
            <p className="font-mono text-xs text-white bg-red-900/50 border border-red-500/30 px-3 py-2 rounded mt-2">
              CURRENT COORDINATES: LAT {userLat.toFixed(4)}° | LON {userLng.toFixed(4)}°
            </p>
          </div>
          <button
            onClick={() => setIsSosActive(false)}
            className="bg-white text-red-900 border border-white px-8 py-3 rounded-lg text-sm font-semibold hover:bg-transparent hover:text-white transition-all shadow-md mt-4"
          >
            Cancel SOS Alert
          </button>
        </div>
      )}

      {/* Safety Contacts Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md rounded-2xl border border-glass-stroke p-6 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-glass-stroke pb-3">
              <h3 className="font-headline-md text-xl text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">group</span>
                <span>Safety Circle Contacts</span>
              </h3>
              <button 
                onClick={() => {
                  const saved = localStorage.getItem("wandr_emergency_contacts");
                  if (saved) {
                    setContacts(JSON.parse(saved));
                  }
                  setShowContactModal(false);
                }}
                className="text-on-surface-variant hover:text-on-surface p-1 hover:bg-glass-fill rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4 max-h-60 overflow-y-auto no-scrollbar pr-1">
              {contacts.map((contact, index) => (
                <div key={index} className="flex gap-2 items-center bg-surface-container-low/40 p-3 rounded-lg border border-glass-stroke">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Contact Name"
                      value={contact.name}
                      onChange={(e) => {
                        const next = [...contacts];
                        next[index].name = e.target.value;
                        setContacts(next);
                      }}
                      className="bg-surface-container-lowest border border-glass-stroke text-on-surface text-xs rounded p-2 focus:ring-1 focus:ring-primary outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Phone Number"
                      value={contact.phone}
                      onChange={(e) => {
                        const next = [...contacts];
                        next[index].phone = e.target.value;
                        setContacts(next);
                      }}
                      className="bg-surface-container-lowest border border-glass-stroke text-on-surface text-xs rounded p-2 focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const next = contacts.filter((_, i) => i !== index);
                      setContacts(next);
                    }}
                    className="text-red-400 hover:bg-red-500/10 p-1.5 rounded transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              ))}

              {contacts.length === 0 && (
                <p className="text-xs text-on-surface-variant text-center py-4">No contacts added. Add family or friends to notify them.</p>
              )}
            </div>

            <div className="flex gap-3 justify-between items-center pt-2">
              <button
                onClick={() => {
                  setContacts([...contacts, { name: "", phone: "" }]);
                }}
                className="flex items-center gap-1.5 border border-primary/30 text-primary hover:bg-primary/10 px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors"
              >
                <span className="material-symbols-outlined text-sm">person_add</span>
                <span>Add Contact</span>
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const saved = localStorage.getItem("wandr_emergency_contacts");
                    if (saved) {
                      setContacts(JSON.parse(saved));
                    } else {
                      setContacts([
                        { name: "Mom", phone: "+91 98765 43210" },
                        { name: "Dad", phone: "+91 98765 43211" },
                        { name: "Brother", phone: "+91 98765 43212" }
                      ]);
                    }
                    setShowContactModal(false);
                  }}
                  className="border border-glass-stroke text-on-surface-variant hover:bg-glass-fill px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const clean = contacts.filter(c => c.name.trim() !== "" && c.phone.trim() !== "");
                    saveContacts(clean);
                    setShowContactModal(false);
                    alert("Safety Circle contacts updated successfully!");
                  }}
                  className="bg-primary text-on-primary-fixed hover:bg-primary-container px-5 py-2.5 rounded-lg text-xs font-semibold transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md rounded-2xl border border-glass-stroke p-6 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-glass-stroke pb-3">
              <h3 className="font-headline-md text-xl text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">settings</span>
                <span>Security Settings</span>
              </h3>
              <button 
                onClick={() => {
                  const saved = localStorage.getItem("wandr_safety_settings");
                  if (saved) {
                    setSettings(JSON.parse(saved));
                  }
                  setShowSettingsModal(false);
                }}
                className="text-on-surface-variant hover:text-on-surface p-1 hover:bg-glass-fill rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Tracking Mode */}
              <div className="flex flex-col gap-1.5">
                <label className="text-on-surface-variant font-semibold uppercase tracking-wider font-mono text-left">Tracking Mode</label>
                <select
                  value={settings.trackingMode}
                  onChange={(e) => setSettings({ ...settings, trackingMode: e.target.value })}
                  className="bg-surface-container-low border border-glass-stroke text-on-surface p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-primary text-left"
                >
                  <option value="Continuous Track">Continuous Track (High Battery)</option>
                  <option value="Smart Sync">Smart Sync (Recommended)</option>
                  <option value="Panic Mode">Panic Mode (Maximum Telemetry)</option>
                </select>
              </div>

              {/* Sync Interval */}
              <div className="flex flex-col gap-1.5">
                <label className="text-on-surface-variant font-semibold uppercase tracking-wider font-mono text-left">Satellite Sync Interval</label>
                <select
                  value={settings.syncRate}
                  onChange={(e) => setSettings({ ...settings, syncRate: e.target.value })}
                  className="bg-surface-container-low border border-glass-stroke text-on-surface p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-primary text-left"
                >
                  <option value="30 seconds">30 Seconds</option>
                  <option value="2 minutes">2 Minutes</option>
                  <option value="5 minutes">5 Minutes</option>
                  <option value="10 minutes">10 Minutes</option>
                </select>
              </div>

              {/* Check-in Interval */}
              <div className="flex flex-col gap-1.5">
                <label className="text-on-surface-variant font-semibold uppercase tracking-wider font-mono text-left">Automatic Check-in Timer</label>
                <select
                  value={settings.checkinInterval}
                  onChange={(e) => setSettings({ ...settings, checkinInterval: e.target.value })}
                  className="bg-surface-container-low border border-glass-stroke text-on-surface p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-primary text-left"
                >
                  <option value="1 hour">Every 1 Hour</option>
                  <option value="2 hours">Every 2 Hours</option>
                  <option value="4 hours">Every 4 Hours</option>
                  <option value="8 hours">Every 8 Hours</option>
                </select>
              </div>

              {/* Toggle Switches */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between bg-surface-container-low/40 p-3 rounded-lg border border-glass-stroke">
                  <div className="flex flex-col text-left">
                    <span className="font-semibold text-on-surface">Alert Local Authorities</span>
                    <span className="text-[10px] text-on-surface-variant">Notify nearby rescue stations on SOS triggers</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.alertLocalAuthorities}
                    onChange={(e) => setSettings({ ...settings, alertLocalAuthorities: e.target.checked })}
                    className="w-4 h-4 bg-surface-container-lowest rounded border-glass-stroke text-primary focus:ring-0 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between bg-surface-container-low/40 p-3 rounded-lg border border-glass-stroke">
                  <div className="flex flex-col text-left">
                    <span className="font-semibold text-on-surface">SMS Satellite Fallback</span>
                    <span className="text-[10px] text-on-surface-variant">Send low-bandwidth SMS updates if internet drops</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.smsFallback}
                    onChange={(e) => setSettings({ ...settings, smsFallback: e.target.checked })}
                    className="w-4 h-4 bg-surface-container-lowest rounded border-glass-stroke text-primary focus:ring-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-glass-stroke pt-4">
              <button
                onClick={() => {
                  const saved = localStorage.getItem("wandr_safety_settings");
                  if (saved) {
                    setSettings(JSON.parse(saved));
                  } else {
                    setSettings({
                      syncRate: "2 minutes",
                      checkinInterval: "2 hours",
                      trackingMode: "Smart Sync",
                      alertLocalAuthorities: true,
                      smsFallback: true
                    });
                  }
                  setShowSettingsModal(false);
                }}
                className="border border-glass-stroke text-on-surface-variant hover:bg-glass-fill px-4 py-2.5 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  saveSettings(settings);
                  setShowSettingsModal(false);
                  alert("Security settings saved successfully!");
                }}
                className="bg-primary text-on-primary-fixed hover:bg-primary-container px-5 py-2.5 rounded-lg font-semibold transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
