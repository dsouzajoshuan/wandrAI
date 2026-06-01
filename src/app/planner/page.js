"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ITINERARY_DATA = {
  ziro: {
    title: "Ziro Valley Cultural Expedition",
    3: [
      { time: "09:00 AM", title: "Apatani Heritage Trail", desc: "Guided exploration of Hong village, interacting with local elders wearing traditional facial tattoos." },
      { time: "01:30 PM", title: "Organic Farm Lunch", desc: "Savor traditional organic rice, bamboo shoot chicken, and home-brewed local beverages." },
      { time: "04:00 PM", title: "Ziro Pine Forest Hike", desc: "Light trekking through the dense blue pine forests, capturing cinematic sunset perspectives." }
    ],
    5: [
      { time: "Day 1 - 09:00 AM", title: "Heritage Village Trek", desc: "Walking tour of Hong and Hari, the primary Apatani cultural settlements." },
      { time: "Day 2 - 10:30 AM", title: "Talley Valley Reserve Entry", desc: "Enter the remote rainforest sanctuary. Check-in logs updated via local satellite nodes." },
      { time: "Day 3 - 02:00 PM", title: "Kile Pakto Viewpoint", desc: "Climb the ridge overlook. Visual coverage of the entire Ziro plateau landscape." },
      { time: "Day 4 - 11:00 AM", title: "Local Craft Workshop", desc: "Session on traditional bamboo weaving and handloom textile work." },
      { time: "Day 5 - 03:00 PM", title: "Wandr Zone Social Check-in", desc: "Join group debrief at Wandr Zone Base-02 for sharing media logs and transit arrangements." }
    ]
  },
  spiti: {
    title: "Spiti Valley High Altitude Trail",
    3: [
      { time: "08:00 AM", title: "Key Monastery Ascent", desc: "Early morning visit to the fortress-like monastery at 13,668ft for prayer assemblies." },
      { time: "12:00 PM", title: "Kibber Wildlife Overlook", desc: "Trek high-altitude trails observing local fauna (snow leopard corridors)." },
      { time: "04:30 PM", title: "Langza Fossil Hunting", desc: "Wander through marine fossil deposits dating back 200 million years (Tethys Sea)." }
    ],
    5: [
      { time: "Day 1 - 10:00 AM", title: "Kaza Base Hub Entry", desc: "Acclimatize in local guest houses. Register tracking beacons with system terminal." },
      { time: "Day 2 - 08:30 AM", title: "Key Monastery Study", desc: "Interact with local monks and analyze ancient murals and scriptures." },
      { time: "Day 3 - 09:00 AM", title: "Highest Post Office (Hikkim)", desc: "Mail postcard dispatches. Secure entry details registered at check-in station." },
      { time: "Day 4 - 01:00 PM", title: "Pin Valley Wilderness Trail", desc: "Trek through national reserve ecosystems bordered by glaciers." },
      { time: "Day 5 - 04:00 PM", title: "Chandratal Lake Wilderness Camp", desc: "Set up camps alongside the crescent water bodies. SOS fail-safes switched to satellite band." }
    ]
  },
  meghalaya: {
    title: "Meghalaya Living Root Bridge Trail",
    3: [
      { time: "07:30 AM", title: "Tyrna Descent", desc: "Begin the 3,000-step stone trail hike towards the valley floor." },
      { time: "11:30 AM", title: "Double Decker Bridge Crossing", desc: "Navigate the active 200-year-old bio-engineered root structure." },
      { time: "03:00 PM", title: "Rainbow Falls Trek", desc: "Push deeper into the jungle paths to reach the crystal waterfall plunge pool." }
    ],
    5: [
      { time: "Day 1 - 09:30 AM", title: "Sacred Grove Mawphlang", desc: "Forest walk analyzing native plants, orchids, and age-old sacrificial stones." },
      { time: "Day 2 - 08:00 AM", title: "Double Decker Root System", desc: "Complete descent and establish field camps near natural spring networks." },
      { time: "Day 3 - 10:00 AM", title: "Nohkalikai Ridge Overlook", desc: "Document the tallest plunge waterfall in the subcontinent from high ridge trails." },
      { time: "Day 4 - 02:00 PM", title: "Mawsmai Cave Traverse", desc: "Spelunking through narrow limestone tunnels displaying columns and fossils." },
      { time: "Day 5 - 04:30 PM", title: "Wandr Zone Shillong Debrief", desc: "Return to municipal zones. Sync system logs and check out of active status." }
    ]
  },
  hampi: {
    title: "Hampi Ruins Heritage Walk",
    3: [
      { time: "08:30 AM", title: "Virupaksha Temple Sunrise", desc: "Witness the morning sun lighting up the 7th-century active temple tower." },
      { time: "01:00 PM", title: "Vittala Temple Stone Chariot", desc: "Explore the musical pillars and the iconic stone chariot structure." },
      { time: "04:30 PM", title: "Hemakuta Hill Sunset Trek", desc: "Climb Hemakuta Hill for panoramic views of ruins dotting the boulder-strewn landscape." }
    ],
    5: [
      { time: "Day 1 - 09:00 AM", title: "Anegundi Ancient Kingdom", desc: "Take a coracle boat ride across the Tungabhadra river to explore the mythological Kishkindha site." },
      { time: "Day 2 - 08:30 AM", title: "Royal Enclosure Walk", desc: "Explore the Mahanavami Dibba, Stepped Tank, and Lotus Mahal structures." },
      { time: "Day 3 - 09:00 AM", title: "Malyavanta Raghunatha Temple", desc: "Visit the temple built around massive boulders, hosting live bhajan recitations." },
      { time: "Day 4 - 02:00 PM", title: "Bouldering Session", desc: "Participate in a guided safety bouldering session on the unique granite hills." },
      { time: "Day 5 - 04:30 PM", title: "Sanapur Lake Coracle Ride", desc: "Unwind with a peaceful boat ride and sync check-in logs at Wandr Zone Hampi Base." }
    ]
  },
  ladakh: {
    title: "Leh Ladakh Himalayan Odyssey",
    3: [
      { time: "09:00 AM", title: "Leh Palace Exploration", desc: "Ascend to the 9-story palace overlooking Leh town, exploring historical royal chambers." },
      { time: "01:30 PM", title: "Magnetic Hill & Confluence", desc: "Observe the gravity-defying hill phenomenon and the Indus-Zanskar river confluence." },
      { time: "05:00 PM", title: "Shanti Stupa Sunset", desc: "Enjoy a silent sunset prayer with panoramic mountain view at the white dome stupa." }
    ],
    5: [
      { time: "Day 1 - 10:00 AM", title: "Acclimatization Day", desc: "Mandatory rest in Leh town. Hydration monitoring and checking safety beacons." },
      { time: "Day 2 - 08:00 AM", title: "Monasteries of Indus Valley", desc: "Visit Hemis and Thiksey monasteries to witness morning monk chants." },
      { time: "Day 3 - 07:00 AM", title: "Khardung La Pass Crossing", desc: "Cross one of the highest motorable roads in the world (17,582ft) into Nubra Valley." },
      { time: "Day 4 - 09:00 AM", title: "Pangong Tso Alpine Lake", desc: "Travel to the high altitude salt-water lake, checking in at Wandr Zone Lake Post." },
      { time: "Day 5 - 03:00 PM", title: "Return to Leh & Sync", desc: "Return to Leh, finalize satellite beacon checkout, and join local traveler debrief." }
    ]
  },
  munnar: {
    title: "Munnar Tea Estate Trails",
    3: [
      { time: "08:00 AM", title: "Kolukkumalai Sunrise Safari", desc: "Take a rugged jeep safari to the highest organic tea estate in the world for sunrise." },
      { time: "01:30 PM", title: "Tea Museum Tour", desc: "Learn about the history of tea processing in the region dating back to the British era." },
      { time: "04:30 PM", title: "Eravikulam National Park", desc: "Spot the endangered Nilgiri Tahr mountain goat along the misty slopes." }
    ],
    5: [
      { time: "Day 1 - 09:30 AM", title: "Lockhart Gap Viewpoint", desc: "Scenic ridge hike looking over lockhart valley clouds and tea gardens." },
      { time: "Day 2 - 08:30 AM", title: "Anamudi Foothills Trek", desc: "Guided forest trail near the highest peak in South India." },
      { time: "Day 3 - 10:00 AM", title: "Mattupetty Lake Kayaking", desc: "Eco-kayaking in the reservoir water surrounded by pine woods." },
      { time: "Day 4 - 02:00 PM", title: "Marayoor Sandalwood Forests", desc: "Visit the natural sandalwood reserve and ancient dolmens (megalithic tombs)." },
      { time: "Day 5 - 04:30 PM", title: "Attukad Waterfalls Picnic", desc: "Check-in at Wandr Zone Munnar for final route reviews and local spice sampling." }
    ]
  }
};

export default function Planner() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("3");
  const [budget, setBudget] = useState("Explorer");
  const [assistantInput, setAssistantInput] = useState("");
  const [viewState, setViewState] = useState("idle"); // idle, loading, results
  const [compiledTimeline, setCompiledTimeline] = useState([]);
  const [resDetails, setResDetails] = useState({ title: "", days: "3", budget: "Explorer" });

  useEffect(() => {
    // Check auto load param from discover card click
    const autoLoad = localStorage.getItem("wandr_auto_load_dest");
    if (autoLoad) {
      setDestination(autoLoad);
      localStorage.removeItem("wandr_auto_load_dest");
      triggerCompile(autoLoad, duration, budget);
    }
  }, []);

  const triggerCompile = (dest = destination, dur = duration, bud = budget) => {
    if (!dest) {
      alert("Please select a destination from the console dropdown.");
      return;
    }

    setViewState("loading");

    setTimeout(() => {
      setViewState("results");
      const matched = ITINERARY_DATA[dest];
      const steps = matched[dur] || matched[3];

      setResDetails({
        title: matched.title,
        days: dur,
        budget: bud
      });
      setCompiledTimeline(steps);

      // Save parameters in localStorage
      localStorage.setItem("wandr_trip_planned", "true");
      localStorage.setItem("wandr_planned_destination", matched.title);
      localStorage.setItem("wandr_planned_days", dur);
      localStorage.setItem("wandr_planned_budget", bud);
    }, 1300);
  };

  const handleAssistantQuery = (e) => {
    if (e) e.preventDefault();
    const query = assistantInput.trim().toLowerCase();
    if (!query) {
      alert("Please enter a destination (e.g. Ziro, Spiti, Munnar).");
      return;
    }

    const keywords = {
      ziro: "ziro",
      arunachal: "ziro",
      spiti: "spiti",
      himachal: "spiti",
      meghalaya: "meghalaya",
      shillong: "meghalaya",
      root: "meghalaya",
      hampi: "hampi",
      karnataka: "hampi",
      ladakh: "ladakh",
      leh: "ladakh",
      munnar: "munnar",
      kerala: "munnar"
    };

    let matched = null;
    for (const key in keywords) {
      if (query.includes(key)) {
        matched = keywords[key];
        break;
      }
    }

    if (matched) {
      setDestination(matched);
      triggerCompile(matched, duration, budget);
    } else {
      alert(`"${assistantInput}" submitted. Standard AI compilation routes synthesized for general region.\n\nTry searching: Ziro, Spiti, Hampi, Munnar, Meghalaya.`);
    }
  };

  const resetForm = () => {
    setDestination("");
    setViewState("idle");
  };

  const handleLockTrip = () => {
    alert("Itinerary locked! Opening vetted traveler matching deck.");
    router.push("/companion");
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
            <button type="submit" className="bg-primary text-on-primary px-5 py-2.5 rounded-full font-label-sm hover:scale-95 active:scale-95 transition-all shadow-md flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-md">arrow_forward</span>
            </button>
          </form>

          {/* Action categories grid */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            <button onClick={() => setDestination("ziro")} className="glass-card hover:border-primary p-4 rounded-xl flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl">route</span>
              <span className="font-label-sm text-[11px] text-on-surface-variant">Plan Trip</span>
            </button>
            <button onClick={() => alert('Consolidated flight listings: BLR ➔ IXT (IndiGo): ₹11,900')} className="glass-card hover:border-primary p-4 rounded-xl flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-2xl">flight</span>
              <span className="font-label-sm text-[11px] text-on-surface-variant">Flights</span>
            </button>
            <button onClick={() => alert('Eco-resort booking logs checked. Average rate: ₹3,900/night.')} className="glass-card hover:border-primary p-4 rounded-xl flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-teal-trust text-2xl">hotel</span>
              <span className="font-label-sm text-[11px] text-on-surface-variant">Hotels</span>
            </button>
            <button onClick={() => alert('Inner Line Permit (ILP) required for Arunachal. E-Permits process takes 24 hours.')} className="glass-card hover:border-primary p-4 rounded-xl flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl">contact_mail</span>
              <span className="font-label-sm text-[11px] text-on-surface-variant">Get Visa</span>
            </button>
            <button onClick={() => alert('High-altitude wilderness coverage active. Wandr Shield premium is fully covered.')} className="glass-card hover:border-primary p-4 rounded-xl flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-2xl">shield</span>
              <span className="font-label-sm text-[11px] text-on-surface-variant">Insurance</span>
            </button>
            <button onClick={() => alert('BNSL/Jio hybrid eSIM profiles configured for remote valley offline check-ins.')} className="glass-card hover:border-primary p-4 rounded-xl flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-teal-trust text-2xl">sim_card</span>
              <span className="font-label-sm text-[11px] text-on-surface-variant">Local SIM</span>
            </button>
          </div>
        </section>

        {/* Dual Form/Itinerary Console */}
        <section className="glass-card rounded-2xl border border-glass-stroke p-8 mb-16 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -left-10 bg-teal-trust/5 w-60 h-60 rounded-full blur-3xl pointer-events-none"></div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* Input Settings Console */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="space-y-2">
                <div className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-[10px] inline-block font-bold uppercase tracking-wider">Configure Parameters</div>
                <h2 className="font-headline-md text-2xl text-on-surface">Route Compilation Console</h2>
                <p className="text-xs text-on-surface-variant leading-relaxed">Define destination parameters, days coordinates, and budget scopes to execute the AI compiler.</p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="destSelect" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Destination</label>
                  <select
                    id="destSelect"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="bg-surface-container-low border border-glass-stroke text-on-surface text-sm rounded-lg p-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  >
                    <option value="">Select Destination...</option>
                    <option value="ziro">Ziro Valley (Arunachal Pradesh)</option>
                    <option value="spiti">Spiti Valley (Himachal Pradesh)</option>
                    <option value="meghalaya">Cherrapunji & Shillong (Meghalaya)</option>
                    <option value="hampi">Hampi Heritage Ruins (Karnataka)</option>
                    <option value="ladakh">Leh Wilderness (Ladakh)</option>
                    <option value="munnar">Munnar Valleys (Kerala)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="daysSelect" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Duration</label>
                  <select
                    id="daysSelect"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="bg-surface-container-low border border-glass-stroke text-on-surface text-sm rounded-lg p-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  >
                    <option value="3">3 Days (Optimized Expedition)</option>
                    <option value="5">5 Days (Complete Wilderness)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="budgetSelect" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Budget Coordinates</label>
                  <select
                    id="budgetSelect"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="bg-surface-container-low border border-glass-stroke text-on-surface text-sm rounded-lg p-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  >
                    <option value="Explorer">Explorer (Homestays & Transit)</option>
                    <option value="Premium">Premium (Luxury Eco-Resorts)</option>
                  </select>
                </div>

                <button
                  onClick={() => triggerCompile(destination, duration, budget)}
                  className="w-full bg-primary-container text-on-primary-container py-3.5 rounded-lg text-sm font-semibold hover:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <span className="material-symbols-outlined text-sm">cycle</span>
                  <span>Compile AI Route</span>
                </button>
              </div>
            </div>

            {/* Timeline display panels */}
            <div className="lg:col-span-3 min-h-[300px] flex items-center justify-center border-t lg:border-t-0 lg:border-l border-glass-stroke pt-8 lg:pt-0 lg:pl-8">
              
              {/* Idle */}
              {viewState === "idle" && (
                <div className="flex flex-col items-center text-center gap-3">
                  <span className="material-symbols-outlined text-primary/30 !text-6xl animate-pulse">terminal</span>
                  <div>
                    <h4 className="font-semibold text-on-surface text-md">AI Compiler Idle</h4>
                    <p className="text-xs text-on-surface-variant max-w-xs mt-1">Ready for input configurations. Setup parameters on the left and trigger compilation.</p>
                  </div>
                </div>
              )}

              {/* Loading */}
              {viewState === "loading" && (
                <div className="flex flex-col items-center gap-4">
                  <div className="spinner"></div>
                  <span className="font-mono text-xs text-teal-trust">compiling_routes_and_lodgings.sh ...</span>
                </div>
              )}

              {/* Results */}
              {viewState === "results" && (
                <div className="w-full space-y-6">
                  <div className="flex justify-between items-center border-b border-glass-stroke pb-4">
                    <div>
                      <h3 className="font-headline-md text-xl text-primary">{resDetails.title}</h3>
                      <p className="text-xs text-on-surface-variant mt-1">Duration: <span className="text-on-surface font-semibold">{resDetails.days}</span> Days | Budget: <span className="text-on-surface font-semibold">{resDetails.budget}</span></p>
                    </div>
                    <button
                      onClick={resetForm}
                      className="border border-glass-stroke bg-glass-fill hover:border-teal-trust text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all text-on-surface"
                    >
                      <span className="material-symbols-outlined text-xs">restart_alt</span>
                      <span>Modify Options</span>
                    </button>
                  </div>

                  <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 no-scrollbar">
                    {compiledTimeline.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-4 border-l-2 border-teal-trust/30 pl-4 py-2 relative">
                        <div className="absolute w-3 h-3 bg-teal-trust rounded-full -left-[7px] top-[14px] shadow-[0_0_8px_#00C9A7]"></div>
                        <div className="space-y-1">
                          <span className="font-mono text-[10px] text-teal-trust tracking-wider font-semibold">{step.time}</span>
                          <h5 className="text-sm font-semibold text-on-surface font-title-lg">{step.title}</h5>
                          <p className="text-xs text-on-surface-variant leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleLockTrip}
                      className="bg-teal-trust text-on-secondary px-5 py-2.5 rounded-lg font-label-sm text-xs hover:scale-95 active:scale-95 transition-all shadow-md flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">lock</span>
                      <span>Lock Trip & Unlock Companions</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </section>

        {/* Quick plan blueprints templates */}
        <section>
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
                      document.getElementById("destSelect").scrollIntoView({ behavior: "smooth", block: "center" });
                    }}
                    className="bg-primary/10 border border-primary/20 text-primary py-2.5 rounded-lg text-xs font-semibold hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-xs">bolt</span>
                    <span>Quick Plan</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
