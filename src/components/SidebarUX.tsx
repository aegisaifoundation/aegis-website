"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronRight, ChevronLeft, Compass } from "lucide-react";

export default function SidebarUX() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showArrow, setShowArrow] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Proximity reveal when not hovered
  useEffect(() => {
    if (isHovered) return;

    const handleMouseMove = (e: MouseEvent) => {
      const screenWidth = window.innerWidth;
      const distance = screenWidth - e.clientX;

      // Show the launcher arrow when cursor is within 80px of the rightmost edge
      if (distance < 80) {
        setShowArrow(true);
      } else {
        setShowArrow(false);
      }

      // Expand the navigation menu when cursor is within 40px of the rightmost edge
      if (distance < 40) {
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current);
          closeTimeoutRef.current = null;
        }
        setIsExpanded(true);
      } else if (!isHovered) {
        // If not hovering the element, collapse the menu when cursor moves away
        setIsExpanded(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isHovered]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
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

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsHovered(true);
    setIsExpanded(true);
    setShowArrow(true);
  };

  const handleMouseLeave = () => {
    // Add a 300ms transition delay to handle accidental mouse slips gracefully
    closeTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      setIsExpanded(false);
      setShowArrow(false);
    }, 300);
  };

  return (
    <div
      className="hidden lg:flex fixed right-0 top-1/2 -translate-y-1/2 z-40 items-center pl-16 pr-4 py-8 bg-transparent"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Expanded Quick Jump Anchor Menu */}
      <div
        className={`bg-[#080d16]/95 border border-white/5 p-4 rounded-2xl flex flex-col gap-2 transition-all duration-300 shadow-[0_12px_32px_rgba(0,0,0,0.6)] origin-right ${
          isExpanded
            ? "scale-100 opacity-100 w-44 translate-x-0 pointer-events-auto"
            : "scale-90 opacity-0 w-0 translate-x-4 pointer-events-none overflow-hidden"
        }`}
      >
        <span className="font-heading text-[9px] font-extrabold tracking-widest text-[#7DD3FC] uppercase mb-1 flex items-center gap-1">
          <Compass className="w-3 h-3 animate-spin-slow" /> Quick Jump
        </span>
        {menuItems.map((item) => (
          <button
            key={item.target}
            onClick={() => handleJump(item.target)}
            className="w-full text-left font-body text-xs text-gray-400 hover:text-white transition-colors duration-200 py-1 border-b border-white/[0.02] cursor-pointer"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Sleek Chevron Arrow indicator: only appears when showArrow is true */}
      <div
        className={`flex items-center justify-center ml-3 transition-all duration-300 ${
          showArrow ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
        }`}
      >
        <div
          className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white transition-colors duration-200 cursor-pointer"
          title="Quick Jump Menu"
        >
          {isExpanded ? (
            <ChevronRight className="w-5 h-5 text-white/80" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-white/80" />
          )}
        </div>
      </div>
    </div>
  );
}
