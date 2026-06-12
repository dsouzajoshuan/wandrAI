"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Profile() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("Joshua D'Souza");
  const [userEmail, setUserEmail] = useState("dsouzajoshuan@gmail.com");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [activeTrip, setActiveTrip] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [safetySettings, setSafetySettings] = useState({
    syncRate: "2 minutes",
    checkinInterval: "2 hours",
    trackingMode: "Smart Sync",
    alertLocalAuthorities: true,
    smsFallback: true
  });
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");

  // Edit Profile States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [trustScore, setTrustScore] = useState(80);
  const [idVerified, setIdVerified] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    const supabase = createClient();
    verifyAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        verifyAuth();
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const verifyAuth = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const user = session.user;
        setIsLoggedIn(true);
        setUserEmail(user.email);

        // Load profile info from profiles table
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (profile) {
          setUserName(profile.full_name || user.user_metadata?.full_name || "Traveler");
          setTrustScore(profile.trust_score ?? 80);
          setIdVerified(profile.id_verified ?? false);
          setAvatarUrl(profile.avatar_url || user.user_metadata?.avatar_url || "");
        } else {
          setUserName(user.user_metadata?.full_name || "Traveler");
          setAvatarUrl(user.user_metadata?.avatar_url || "");
        }

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

        // Load safety settings
        const savedSettings = localStorage.getItem("wandr_safety_settings");
        if (savedSettings) {
          try {
            setSafetySettings(JSON.parse(savedSettings));
          } catch (e) {
            console.warn("Failed to parse safety settings.", e);
          }
        }
      } else {
        setIsLoggedIn(false);
      }
    } catch (err) {
      console.error("verifyAuth error:", err);
      setIsLoggedIn(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        alert("Login failed: " + error.message);
        return;
      }

      verifyAuth();
    } catch (err) {
      console.error("Login error:", err);
      alert("An unexpected error occurred during login.");
    }
  };

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setIsLoggedIn(false);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleOpenEditModal = () => {
    setEditName(userName);
    setEditEmail(userEmail);
    setShowEditModal(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim()) return;

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert("Session expired. Please log in again.");
        return;
      }

      // Update profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: editName,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update auth user email if changed
      if (editEmail !== user.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: editEmail
        });
        if (authError) {
          alert("Failed to update email in authentication: " + authError.message);
        } else {
          alert("Email update requested! Please check both your old and new inbox to confirm.");
        }
      }

      setUserName(editName);
      setUserEmail(editEmail);
      setShowEditModal(false);
      alert("Profile details updated successfully!");
    } catch (err) {
      console.error("Save profile error:", err);
      alert("Failed to save profile changes.");
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Session expired. Please log in again.");
        return;
      }

      // 1. Ensure bucket 'avatars' exists (attempt creation, ignore if already exists)
      await supabase.storage.createBucket("avatars", {
        public: true,
        fileSizeLimit: 2097152, // 2MB
      }).catch(() => {}); // ignore error if bucket already exists

      // 2. Upload file
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 3. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // 4. Update profile in profiles table
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      alert("Profile picture updated successfully!");
    } catch (err) {
      console.error("Avatar upload error:", err);
      alert("Failed to upload profile picture: " + err.message);
    }
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

                <button type="submit" className="w-full bg-primary-container text-on-primary-container py-3.5 rounded-lg text-sm font-semibold hover:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md border-none outline-none cursor-pointer">
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
                <div className="relative group/avatar cursor-pointer">
                  <img 
                    src={avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop"} 
                    className="w-24 h-24 rounded-full object-cover border-2 border-primary shadow-md"
                    alt="User Avatar"
                  />
                  <label htmlFor="avatar-file-input" className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer">
                    <span className="material-symbols-outlined text-white text-xl">photo_camera</span>
                  </label>
                  <input
                    type="file"
                    id="avatar-file-input"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <span className="absolute bottom-1 right-1 w-5 h-5 bg-teal-trust border-2 border-surface-container rounded-full flex items-center justify-center text-[10px] text-white">✓</span>
                </div>
                <div className="text-center md:text-left space-y-1">
                  <h2 className="font-headline-md text-3xl text-on-surface">{userName}</h2>
                  <p className="text-xs text-on-surface-variant font-mono">{userEmail}</p>
                  <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                    <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-0.5 rounded-full text-[9px] font-mono tracking-wider">TRUST SCORE: {trustScore}</span>
                    {idVerified ? (
                      <span className="bg-teal-trust/10 text-teal-trust border border-teal-trust/20 px-3 py-0.5 rounded-full text-[9px] font-mono tracking-wider">ID VETTED</span>
                    ) : (
                      <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-0.5 rounded-full text-[9px] font-mono tracking-wider">ID UNVERIFIED</span>
                    )}
                    <span className="bg-secondary/10 text-secondary border border-secondary/20 px-3 py-0.5 rounded-full text-[9px] font-mono tracking-wider">VOICE CHECKED</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 shrink-0 relative z-10">
                <button 
                  onClick={handleOpenEditModal}
                  className="border border-glass-stroke hover:bg-glass-fill text-on-surface text-xs px-5 py-2.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm shrink-0 bg-transparent outline-none cursor-pointer font-semibold"
                >
                  <span className="material-symbols-outlined text-xs">edit</span>
                  <span>Edit Profile</span>
                </button>
                <button 
                  onClick={handleLogout} 
                  className="border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-500 text-xs px-5 py-2.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm shrink-0 outline-none cursor-pointer font-semibold"
                >
                  <span className="material-symbols-outlined text-xs">logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
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

                {/* Active Safety Settings */}
                <div className="glass-card rounded-2xl border border-glass-stroke p-6 space-y-4">
                  <h3 className="font-headline-md text-lg text-on-surface border-b border-glass-stroke pb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-teal-trust">shield</span>
                    <span>Safety Sync Profile</span>
                  </h3>
                  
                  <div className="space-y-3 font-mono text-xs text-on-surface-variant">
                    <div className="flex justify-between">
                      <span>Tracking Mode:</span>
                      <span className="text-on-surface font-semibold">{safetySettings.trackingMode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sync Interval:</span>
                      <span className="text-on-surface font-semibold">{safetySettings.syncRate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Check-in Timer:</span>
                      <span className="text-on-surface font-semibold">{safetySettings.checkinInterval}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Authority Alert:</span>
                      <span className={safetySettings.alertLocalAuthorities ? "text-teal-trust font-semibold" : "text-red-400 font-semibold"}>
                        {safetySettings.alertLocalAuthorities ? "ENABLED" : "DISABLED"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>SMS Fallback:</span>
                      <span className={safetySettings.smsFallback ? "text-teal-trust font-semibold" : "text-red-400 font-semibold"}>
                        {safetySettings.smsFallback ? "ENABLED" : "DISABLED"}
                      </span>
                    </div>
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
                          <button onClick={() => handleRemoveContact(idx)} className="text-error hover:underline text-xs flex items-center gap-0.5 border-none bg-transparent outline-none cursor-pointer font-semibold">
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
                    <button type="submit" className="bg-secondary text-on-secondary px-5 py-2 rounded-lg font-label-sm text-xs hover:scale-95 active:scale-95 transition-all shadow-md flex items-center gap-1.5 border-none outline-none cursor-pointer font-semibold">
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

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md rounded-2xl border border-glass-stroke p-6 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-glass-stroke pb-3">
              <h3 className="font-headline-md text-xl text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">edit</span>
                <span>Edit Profile</span>
              </h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 hover:bg-glass-fill rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-on-surface-variant font-semibold uppercase tracking-wider font-mono text-left">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-surface-container-low border border-glass-stroke text-on-surface text-sm rounded-lg p-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  placeholder="Your Name"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-on-surface-variant font-semibold uppercase tracking-wider font-mono text-left">Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="bg-surface-container-low border border-glass-stroke text-on-surface text-sm rounded-lg p-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-glass-stroke pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="border border-glass-stroke text-on-surface-variant hover:bg-glass-fill px-4 py-2.5 rounded-lg font-semibold transition-colors text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-on-primary-fixed hover:bg-primary-container px-5 py-2.5 rounded-lg font-semibold transition-colors text-xs border-none outline-none cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
