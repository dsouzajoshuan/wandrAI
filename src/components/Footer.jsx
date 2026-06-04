export default function Footer() {
  return (
    <footer className="w-full pt-12 pb-8 border-t border-glass-stroke bg-surface-container-lowest relative z-10">
      <div className="max-w-container-max mx-auto px-margin-desktop flex flex-col items-center text-center gap-8">
        {/* Brand Header */}
        <div className="flex items-center gap-3 animate-fade-in">
          <img alt="Wandr AI Logo" className="h-10 w-10 object-contain" src="/logo.svg" />
          <span className="font-display-lg text-[28px] text-primary tracking-wide">Wandr AI</span>
        </div>

        {/* Project Description & Developers Info */}
        <div className="max-w-2xl flex flex-col gap-4">
          <p className="font-body-md text-on-surface-variant text-sm md:text-base leading-relaxed">
            Wandr AI is an advanced, AI-driven travel planning and coordination platform designed to personalize itineraries, uncover unique destinations, and provide safety-first experiences.
          </p>
          <div className="p-4 rounded-xl glass-card inline-block border-primary/10 max-w-lg mx-auto">
            <span className="font-label-sm text-primary uppercase tracking-widest text-[11px] block mb-2">Developed By</span>
            <p className="font-body-md text-on-surface text-sm font-semibold tracking-wide">
              Joshua • Inish • Aditya • Karthik • Royson
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="w-full pt-8 border-t border-glass-stroke/50 flex flex-col md:flex-row justify-center items-center gap-4 text-xs text-on-surface-variant/50">
          <p>
            © {new Date().getFullYear()} Wandr AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
