"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Compass } from "lucide-react";

export default function SidebarUX() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Track reading progress percentage
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Run once initially
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { label: "Hero", target: "#hero" },
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
    const targetElement = document.querySelector(target);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 items-center gap-4">
      {/* Expanded Quick Jump Anchor Menu */}
      <div
        className={`bg-[#080d16]/90 border border-white/5 p-4 rounded-2xl flex flex-col gap-2 transition-all duration-300 shadow-[0_12px_24px_rgba(0,0,0,0.5)] origin-right ${
          isExpanded ? "scale-100 opacity-100 w-44" : "scale-90 opacity-0 w-0 pointer-events-none overflow-hidden"
        }`}
      >
        <span className="font-heading text-[9px] font-extrabold tracking-widest text-[#7DD3FC] uppercase mb-1 flex items-center gap-1">
          <Compass className="w-3 h-3" /> Quick Jump
        </span>
        {menuItems.map((item) => (
          <button
            key={item.target}
            onClick={() => handleJump(item.target)}
            className="w-full text-left font-body text-xs text-gray-400 hover:text-white transition-colors duration-200 py-1 border-b border-white/[0.02]"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Vertical Reading Progress Container */}
      <div className="flex flex-col items-center gap-3">
        {/* Toggle drawer control */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-8 h-8 rounded-full border border-white/10 bg-black/60 text-white flex items-center justify-center cursor-pointer hover:border-white/20 transition-all shadow-md"
          title="Toggle Navigation Menu"
        >
          {isExpanded ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Scroll indicator track */}
        <div className="w-[3px] h-32 bg-white/5 rounded-full overflow-hidden relative border border-white/5 shadow-inner">
          <div
            className="w-full bg-[#4D7CFE] transition-all duration-75 absolute top-0"
            style={{ height: `${scrollProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
