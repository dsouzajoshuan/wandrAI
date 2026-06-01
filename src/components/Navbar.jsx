"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0f1e]/95 shadow-2xl"
          : "bg-glass-fill"
      } backdrop-blur-xl border-b border-glass-stroke`}
    >
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop h-16 flex items-center justify-between">
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-3 shrink-0 hover:opacity-90">
          <img alt="Wandr AI Logo" className="h-8 w-8 object-contain" src="/logo.svg" />
          <span className="font-display-lg text-[22px] text-primary tracking-tight hidden sm:block">Wandr AI</span>
        </Link>
        
        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-12">
          <Link
            href="/discover"
            className={`font-title-lg text-[15px] pb-1 transition-colors ${
              pathname === "/discover"
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Discover
          </Link>
          <Link
            href="/planner"
            className={`font-title-lg text-[15px] pb-1 transition-colors ${
              pathname === "/planner"
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Plan
          </Link>
          <Link
            href="/companion"
            className={`font-title-lg text-[15px] pb-1 transition-colors ${
              pathname === "/companion"
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Companions
          </Link>
          <Link
            href="/safety"
            className={`font-title-lg text-[15px] pb-1 transition-colors ${
              pathname === "/safety"
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Safety
          </Link>
        </nav>

        {/* CTA Section */}
        <div className="flex items-center gap-4 shrink-0">
          <Link href="/profile" className="text-on-surface-variant font-title-lg text-[15px] hover:text-primary transition-colors px-3 py-1">
            Profile
          </Link>
          <Link href="/signup" className="bg-primary-container text-on-primary-container px-5 py-2 rounded-lg font-title-lg text-[14px] hover:scale-95 active:opacity-80 transition-all shadow-md">
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
