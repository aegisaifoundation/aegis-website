"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LogoReveal from "./LogoReveal";
import SilentSpace from "./SilentSpace";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function FinalEnding() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(containerRef.current);

      gsap.set(q(".logo-container"), { opacity: 0 });
      gsap.set(q(".explore-btn"), { opacity: 0, y: 15 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=220%",
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
        }
      });

      tl.to({}, { duration: 1.0 });

      tl.to(q(".logo-container"), {
        opacity: 1,
        duration: 1.5,
        ease: "power2.inOut"
      });

      tl.to({}, { duration: 0.6 });

      tl.to(q(".explore-btn"), {
        opacity: 0.4,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleExploreAgain = () => {
    const hero = document.getElementById("hero");
    if (hero) {
      hero.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div ref={containerRef} className="relative w-full min-h-screen bg-black overflow-hidden">
      <SilentSpace>
        <div className="logo-container">
          <LogoReveal />
        </div>

        <button
          onClick={handleExploreAgain}
          className="explore-btn absolute bottom-16 left-1/2 -translate-x-1/2 font-heading text-[10px] font-bold tracking-[0.4em] text-white hover:opacity-100 active:translate-y-0.5 transition-all duration-300 uppercase cursor-pointer"
        >
          Explore Again
        </button>
      </SilentSpace>
    </div>
  );
}
