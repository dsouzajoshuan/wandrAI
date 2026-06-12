"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);

  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    if (!consent) {
      alert("Please accept the safety guidelines and terms to register.");
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone: phone,
          },
        },
      });

      if (error) {
        alert("Registration failed: " + error.message);
        return;
      }

      alert("Account successfully configured! Redirecting to user profile dashboard.");
      router.push("/profile");
    } catch (err) {
      console.error("Signup error:", err);
      alert("An unexpected error occurred during signup.");
    }
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

      <main className="relative z-10 w-full max-w-md px-margin-mobile mx-auto pt-28 pb-32">
        <div className="glass-card rounded-2xl border border-glass-stroke p-8 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 bg-primary/5 w-40 h-40 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="text-center space-y-2">
            <h1 className="font-headline-md text-2xl text-on-surface">Join Wandr AI</h1>
            <p className="text-xs text-on-surface-variant leading-relaxed">Start planning journeys, discovery offline spots, and match with verified group travelers.</p>
          </div>

          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="regName" className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                id="regName"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-surface-container-low border border-glass-stroke text-on-surface text-sm rounded-lg p-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                placeholder="e.g. Joshua D'Souza"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="regEmail" className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                id="regEmail"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-surface-container-low border border-glass-stroke text-on-surface text-sm rounded-lg p-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                placeholder="e.g. joshua@wandr.ai"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="regPhone" className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Phone (ID Verification)</label>
              <input
                type="tel"
                id="regPhone"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-surface-container-low border border-glass-stroke text-on-surface text-sm rounded-lg p-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                placeholder="e.g. +91 98765 43210"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="regPass" className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Secure Password</label>
              <input
                type="password"
                id="regPass"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-surface-container-low border border-glass-stroke text-on-surface text-sm rounded-lg p-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                placeholder="Min. 8 characters"
              />
            </div>

            <div className="flex items-start gap-2.5 pt-2">
              <input
                type="checkbox"
                id="regTerms"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="rounded bg-surface-container-low border border-glass-stroke text-primary focus:ring-0 w-4 h-4 mt-0.5"
              />
              <label htmlFor="regTerms" className="text-[10px] text-on-surface-variant leading-relaxed">
                I consent to identity verification and agree to the WANDR AI group guidelines & safety protocols.
              </label>
            </div>

            <button type="submit" className="w-full bg-primary-container text-on-primary-container py-3.5 rounded-lg text-sm font-semibold hover:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md mt-4">
              <span className="material-symbols-outlined text-sm">assignment_ind</span>
              <span>Register Account</span>
            </button>
          </form>

          <div className="text-center text-xs text-on-surface-variant border-t border-glass-stroke pt-4">
            <span>Already have an account? </span>
            <Link href="/profile" className="text-primary hover:underline font-semibold">Log In</Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
