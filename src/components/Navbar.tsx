"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, Search } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  // Track page scrolls for nav styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // IntersectionObserver to highlight active links
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-25% 0px -55% 0px", // Trigger when section occupies primary viewing area
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const sections = ["hero", "vision", "problem", "architecture", "agents", "technology", "sectors", "economics", "roadmap", "research", "join", "manifesto"];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  const navLinks = [
    { name: "Vision", href: "#vision", id: "vision" },
    { name: "Architecture", href: "#architecture", id: "architecture" },
    { name: "Agents", href: "#agents", id: "agents" },
    { name: "Technology", href: "#technology", id: "technology" },
    { name: "Sectors", href: "#sectors", id: "sectors" },
    { name: "Economics", href: "#economics", id: "economics" },
    { name: "Research", href: "#research", id: "research" },
  ];

  return (
    <header
      className={`fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[1360px] z-50 rounded-full border border-white/5 bg-black/50 transition-all duration-300 backdrop-blur-[10px] ${
        isScrolled
          ? "h-16"
          : "h-20"
      }`}
    >
      <div className="w-full h-full px-6 md:px-10 flex items-center justify-between">
        {/* Logo */}
        <Link href="#" className="flex items-center gap-3 shrink-0 group">
          <img
            src="/assets/logo.png"
            alt="AEGIS Logo"
            className="h-8 w-auto filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] transition-transform duration-300 group-hover:scale-105 group-hover:rotate-6"
          />
          <span className="font-heading font-extrabold text-lg tracking-[0.2em] bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
            AEGIS
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center lg:gap-3 xl:gap-6 shrink-0">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`font-body font-medium tracking-wider transition-colors duration-350 relative py-1 after:absolute after:bottom-0 after:left-0 after:h-[1px] after:bg-white hover:after:w-full after:transition-all after:duration-300 text-[14px] lg:text-[13px] xl:text-[15px] ${
                activeSection === link.id
                  ? "text-white after:w-full font-semibold"
                  : "text-gray-400 after:w-0 hover:text-white"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Action Button & Search */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0">
          <button
            onClick={() => window.dispatchEvent(new Event("open-aegis-search"))}
            className="flex items-center justify-between gap-2 px-3 py-2 xl:px-4 xl:py-2.5 rounded-full border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer text-xs lg:text-[11px] xl:text-xs font-body font-medium tracking-wide w-44 lg:w-36 xl:w-44 text-left shrink-0"
            title="Search Index (⌘K)"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-gray-500" />
              <span>Search...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-white/10 bg-white/5 font-heading text-[9px] text-gray-500 font-bold">
              <span>⌘</span><span>K</span>
            </kbd>
          </button>
          <Link
            href="#join"
            className="btn-glass flex items-center gap-1.5 text-[10px] lg:text-[9.5px] xl:text-[11px] font-heading font-bold tracking-widest text-white px-3.5 py-2 lg:px-3 lg:py-2 xl:px-4 xl:py-2.5 shrink-0 transition-all duration-300 hover:bg-gradient-to-r hover:from-[#4D7CFE] hover:to-[#7DD3FC] hover:border-transparent hover:text-white hover:shadow-[0_0_15px_rgba(77,124,254,0.3)] group"
          >
            <span>JOIN NETWORK</span>
            <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="lg:hidden text-white hover:text-gray-300 transition-colors p-2"
          aria-label="Toggle Menu"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 left-0 w-full h-screen bg-[#000000]/98 backdrop-blur-2xl z-40 transition-all duration-500 ease-in-out lg:hidden flex flex-col justify-center items-center gap-8 ${
          isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Close indicator/control inside panel */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-6 right-6 text-white p-2"
        >
          <X className="w-8 h-8" />
        </button>

        <nav className="flex flex-col gap-6 text-center">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileOpen(false)}
              className="text-2xl font-heading font-bold text-gray-300 hover:text-white tracking-widest transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <Link
          href="#join"
          onClick={() => setIsMobileOpen(false)}
          className="btn-glass flex items-center gap-2 text-sm font-heading font-semibold tracking-widest text-white px-8 py-4"
        >
          JOIN NETWORK
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}
