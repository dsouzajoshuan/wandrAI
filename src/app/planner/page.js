"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Planner() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("3");
  const [budget, setBudget] = useState("Explorer");
  const [assistantInput, setAssistantInput] = useState("");
  const [viewState, setViewState] = useState("idle"); // idle, loading, results
  const [compiledTimeline, setCompiledTimeline] = useState([]);
  const [resDetails, setResDetails] = useState({ title: "", days: "3", budget: "Explorer" });

  const [destinationsList, setDestinationsList] = useState([]);

  useEffect(() => {
    // If a trip is already finalized, stay on the maps page (orchestrator)
    if (localStorage.getItem("wandr_trip_planned") === "true") {
      router.replace("/orchestrator");
      return;
    }

    fetchDestinations();
    
    // Check auto load param from discover card click
    const autoLoad = localStorage.getItem("wandr_auto_load_dest");
    if (autoLoad) {
      setDestination(autoLoad);
      localStorage.removeItem("wandr_auto_load_dest");
      triggerCompile(autoLoad, duration, budget);
    }
  }, [router]);

  const fetchDestinations = async () => {
    try {
      const response = await fetch("/api/destinations");
      const res = await response.json();
      if (res.success && res.data) {
        setDestinationsList(res.data);
      }
    } catch (err) {
      console.error("Failed to load destinations:", err);
    }
  };

  const triggerCompile = async (dest = destination, dur = duration, bud = budget) => {
    if (!dest) {
      alert("Please select a destination from the console dropdown.");
      return;
    }

    setViewState("loading");

    try {
      const response = await fetch(`/api/destinations/${dest}/itinerary?days=${dur}&budget=${bud}`);
      const res = await response.json();

      if (!res.success) {
        throw new Error(res.error || "Failed to compile itinerary.");
      }

      const steps = res.data || [];
      const mappedSteps = steps.map(s => ({
        time: s.time_label,
        title: s.title,
        desc: s.description
      }));

      const destObj = destinationsList.find(d => d.slug === dest);
      const title = destObj ? destObj.title : (dest.charAt(0).toUpperCase() + dest.slice(1) + " Trail");

      setResDetails({
        title: title,
        days: dur,
        budget: bud
      });
      setCompiledTimeline(mappedSteps);
      setViewState("results");

      // Save parameters in localStorage
      localStorage.setItem("wandr_trip_planned", "true");
      localStorage.setItem("wandr_planned_destination", title);
      localStorage.setItem("wandr_planned_days", dur);
      localStorage.setItem("wandr_planned_budget", bud);
      localStorage.setItem("wandr_planned_timeline", JSON.stringify(mappedSteps.map(s => s.title)));
    } catch (err) {
      console.error("Compile error:", err);
      alert("An error occurred while compiling the itinerary: " + err.message);
      setViewState("idle");
    }
  };

  const handleAssistantQuery = async (e) => {
    if (e) e.preventDefault();
    if (!assistantInput.trim()) {
      alert("Please enter a destination or query.");
      return;
    }

    setViewState("loading");
    try {
      const response = await fetch("/api/planner/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: assistantInput, budget: budget }),
      });

      const res = await response.json();
      if (!res.success) {
        throw new Error(res.error || "Failed to process query.");
      }

      const data = res.data;
      if (data.isCustom) {
        const mappedSteps = (data.timeline || []).map(s => ({
          time: s.time_label,
          title: s.title,
          desc: s.description
        }));

        setResDetails({
          title: data.title || "Custom AI Itinerary",
          days: data.duration || 3,
          budget: budget
        });
        setCompiledTimeline(mappedSteps);
        setViewState("results");

        localStorage.setItem("wandr_trip_planned", "true");
        localStorage.setItem("wandr_planned_destination", data.title || "Custom AI Trip");
        localStorage.setItem("wandr_planned_days", data.duration || 3);
        localStorage.setItem("wandr_planned_budget", budget);
        localStorage.setItem("wandr_planned_timeline", JSON.stringify(mappedSteps.map(s => s.title)));
      } else {
        if (data.slug) {
          setDestination(data.slug);
          setDuration(String(data.duration || 3));
          await triggerCompile(data.slug, String(data.duration || 3), budget);
        } else {
          throw new Error("AI classification returned no slug for seeded destination.");
        }
      }
    } catch (err) {
      console.error("Assistant query error:", err);
      alert("An error occurred: " + err.message);
      setViewState("idle");
    }
  };

  const handleBudgetChange = async (newBudget) => {
    setBudget(newBudget);
    if (destination) {
      await triggerCompile(destination, duration, newBudget);
    } else if (assistantInput) {
      setViewState("loading");
      try {
        const response = await fetch("/api/planner/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: assistantInput, budget: newBudget }),
        });
        const res = await response.json();
        if (res.success) {
          const data = res.data;
          const mappedSteps = (data.timeline || []).map(s => ({
            time: s.time_label,
            title: s.title,
            desc: s.description
          }));
          setResDetails(prev => ({ ...prev, budget: newBudget }));
          setCompiledTimeline(mappedSteps);
          setViewState("results");
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleDurationChange = async (newDuration) => {
    setDuration(newDuration);
    if (destination) {
      await triggerCompile(destination, newDuration, budget);
    } else if (assistantInput) {
      setViewState("loading");
      try {
        const response = await fetch("/api/planner/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: `${assistantInput} for ${newDuration} days`, budget }),
        });
        const res = await response.json();
        if (res.success) {
          const data = res.data;
          const mappedSteps = (data.timeline || []).map(s => ({
            time: s.time_label,
            title: s.title,
            desc: s.description
          }));
          setResDetails(prev => ({ ...prev, days: newDuration }));
          setCompiledTimeline(mappedSteps);
          setViewState("results");
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const resetForm = () => {
    setDestination("");
    setAssistantInput("");
    setViewState("idle");
  };

  const handleLockTrip = () => {
    alert("Itinerary locked! Launching your premium trip orchestrator and budget breakdown.");
    router.push("/orchestrator");
  };

  return (
    <>
      <Navbar />

      {/* Atmospheric Background Layers */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 grid-bg"></div>
        <div className="glowing-orb top-0 left-0 bg-primary"></div>
        <div className="glowing-orb bottom-0 right-0 bg-teal-trust"></div>
      </div>

      <main className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-24 pb-32">
        {/* Assistant search console */}
        {viewState === "idle" && (
          <section className="mb-12 max-w-3xl mx-auto">
            <form onSubmit={handleAssistantQuery} className="relative glass-card flex items-center p-2 rounded-full border border-glass-stroke shadow-lg mb-6">
              <span className="material-symbols-outlined text-on-surface-variant px-3">search</span>
              <input
                type="text"
                value={assistantInput}
                onChange={(e) => setAssistantInput(e.target.value)}
                className="w-full bg-transparent border-none text-on-surface placeholder:text-on-surface-variant/50 focus:ring-0 text-md"
                placeholder="Ask anything travel (e.g. Ziro Valley, Spiti)..."
              />
              <button type="submit" className="bg-primary text-on-primary px-5 py-2.5 rounded-full font-label-sm hover:scale-95 active:scale-95 transition-all shadow-md flex items-center justify-center shrink-0 border-none">
                <span className="material-symbols-outlined text-md">arrow_forward</span>
              </button>
            </form>

            {/* Quick selectors for budget and duration */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 glass-card p-4 rounded-2xl border border-glass-stroke">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-on-surface-variant font-mono uppercase tracking-wider">Duration:</span>
                <div className="flex gap-1 bg-surface-container-low p-1 rounded-full border border-glass-stroke">
                  {["3", "5"].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all border-none outline-none ${
                        duration === d
                          ? "bg-primary text-on-primary shadow-sm font-bold"
                          : "text-on-surface-variant hover:text-on-surface bg-transparent"
                      }`}
                    >
                      {d} Days
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="hidden sm:block text-glass-stroke">|</div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-on-surface-variant font-mono uppercase tracking-wider">Budget:</span>
                <div className="flex gap-1 bg-surface-container-low p-1 rounded-full border border-glass-stroke">
                  {["Explorer", "Elite", "Royal"].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBudget(b)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all border-none outline-none ${
                        budget === b
                          ? "bg-primary text-on-primary shadow-sm font-bold"
                          : "text-on-surface-variant hover:text-on-surface bg-transparent"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action categories grid */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              <button onClick={() => { setDestination("ziro"); triggerCompile("ziro", duration, budget); }} className="glass-card hover:border-primary p-4 rounded-xl flex flex-col items-center gap-2 border-none cursor-pointer">
                <span className="material-symbols-outlined text-primary text-2xl">route</span>
                <span className="font-label-sm text-[11px] text-on-surface-variant">Plan Trip</span>
              </button>
              <button onClick={() => alert('Consolidated flight listings: BLR ➔ IXT (IndiGo): ₹11,900')} className="glass-card hover:border-primary p-4 rounded-xl flex flex-col items-center gap-2 border-none cursor-pointer">
                <span className="material-symbols-outlined text-secondary text-2xl">flight</span>
                <span className="font-label-sm text-[11px] text-on-surface-variant">Flights</span>
              </button>
              <button onClick={() => alert('Eco-resort booking logs checked. Average rate: ₹3,900/night.')} className="glass-card hover:border-primary p-4 rounded-xl flex flex-col items-center gap-2 border-none cursor-pointer">
                <span className="material-symbols-outlined text-teal-trust text-2xl">hotel</span>
                <span className="font-label-sm text-[11px] text-on-surface-variant">Hotels</span>
              </button>
              <button onClick={() => alert('Inner Line Permit (ILP) required for Arunachal. E-Permits process takes 24 hours.')} className="glass-card hover:border-primary p-4 rounded-xl flex flex-col items-center gap-2 border-none cursor-pointer">
                <span className="material-symbols-outlined text-primary text-2xl">contact_mail</span>
                <span className="font-label-sm text-[11px] text-on-surface-variant">Get Visa</span>
              </button>
              <button onClick={() => alert('High-altitude wilderness coverage active. Wandr Shield premium is fully covered.')} className="glass-card hover:border-primary p-4 rounded-xl flex flex-col items-center gap-2 border-none cursor-pointer">
                <span className="material-symbols-outlined text-secondary text-2xl">shield</span>
                <span className="font-label-sm text-[11px] text-on-surface-variant">Insurance</span>
              </button>
              <button onClick={() => alert('BNSL/Jio hybrid eSIM profiles configured for remote valley offline check-ins.')} className="glass-card hover:border-primary p-4 rounded-xl flex flex-col items-center gap-2 border-none cursor-pointer">
                <span className="material-symbols-outlined text-teal-trust text-2xl">sim_card</span>
                <span className="font-label-sm text-[11px] text-on-surface-variant">Local SIM</span>
              </button>
            </div>
          </section>
        )}

        {/* Loading skeleton view */}
        {viewState === "loading" && (
          <section className="max-w-3xl mx-auto mb-12 glass-card p-8 rounded-2xl border border-glass-stroke shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin shrink-0"></div>
              <div>
                <h3 className="text-xl text-on-surface font-headline-md animate-pulse">Compiling Luxury Itinerary...</h3>
                <p className="text-sm text-on-surface-variant animate-pulse">Consulting travel logs & AI recommendation engines</p>
              </div>
            </div>
            <div className="relative border-l border-glass-stroke pl-6 ml-6 space-y-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="relative animate-pulse">
                  <span className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-primary/45 border border-glass-stroke"></span>
                  <div className="h-4 bg-[#ffc880]/15 rounded w-1/4 mb-2"></div>
                  <div className="h-6 bg-[#ffc880]/10 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-[#ffc880]/5 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Timeline results view */}
        {viewState === "results" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
            {/* Left Column: Timeline */}
            <section className="lg:col-span-7 glass-card p-6 md:p-8 rounded-2xl border border-glass-stroke shadow-2xl relative h-fit">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-glass-stroke pb-6 mb-8">
                <div>
                  <span className="bg-primary/10 border border-primary/20 text-primary px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {resDetails.budget} Tier · {resDetails.days} Days
                  </span>
                  <h2 className="font-display-lg text-3xl text-on-surface mt-3">{resDetails.title}</h2>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={resetForm}
                    className="bg-white/5 hover:bg-white/10 border border-glass-stroke text-on-surface px-5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    Plan Another
                  </button>
                  <button
                    onClick={handleLockTrip}
                    className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-xs font-semibold hover:scale-95 active:scale-95 transition-all shadow-lg flex items-center gap-1.5 border-none cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">lock</span>
                    <span>Lock Itinerary</span>
                  </button>
                </div>
              </div>

              {/* In-results selectors */}
              <div className="flex flex-wrap gap-4 items-center justify-between p-3 bg-surface-container-low rounded-xl border border-glass-stroke mb-8 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-on-surface-variant font-bold uppercase">Days:</span>
                  <div className="flex gap-1 bg-surface-container-lowest p-0.5 rounded-full border border-glass-stroke">
                    {["3", "5"].map((d) => (
                      <button
                        key={d}
                        onClick={() => handleDurationChange(d)}
                        className={`px-3 py-1 rounded-full text-[11px] font-semibold cursor-pointer border-none ${
                          resDetails.days === d
                            ? "bg-primary text-on-primary font-bold shadow-sm"
                            : "text-on-surface-variant hover:text-on-surface bg-transparent"
                        }`}
                      >
                        {d} Days
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-on-surface-variant font-bold uppercase">Budget:</span>
                  <div className="flex gap-1 bg-surface-container-lowest p-0.5 rounded-full border border-glass-stroke">
                    {["Explorer", "Elite", "Royal"].map((b) => (
                      <button
                        key={b}
                        onClick={() => handleBudgetChange(b)}
                        className={`px-3 py-1 rounded-full text-[11px] font-semibold cursor-pointer border-none ${
                          resDetails.budget === b
                            ? "bg-primary text-on-primary font-bold shadow-sm"
                            : "text-on-surface-variant hover:text-on-surface bg-transparent"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative border-l-2 border-primary/30 pl-6 ml-4 md:ml-6 space-y-8">
                {compiledTimeline.map((step, idx) => (
                  <div key={idx} className="relative group">
                    <span className="absolute -left-[33px] top-1 w-4 h-4 rounded-full bg-primary border-2 border-[#0a0f1e] shadow-md group-hover:scale-125 transition-transform duration-300"></span>
                    <div>
                      <span className="text-[11px] font-mono tracking-wider text-teal-trust font-bold uppercase">{step.time}</span>
                      <h4 className="font-headline-md text-[17px] text-on-surface mt-1">{step.title}</h4>
                      <p className="text-xs text-on-surface-variant mt-2 leading-relaxed font-body-md whitespace-pre-line">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Right Column: Google Maps Embed */}
            <section className="lg:col-span-5 h-[500px] lg:h-[600px] rounded-2xl overflow-hidden border border-glass-stroke shadow-2xl sticky top-24">
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(resDetails.title)}&t=&z=12&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-full border-none opacity-80"
                style={{ filter: "invert(90%) hue-rotate(180deg) contrast(110%) saturate(70%)" }}
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </section>
          </div>
        )}

        {/* Quick plan blueprints templates */}
        {viewState === "idle" && (
          <section className="mt-16">
            <div className="mb-8">
              <span className="bg-secondary/15 text-secondary border border-secondary/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Quick Plan Templates</span>
              <h2 className="font-display-lg text-3xl text-on-surface mt-2">Hot Destinations This Week</h2>
              <p className="text-sm text-on-surface-variant mt-1 font-body-md">Instantly trigger AI routes by choosing one of these pre-configured regional blueprints.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { key: "ziro", title: "Ziro Valley Sights", desc: "Lush hills, organic bamboo plantations, and rich tribal heritage in Northeast India.", img: "/images/download.jpg", tag: "Arunachal" },
                { key: "spiti", title: "Spiti Monastery Trail", desc: "High-altitude Buddhist temples, fossil valleys, and alpine cold deserts.", img: "/images/download (1).jpg", tag: "Himachal" },
                { key: "hampi", title: "Hampi Ruins Walk", desc: "Historic stone chariots, royal pavilions, and boulder structures bordering rivers.", img: "/images/images.jpg", tag: "Karnataka" },
                { key: "munnar", title: "Munnar Cloud Valleys", desc: "Misty tea estate walks, wild animal preserves, and peaceful hill stations.", img: "/images/images (2).jpg", tag: "Kerala" },
              ].map((sight) => (
                <div key={sight.key} className="glass-card rounded-2xl overflow-hidden shadow-lg hover:-translate-y-1 transition-all flex flex-col h-full group">
                  <div className="h-44 overflow-hidden relative">
                    <img src={sight.img} alt={sight.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 right-3 bg-primary/95 text-[9px] px-2.5 py-1 rounded-full text-on-primary font-bold uppercase tracking-wider">{sight.tag}</div>
                  </div>
                  <div className="p-5 flex flex-col justify-between flex-grow gap-4">
                    <div>
                      <h4 className="font-headline-md text-[19px] text-on-surface">{sight.title}</h4>
                      <p className="text-xs text-on-surface-variant mt-2 leading-relaxed line-clamp-2">{sight.desc}</p>
                    </div>
                    <button
                      onClick={() => {
                        setDestination(sight.key);
                        triggerCompile(sight.key, duration, budget);
                      }}
                      className="bg-primary/10 border border-primary/20 text-primary py-2.5 rounded-lg text-xs font-semibold hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">bolt</span>
                      <span>Quick Plan</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
