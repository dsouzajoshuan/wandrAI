import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full pt-16 pb-8 border-t border-glass-stroke bg-surface-container-lowest relative z-10">
      <div className="max-w-container-max mx-auto px-margin-desktop grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
        {/* Brand Column */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <img alt="Wandr AI Logo" className="h-8 w-8 object-contain" src="/logo.svg" />
            <span className="font-display-lg text-[24px] text-primary">Wandr AI</span>
          </div>
          <p className="font-body-md text-on-surface-variant max-w-xs text-sm">
            Revolutionizing travel through AI-driven personalization and seamless coordination. Your journey, perfectly orchestrated.
          </p>
          <div className="flex gap-4">
            <a className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors" href="#">
              <span className="material-symbols-outlined text-[20px]">public</span>
            </a>
            <a className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors" href="#">
              <span className="material-symbols-outlined text-[20px]">share</span>
            </a>
          </div>
        </div>

        {/* Navigation Columns */}
        <div className="md:col-span-2 text-sm">
          <h5 className="font-title-lg text-on-surface mb-6 text-[16px]">Product</h5>
          <ul className="flex flex-col gap-4">
            <li><Link className="font-body-md text-on-surface-variant hover:text-primary transition-colors" href="/discover">Discover</Link></li>
            <li><Link className="font-body-md text-on-surface-variant hover:text-primary transition-colors" href="/planner">Itineraries</Link></li>
            <li><Link className="font-body-md text-on-surface-variant hover:text-primary transition-colors" href="/companion">Companions</Link></li>
            <li><Link className="font-body-md text-on-surface-variant hover:text-primary transition-colors" href="/safety">Safety Grid</Link></li>
          </ul>
        </div>
        <div className="md:col-span-2 text-sm">
          <h5 className="font-title-lg text-on-surface mb-6 text-[16px]">Company</h5>
          <ul className="flex flex-col gap-4">
            <li><a className="font-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">About Us</a></li>
            <li><a className="font-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Careers</a></li>
            <li><a className="font-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Blog</a></li>
            <li><a className="font-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Press</a></li>
          </ul>
        </div>

        {/* Contact Column */}
        <div className="md:col-span-4 flex flex-col gap-6 text-sm">
          <h5 className="font-title-lg text-on-surface text-[16px]">Get in Touch</h5>
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-[20px]">mail</span>
              <span className="font-body-md text-on-surface-variant">concierge@wandr.ai</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-[20px]">support_agent</span>
              <span className="font-body-md text-on-surface-variant">24/7 Global Support</span>
            </div>
          </div>
          <div className="mt-4 p-4 rounded-xl glass-card border-primary/20">
            <p className="font-label-sm text-primary mb-2 uppercase tracking-widest text-xs">Newsletter</p>
            <div className="flex gap-2">
              <input className="bg-surface-container-high/50 border-none rounded-lg px-4 py-2 text-xs w-full focus:ring-1 focus:ring-primary text-on-surface placeholder:text-on-surface-variant/50 outline-none" placeholder="Your email" type="email" />
              <button className="bg-primary px-3 py-2 rounded-lg text-on-primary hover:opacity-90 flex items-center justify-center" onClick={() => alert('Thanks for signing up to WANDR updates!')}>
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-container-max mx-auto px-margin-desktop pt-8 border-t border-glass-stroke/50 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="font-body-md text-on-surface-variant/60 text-xs">
          © 2026 Wandr AI. All rights reserved.
        </p>
        <div className="flex gap-8 text-xs">
          <a className="font-body-md text-on-surface-variant/60 hover:text-on-surface transition-colors" href="#">Privacy Policy</a>
          <a className="font-body-md text-on-surface-variant/60 hover:text-on-surface transition-colors" href="#">Terms of Service</a>
          <a className="font-body-md text-on-surface-variant/60 hover:text-on-surface transition-colors" href="#">Cookies</a>
        </div>
      </div>
    </footer>
  );
}
