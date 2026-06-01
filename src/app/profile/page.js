"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Profile() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("Joshua D'Souza");
  const [userEmail, setUserEmail] = useState("dsouzajoshuan@gmail.com");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [activeTrip, setActiveTrip] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");

  useEffect(() => {
    verifyAuth();
  }, []);

  const verifyAuth = () => {
    const loggedIn = localStorage.getItem("wandr_logged_in") === "true";
    if (loggedIn) {
      setIsLoggedIn(true);
      setUserName(localStorage.getItem("wandr_username") || "Joshua D'Souza");
      setUserEmail(localStorage.getItem("wandr_useremail") || "dsouzajoshuan@gmail.com");

      // Load active trip
      const hasTrip = localStorage.getItem("wandr_trip_planned") === "true";
      if (hasTrip) {
        setActiveTrip({
          dest: localStorage.getItem("wandr_planned_destination") || "Ziro Valley Cultural Expedition",
          days: localStorage.getItem("wandr_planned_days") || "3",
          budget: localStorage.getItem("wandr_planned_budget") || "Explorer"
        });
      } else {
        setActiveTrip(null);
      }

      // Load contacts
      const savedContacts = JSON.parse(localStorage.getItem("wandr_emergency_contacts") || "[]");
      setContacts(savedContacts);
    } else {
      setIsLoggedIn(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem("wandr_username", "Joshua D'Souza");
    localStorage.setItem("wandr_useremail", loginEmail || "dsouzajoshuan@gmail.com");
    localStorage.setItem("wandr_userphone", "+91 98765 43210");
    localStorage.setItem("wandr_logged_in", "true");
    verifyAuth();
  };

  const handleLogout = () => {
    localStorage.removeItem("wandr_logged_in");
    verifyAuth();
  };

  const handleAddContact = (e) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    const list = [...contacts, { name: newContactName, phone: newContactPhone }];
    localStorage.setItem("wandr_emergency_contacts", JSON.stringify(list));
    setContacts(list);
    
    setNewContactName("");
    setNewContactPhone("");
  };

  const handleRemoveContact = (idx) => {
    const list = contacts.filter((_, index) => index !== idx);
    localStorage.setItem("wandr_emergency_contacts", JSON.stringify(list));
    setContacts(list);
  };

  return (
    <>
      <Navbar />

      {/* Background Layers */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 grid-bg"></div>
        <div className="glowing-orb top-20 right-0 bg-primary"></div>
        <div className="glowing-orb bottom-20 left-0 bg-teal-trust"></div>
      </div>

      <main className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-24 pb-32 flex justify-center w-full">
        {!isLoggedIn ? (
          /* Login Card Form */
          <section className="w-full max-w-md space-y-6">
            <div className="glass-card rounded-2xl border border-glass-stroke p-8 shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 bg-primary/5 w-40 h-40 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="text-center space-y-2">
                <h2 className="font-headline-md text-2xl text-on-surface">Sign In to Dashboard</h2>
                <p className="text-xs text-on-surface-variant leading-relaxed">Enter traveler account details to access your verified profile dashboard.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="logEmail" className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    id="logEmail"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="bg-surface-container-low border border-glass-stroke text-on-surface text-sm rounded-lg p-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                    placeholder="concierge@wandr.ai"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="logPass" className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Password</label>
                  <input
                    type="password"
                    id="logPass"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="bg-surface-container-low border border-glass-stroke text-on-surface text-sm rounded-lg p-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                    placeholder="Password"
                  />
                </div>

                <button type="submit" className="w-full bg-primary-container text-on-primary-container py-3.5 rounded-lg text-sm font-semibold hover:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md">
                  <span className="material-symbols-outlined text-sm">vpn_key</span>
                  <span>Sign In</span>
                </button>
              </form>

              <div className="text-center text-xs text-on-surface-variant border-t border-glass-stroke pt-4">
                <span>Don't have an account? </span>
                <Link href="/signup" className="text-primary hover:underline font-semibold">Sign Up</Link>
              </div>
            </div>
          </section>
        ) : (
          /* Profile Workspace Panel */
          <section className="w-full space-y-8 animate-in fade-in duration-350">
            {/* Traveler detail card header */}
            <div className="glass-card rounded-2xl border border-glass-stroke p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl relative overflow-hidden w-full">
              <div className="absolute -top-12 -left-12 bg-primary/5 w-60 h-60 rounded-full blur-3xl pointer-events-none"></div>
              <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                <div className="relative">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop" className="w-24 h-24 rounded-full object-cover border-2 border-primary shadow-md"/>
                  <span className="absolute bottom-1 right-1 w-5 h-5 bg-teal-trust border-2 border-surface-container rounded-full flex items-center justify-center text-[10px] text-white">✓</span>
                </div>
                <div className="text-center md:text-left space-y-1">
                  <h2 className="font-headline-md text-3xl text-on-surface">{userName}</h2>
                  <p className="text-xs text-on-surface-variant font-mono">{userEmail}</p>
                  <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                    <span className="bg-teal-trust/10 text-teal-trust border border-teal-trust/20 px-3 py-0.5 rounded-full text-[9px] font-mono tracking-wider">ID VETTED</span>
                    <span className="bg-secondary/10 text-secondary border border-secondary/20 px-3 py-0.5 rounded-full text-[9px] font-mono tracking-wider">VOICE CHECKED</span>
                  </div>
                </div>
              </div>
              
              <button onClick={handleLogout} className="border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-500 text-xs px-5 py-2.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm shrink-0">
                <span className="material-symbols-outlined text-xs">logout</span>
                <span>Sign Out</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Active Trip parameters */}
              <div className="lg:col-span-1 space-y-6">
                <div className="glass-card rounded-2xl border border-glass-stroke p-6 space-y-4">
                  <h3 className="font-headline-md text-lg text-on-surface border-b border-glass-stroke pb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">route</span>
                    <span>Active Trip Parameters</span>
                  </h3>
                  
                  <div className="space-y-4 font-body-md text-xs text-on-surface-variant">
                    {activeTrip ? (
                      <>
                        <div className="space-y-2">
                          <div className="text-sm font-semibold text-on-surface">{activeTrip.dest}</div>
                          <div className="space-y-1 text-on-surface-variant font-mono text-[11px]">
                            <div>DURATION: {activeTrip.days} Days</div>
                            <div>BUDGET COORDINATES: {activeTrip.budget}</div>
                            <div>STATUS: Compile Complete</div>
                          </div>
                        </div>
                        <Link href="/planner" className="inline-block bg-primary/10 border border-primary/20 hover:bg-primary hover:text-on-primary text-xs px-4 py-2 rounded-lg text-primary font-semibold transition-all">
                          Open Planner Output
                        </Link>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col items-center justify-center p-4 border border-dashed border-glass-stroke rounded-xl text-center gap-2">
                          <span className="material-symbols-outlined text-on-surface-variant/40">explore_off</span>
                          <div>
                            <div className="font-bold text-on-surface text-xs">No Active Trip Coordinates</div>
                            <p className="text-[10px] text-on-surface-variant mt-0.5">Use the AI Planner console to compile routes.</p>
                          </div>
                        </div>
                        <Link href="/planner" className="inline-block bg-primary-container text-on-primary-container text-xs px-4 py-2.5 rounded-lg font-semibold hover:scale-95 transition-all text-center w-full">
                          Open Trip Planner
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Family Emergency Contacts loop */}
              <div className="lg:col-span-2 space-y-6">
                <div className="glass-card rounded-2xl border border-glass-stroke p-6 space-y-6 shadow-xl">
                  <div className="space-y-1">
                    <h3 className="font-headline-md text-lg text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary">family_history</span>
                      <span>Emergency Contact Loop</span>
                    </h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">These contacts will receive immediate maps routing messages during SOS broadcasts.</p>
                  </div>

                  {/* Contact lists mapping */}
                  <div className="space-y-3">
                    {contacts.length === 0 ? (
                      <div className="border border-dashed border-glass-stroke rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 text-on-surface-variant">
                        <span className="material-symbols-outlined text-sm font-semibold">groups</span>
                        <span className="text-xs">No emergency loops configured.</span>
                      </div>
                    ) : (
                      contacts.map((contact, idx) => (
                        <div key={idx} className="bg-glass-fill border border-glass-stroke rounded-xl p-3 flex justify-between items-center gap-4">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-secondary">contact_phone</span>
                            <div>
                              <div className="font-bold text-xs text-on-surface font-title-lg">{contact.name}</div>
                              <div className="text-[10px] text-on-surface-variant font-mono mt-0.5">{contact.phone}</div>
                            </div>
                          </div>
                          <button onClick={() => handleRemoveContact(idx)} className="text-error hover:underline text-xs flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add contact trigger forms */}
                  <form onSubmit={handleAddContact} className="border-t border-glass-stroke pt-4 space-y-3">
                    <div className="bg-primary/5 text-primary border border-primary/20 px-2 py-0.5 rounded text-[8px] inline-block font-bold uppercase tracking-wider">Add Emergency Node</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        value={newContactName}
                        onChange={(e) => setNewContactName(e.target.value)}
                        className="bg-surface-container-low border border-glass-stroke text-xs text-on-surface rounded-lg p-2.5 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                        placeholder="Contact Name"
                      />
                      <input
                        type="tel"
                        required
                        value={newContactPhone}
                        onChange={(e) => setNewContactPhone(e.target.value)}
                        className="bg-surface-container-low border border-glass-stroke text-xs text-on-surface rounded-lg p-2.5 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                        placeholder="Phone Number"
                      />
                    </div>
                    <button type="submit" className="bg-secondary text-on-secondary px-5 py-2 rounded-lg font-label-sm text-xs hover:scale-95 active:scale-95 transition-all shadow-md flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">person_add</span>
                      <span>Register Contact</span>
                    </button>
                  </form>
                </div>
              </div>

            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
