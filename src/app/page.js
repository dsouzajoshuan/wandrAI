"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";

export default function Home() {
  const [particles, setParticles] = useState([]);
  const orbsRef = useRef([]);

  useEffect(() => {
    // Generate particles for hero background
    const items = [];
    const count = 25;
    for (let i = 0; i < count; i++) {
      items.push({
        id: i,
        width: Math.random() * 3 + 1 + "px",
        height: Math.random() * 3 + 1 + "px",
        left: Math.random() * 100 + "vw",
        top: Math.random() * 100 + "vh",
        duration: Math.random() * 10 + 10 + "s",
        delay: Math.random() * 5 + "s",
        opacity: Math.random() * 0.4,
      });
    }
    setParticles(items);

    // Mouse move effect for background glowing-orbs
    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      orbsRef.current.forEach((orb, idx) => {
        if (!orb) return;
        const factor = idx % 2 === 0 ? 20 : -20;
        orb.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 hero-gradient z-10"></div>
          <img
            className="w-full h-full object-cover"
            alt="A breathtaking cinematic aerial view of a deep mountain valley during the blue hour."
            src="https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?q=80&w=1200&auto=format&fit=crop"
          />
        </div>

        {/* Animated particles */}
        <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
          {particles.map((p) => (
            <div
              key={p.id}
              className="particle"
              style={{
                width: p.width,
                height: p.height,
                left: p.left,
                top: p.top,
                animation: `floatParticle ${p.duration} linear infinite`,
                animationDelay: p.delay,
                opacity: p.opacity,
              }}
            />
          ))}
        </div>

        <div className="relative z-20 text-center px-margin-mobile max-w-3xl mx-auto space-y-6">
          <div className="space-y-2">
            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface leading-tight tracking-tight">
              Your World. One App.
            </h1>
            <p className="font-headline-md text-headline-md text-primary tracking-widest uppercase text-sm md:text-xl">
              Wandr AI
            </p>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mx-auto">
            Plan trips. Discover hidden places. Book everything. Travel safer. The next evolution of luxury travel coordination.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-gutter pt-8">
            <Link
              href="/planner"
              className="w-full md:w-auto bg-primary-container px-10 py-4 rounded-md text-on-primary-container font-title-lg text-title-lg text-center shadow-[0_0_20px_rgba(245,166,35,0.3)] hover:scale-105 transition-transform duration-300"
            >
              Start Planning Free
            </Link>
            <Link
              href="/discover"
              className="w-full md:w-auto border border-secondary text-secondary px-10 py-4 rounded-md font-title-lg text-title-lg text-center hover:bg-secondary/10 transition-all duration-300"
            >
              See How It Works
            </Link>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-60">
          <span className="font-label-sm text-label-sm text-teal-trust tracking-widest uppercase">Explore</span>
          <span className="material-symbols-outlined text-teal-trust animate-scroll">keyboard_double_arrow_down</span>
        </div>
      </section>

      {/* Problem Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center py-32 bg-deep-navy-bg">
        <div
          ref={(el) => (orbsRef.current[0] = el)}
          className="glowing-orb -top-20 -right-20 bg-primary opacity-5"
        ></div>
        <div
          ref={(el) => (orbsRef.current[1] = el)}
          className="glowing-orb bottom-0 left-0 bg-teal-trust opacity-5"
        ></div>
        
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center z-10">
          {/* Left Side: Chaos Visualization */}
          <div className="relative h-[400px] md:h-[600px] flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 500">
              <line className="friction-line" x1="100" x2="400" y1="100" y2="400"></line>
              <line className="friction-line" x1="400" x2="100" y1="100" y2="400"></line>
              <line className="friction-line" x1="50" x2="450" y1="250" y2="250"></line>
              <circle cx="250" cy="250" fill="none" r="150" stroke="rgba(0, 201, 167, 0.05)" strokeWidth="2"></circle>
            </svg>
            <div className="absolute float" style={{ animationDelay: "0s", top: "15%", left: "20%" }}>
              <div className="glass-card p-4 rounded-xl flex flex-col items-center gap-2 group hover:border-primary transition-all">
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">flight</span>
                <span className="font-label-sm text-on-surface-variant">Airline App</span>
              </div>
            </div>
            <div className="absolute float" style={{ animationDelay: "1.5s", bottom: "15%", right: "15%" }}>
              <div className="glass-card p-4 rounded-xl flex flex-col items-center gap-2 group hover:border-primary transition-all">
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">hotel</span>
                <span className="font-label-sm text-on-surface-variant">Booking Site</span>
              </div>
            </div>
            <div className="absolute float" style={{ animationDelay: "3s", top: "40%", right: "5%" }}>
              <div className="glass-card p-4 rounded-xl flex flex-col items-center gap-2 group hover:border-primary transition-all">
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">train</span>
                <span className="font-label-sm text-on-surface-variant">Transit</span>
              </div>
            </div>
            <div className="absolute float" style={{ animationDelay: "4.5s", bottom: "30%", left: "10%" }}>
              <div className="glass-card p-4 rounded-xl flex flex-col items-center gap-2 group hover:border-primary transition-all">
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">payments</span>
                <span className="font-label-sm text-on-surface-variant">Currency</span>
              </div>
            </div>
            <div className="absolute float" style={{ animationDelay: "1s", top: "10%", right: "30%" }}>
              <div className="glass-card p-4 rounded-xl flex flex-col items-center gap-2 group hover:border-primary transition-all">
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">location_on</span>
                <span className="font-label-sm text-on-surface-variant">Maps</span>
              </div>
            </div>
            <div className="relative z-10 glass-card p-8 rounded-full border-teal-trust/30 bg-teal-trust/5 shadow-[0_0_40px_rgba(0,201,167,0.1)]">
              <span className="material-symbols-outlined text-teal-trust !text-5xl">sync_problem</span>
            </div>
          </div>
          
          {/* Right Side: Narrative */}
          <div className="flex flex-col gap-8">
            <div className="space-y-4">
              <p className="font-title-lg text-on-surface-variant tracking-widest uppercase opacity-70">The Planning Friction</p>
              <div className="flex flex-col gap-0">
                <h2 className="font-display-lg text-4xl md:text-5xl text-on-surface leading-tight opacity-40">4 apps.</h2>
                <h2 className="font-display-lg text-6xl md:text-7xl text-on-surface leading-tight opacity-70">12 tabs.</h2>
                <div className="relative inline-block">
                  <h2 className="font-display-lg text-8xl md:text-9xl text-primary leading-tight">1 trip.</h2>
                  <div className="absolute -bottom-2 left-0 w-full h-2 bg-primary/30 rounded-full blur-[2px]"></div>
                </div>
              </div>
            </div>
            <div className="max-w-md space-y-6">
              <p className="font-body-md text-on-surface-variant leading-relaxed">
                Modern travel planning has become a cognitive load. Between comparing flight prices, managing disparate hotel reservations, and navigating local transit in separate browser tabs, the joy of discovery is buried under a mountain of digital clutter.
              </p>
              <p className="font-body-md text-on-surface-variant/80 border-l-2 border-primary pl-6 py-2 italic">
                The average traveler spends over 20 hours planning a single journey across dozens of platforms. We think that's a waste of your most precious resource.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Overview Section */}
      <section className="relative z-10 py-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto overflow-hidden">
        <div className="fixed inset-0 grid-bg pointer-events-none z-[-1] opacity-50"></div>
        <div className="text-center mb-20">
          <h1 className="font-headline-md md:font-display-lg text-headline-md md:text-display-lg text-on-surface mb-4">
            Everything your trip needs.
          </h1>
          <p className="font-title-lg text-on-surface-variant opacity-80">
            One platform. Zero switching.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter mb-gutter">
          <Link href="/planner" className="glass-card p-10 rounded-xl relative overflow-hidden group block">
            <div className="absolute top-6 right-6 font-display-lg text-primary/20 text-[40px]">01</div>
            <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center mb-8 border border-secondary/20">
              <span className="material-symbols-outlined text-secondary text-[32px]">explore</span>
            </div>
            <h3 className="font-headline-md text-[24px] text-on-surface mb-3">Smart Trip Planner</h3>
            <p className="text-on-surface-variant leading-relaxed">
              AI-orchestrated itineraries that adapt to your pace, weather changes, and local events in real-time. Experience travel that thinks ahead.
            </p>
          </Link>
          <Link href="/discover" className="glass-card p-10 rounded-xl relative overflow-hidden group block">
            <div className="absolute top-6 right-6 font-display-lg text-primary/20 text-[40px]">02</div>
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-8 border border-primary/20">
              <span className="material-symbols-outlined text-primary text-[32px]">location_on</span>
            </div>
            <h3 className="font-headline-md text-[24px] text-on-surface mb-3">Place Discovery</h3>
            <p className="text-on-surface-variant leading-relaxed">
              Uncover hidden gems beyond the tourist trails. Our neural engine maps your personal interests to the world's most unique locations.
            </p>
          </Link>
          <Link href="/planner" className="glass-card p-10 rounded-xl relative overflow-hidden group block">
            <div className="absolute top-6 right-6 font-display-lg text-primary/20 text-[40px]">03</div>
            <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center mb-8 border border-secondary/20">
              <span className="material-symbols-outlined text-secondary text-[32px]">confirmation_number</span>
            </div>
            <h3 className="font-headline-md text-[24px] text-on-surface mb-3">Booking Engine</h3>
            <p className="text-on-surface-variant leading-relaxed">
              Seamless integration with global travel providers. Book flights, stays, and exclusive experiences without ever leaving the interface.
            </p>
          </Link>
          <Link href="/companion" className="glass-card p-10 rounded-xl relative overflow-hidden group block">
            <div className="absolute top-6 right-6 font-display-lg text-primary/20 text-[40px]">04</div>
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-8 border border-primary/20">
              <span className="material-symbols-outlined text-primary text-[32px]">group</span>
            </div>
            <h3 className="font-headline-md text-[24px] text-on-surface mb-3">Travel Companion Finder</h3>
            <p className="text-on-surface-variant leading-relaxed">
              Connect with verified travelers who share your rhythm. Safety-first matchmaking for solo explorers looking for a shared adventure.
            </p>
          </Link>
        </div>
        
        <div className="flex justify-center">
          <Link href="/safety" className="glass-card p-10 rounded-xl relative overflow-hidden group max-w-2xl w-full block">
            <div className="absolute top-6 right-6 font-display-lg text-primary/20 text-[40px]">05</div>
            <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center mb-8 border border-secondary/20">
              <span className="material-symbols-outlined text-secondary text-[32px]">shield</span>
            </div>
            <h3 className="font-headline-md text-[24px] text-on-surface mb-3">Emergency Safety</h3>
            <p className="text-on-surface-variant leading-relaxed">
              24/7 AI-monitored safety grid. Instant local emergency protocols, real-time risk alerts, and one-tap assistance anywhere on Earth.
            </p>
          </Link>
        </div>
        
        <div className="mt-24 text-center">
          <Link
            href="/planner"
            className="inline-block bg-primary-container text-on-primary-container px-12 py-5 rounded-full font-title-lg text-[18px] uppercase tracking-widest transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(245,166,35,0.4)] active:scale-95"
          >
            Start Planning Free
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
