"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import GlassPanel from "./GlassPanel";
import ThoughtQuote from "./ThoughtQuote";
import SectionReveal from "./SectionReveal";
import { TransitionState } from "@/hooks/useTransitionSequence";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface TransitionLayerProps {
  children: React.ReactNode;
  quoteTitle?: string;
  quoteSubtitle?: string;
  blurLevel: number;
  opacityLevel: number;
  pinDuration: number;
  animationDuration: number;
  alignment: "left" | "center" | "right";
  quoteSize: "small" | "medium" | "large" | "massive";
  sectionId?: string;
  mode: "Thought" | "Reflection" | "Manifesto" | "Silence";
}

export default function TransitionLayer({
  children,
  quoteTitle,
  quoteSubtitle,
  blurLevel,
  opacityLevel,
  pinDuration,
  animationDuration,
  alignment,
  quoteSize,
  sectionId,
  mode
}: TransitionLayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transitionState, setTransitionState] = useState<TransitionState>("Idle");

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const container = containerRef.current;
      if (!container) return;
      const q = gsap.utils.selector(container);

      if (!quoteTitle && pinDuration === 0) {
        return;
      }

      gsap.set(q(".glass-panel"), { y: "100%", opacity: 1 });
      gsap.set(q(".quote-title, .quote-subtitle"), { filter: "blur(20px)", y: 40, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "bottom bottom",
          end: `+=${pinDuration}%`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const progress = self.progress;
            if (progress === 0) {
              setTransitionState("Idle");
            } else if (progress > 0 && progress < 0.3) {
              setTransitionState("Rising");
            } else if (progress >= 0.3 && progress < 0.7) {
              setTransitionState("Reading");
            } else if (progress >= 0.7 && progress < 0.95) {
              setTransitionState("Dissolving");
            } else {
              setTransitionState("Revealing");
            }
          }
        }
      });

      if (mode === "Manifesto") {
        tl.to(q(".section-content"), {
          opacity: 0,
          y: -100,
          filter: "blur(15px)",
          duration: 1.0,
          ease: "power2.out"
        }, 0);
      } else {
        tl.to(q(".glass-panel"), { y: "0%", duration: animationDuration, ease: "power2.out" }, 0)
          .to(q(".section-content"), {
            opacity: 0,
            y: -100,
            filter: "blur(10px)",
            duration: animationDuration * 0.8,
            ease: "power2.out"
          }, 0);

        tl.to(q(".quote-title, .quote-subtitle"), {
          filter: "blur(0px)",
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 1.0,
          ease: "power2.out"
        }, "+=0.2");

        tl.to({}, { duration: 0.8 });

        tl.to(q(".quote-title, .quote-subtitle"), {
          filter: "blur(15px)",
          y: -30,
          opacity: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: "power2.in"
        });

        tl.to(q(".glass-panel"), {
          opacity: 0,
          duration: 0.6,
          ease: "power2.inOut"
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [quoteTitle, blurLevel, opacityLevel, pinDuration, animationDuration, mode]);

  return (
    <div
      ref={containerRef}
      id={sectionId}
      className="relative w-full min-h-screen bg-black overflow-hidden"
      data-transition-state={transitionState}
    >
      <SectionReveal>
        {children}
      </SectionReveal>

      {quoteTitle && mode !== "Manifesto" && (
        <>
          <GlassPanel blur={blurLevel} opacity={opacityLevel} />
          <ThoughtQuote title={quoteTitle} subtitle={quoteSubtitle} alignment={alignment} quoteSize={quoteSize} />
        </>
      )}
    </div>
  );
}
