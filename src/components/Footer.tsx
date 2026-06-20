"use client";

import Link from "next/link";
import { ArrowUp } from "lucide-react";

export default function Footer() {
  const links = [
    { name: "Vision", href: "#vision" },
    { name: "Architecture", href: "#architecture" },
    { name: "Sectors", href: "#sectors" },
    { name: "Technology", href: "#technology" },
    { name: "Research", href: "#research" },
    { name: "Manifesto", href: "#manifesto" },
  ];

  const socials = [
    {
      name: "Twitter",
      href: "https://x.com/aegis",
      svg: (
        <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
        </svg>
      )
    },
    {
      name: "GitHub",
      href: "https://github.com/aegis",
      svg: (
        <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
          <path d="M9 18c-4.51 2-5-2-7-2" />
        </svg>
      )
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com/company/aegis",
      svg: (
        <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      )
    }
  ];

  return (
    <footer className="relative bg-[#020408] border-t border-white/5 py-16 md:py-24 overflow-hidden z-10 animate-fade-in">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80vw] h-[300px] bg-[#4D7CFE]/3 blur-[120px] pointer-events-none rounded-full z-0" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10 flex flex-col items-center">
        
        {/* Scroll To Top button */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="w-12 h-12 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white flex items-center justify-center transition-all duration-300 hover:-translate-y-1 mb-16 cursor-pointer"
          aria-label="Scroll to Top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>

        {/* Large Brand Visual Footer */}
        <div className="flex flex-col items-center text-center max-w-xl mb-16">
          <div className="flex items-center gap-4 mb-6 group">
            <img
              src="/assets/logo.png"
              alt="AEGIS Logo"
              className="h-10 w-auto filter drop-shadow-[0_0_12px_rgba(255,255,255,0.3)] transition-transform duration-300 group-hover:scale-105"
            />
            <span className="font-heading font-extrabold text-2xl tracking-[0.25em] bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent uppercase">
              AEGIS
            </span>
          </div>
          
          <span className="font-heading text-xs font-bold tracking-[0.25em] text-[#7DD3FC] mb-4 uppercase">
            INTELLIGENCE INFRASTRUCTURE
          </span>
          
          <p className="font-body text-sm text-gray-400 font-light leading-relaxed">
            Building Intelligence Through Connection. Supporting a global, distributed collective intelligence paradigm.
          </p>
        </div>

        {/* Links Grid */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-16">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-xs font-heading font-semibold tracking-widest text-gray-400 hover:text-white transition-colors uppercase relative py-1"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Social Icons */}
        <div className="flex gap-6 mb-12">
          {socials.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-white/5 bg-white/[0.01] hover:bg-white/5 hover:border-white/15 text-gray-400 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-105"
              title={social.name}
            >
              {social.svg}
            </a>
          ))}
        </div>

        {/* Copyright */}
        <div className="text-center border-t border-white/5 pt-8 w-full text-[10px] text-gray-600 font-body">
          &copy; {new Date().getFullYear()} AEGIS PROTOCOL. ALL RIGHTS RESERVED. INVENTED BY CONNECTED COMMUNITIES.
        </div>

      </div>
    </footer>
  );
}
