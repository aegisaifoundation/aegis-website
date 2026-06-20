"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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

  const navLinks = [
    { name: "Vision", href: "#vision" },
    { name: "Architecture", href: "#architecture" },
    { name: "Sectors", href: "#sectors" },
    { name: "Technology", href: "#technology" },
    { name: "Economics", href: "#economics" },
    { name: "Roadmap", href: "#roadmap" },
    { name: "Research", href: "#research" },
  ];

  return (
    <header
      className={`fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[1200px] z-50 rounded-full border border-white/8 bg-white/[0.03] transition-all duration-300 ${
        isScrolled
          ? "h-16 backdrop-blur-[30px]"
          : "h-20 backdrop-blur-[20px]"
      }`}
    >
      <div className="w-full h-full px-6 md:px-10 flex items-center justify-between">
        {/* Logo */}
        <Link href="#" className="flex items-center gap-3 group">
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
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-body text-gray-400 font-medium tracking-wider hover:text-white transition-colors duration-350 relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-white hover:after:w-full after:transition-all after:duration-300"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Action Button */}
        <div className="hidden lg:flex items-center">
          <Link
            href="#join"
            className="btn-glass flex items-center gap-2 text-xs font-heading font-semibold tracking-widest text-white px-6 py-3"
          >
            JOIN NETWORK
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
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
