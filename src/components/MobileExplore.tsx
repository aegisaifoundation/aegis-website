"use client";

import React, { useState } from "react";
import { Compass, X, Anchor } from "lucide-react";

export default function MobileExplore() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: "Vision", target: "#vision" },
    { label: "Problem", target: "#problem" },
    { label: "Architecture", target: "#architecture" },
    { label: "Agents", target: "#agents" },
    { label: "Technology", target: "#technology" },
    { label: "Sectors", target: "#sectors" },
    { label: "Economics", target: "#economics" },
    { label: "Research", target: "#research" },
    { label: "Join Network", target: "#join" },
    { label: "Manifesto", target: "#manifesto" }
  ];

  const handleJump = (target: string) => {
    setIsOpen(false);
    
    // Allow sheet closing animation, then scroll
    setTimeout(() => {
      const targetElement = document.querySelector(target);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 150);
  };

  return (
    <>
      {/* Floating Bottom Button: Visible on mobile only */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#4D7CFE] text-white font-heading font-bold text-xs tracking-[0.2em] uppercase shadow-[0_8px_30px_rgba(77,124,254,0.3)] border border-[#4D7CFE]/20 active:scale-95 transition-all cursor-pointer"
        >
          <Compass className="w-4 h-4 animate-spin-slow" />
          Explore
        </button>
      </div>

      {/* Bottom Sheet Modal overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end">
          {/* Backdrop click to close */}
          <div className="absolute inset-0 z-0" onClick={() => setIsOpen(false)} />

          {/* Bottom Sheet Drawer content */}
          <div className="relative z-10 w-full bg-[#080d16] border-t border-white/10 rounded-t-[32px] p-6 shadow-[0_-12px_40px_rgba(0,0,0,0.8)] max-h-[85vh] overflow-y-auto animate-slide-up flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="font-heading text-xs font-extrabold tracking-widest text-[#7DD3FC] uppercase flex items-center gap-1.5">
                <Anchor className="w-3.5 h-3.5" /> Navigate Infrastructure
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Anchors Menu List */}
            <nav className="flex flex-col gap-1.5 mb-8">
              {menuItems.map((item) => (
                <button
                  key={item.target}
                  onClick={() => handleJump(item.target)}
                  className="w-full text-left font-heading text-sm text-gray-300 active:bg-white/5 active:text-white transition-colors py-3.5 px-4 rounded-xl border border-transparent active:border-white/5"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
