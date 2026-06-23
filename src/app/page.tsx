"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import LenisProvider from "@/components/LenisProvider";

import Hero from "@/components/sections/Hero";
import HeroTransition from "@/components/transitions/HeroTransition";
import AgeOfIntelligence from "@/components/sections/AgeOfIntelligence";
import Vision from "@/components/sections/Vision";
import Problem from "@/components/sections/Problem";
import CoreArchitecture from "@/components/sections/CoreArchitecture";
import AgentEcosystem from "@/components/sections/AgentEcosystem";
import TechStack from "@/components/sections/TechStack";
import Sectors from "@/components/sections/Sectors";
import Economics from "@/components/sections/Economics";
import Research from "@/components/sections/Research";
import Roadmap from "@/components/sections/Roadmap";
import JoinNetwork from "@/components/sections/JoinNetwork";
import Manifesto from "@/components/sections/Manifesto";
import MinimalEnding from "@/components/ending/MinimalEnding";

import Universe from "@/components/background/Universe";
import SearchModal from "@/components/SearchModal";
import SidebarUX from "@/components/SidebarUX";
import MobileExplore from "@/components/MobileExplore";

import { db } from "@/config/firebase";
import { doc, onSnapshot } from "firebase/firestore";

const sectionComponents: Record<string, React.ComponentType> = {
  hero: Hero,
  ageOfIntelligence: AgeOfIntelligence,
  vision: Vision,
  problem: Problem,
  coreArchitecture: CoreArchitecture,
  agents: AgentEcosystem,
  technology: TechStack,
  sectors: Sectors,
  economics: Economics,
  research: Research,
  roadmap: Roadmap,
  join: JoinNetwork,
  manifesto: Manifesto,
};

const defaultHomeSections = [
  { id: "hero", name: "Hero Section", visible: true },
  { id: "ageOfIntelligence", name: "Age of Intelligence", visible: true },
  { id: "vision", name: "Vision Section", visible: true },
  { id: "problem", name: "Problem Section", visible: true },
  { id: "coreArchitecture", name: "Core Architecture Flow", visible: true },
  { id: "agents", name: "Agent Ecosystem Catalog", visible: true },
  { id: "technology", name: "Tech Stack Modules", visible: true },
  { id: "sectors", name: "Sectors Grid", visible: true },
  { id: "economics", name: "Network Revenue Economics", visible: true },
  { id: "roadmap", name: "Development Roadmap", visible: true },
  { id: "research", name: "Research Publications List", visible: true },
  { id: "join", name: "Join Network Form", visible: true },
  { id: "manifesto", name: "Manifesto Cinematic Reveal", visible: true }
];

export default function Home() {
  const [sections, setSections] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("aegis_homepage_layout");
      if (saved) return JSON.parse(saved);
    }
    return defaultHomeSections;
  });

  useEffect(() => {
    const docRef = doc(db, "website_pages", "home");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.sections) {
          setSections(data.sections);
          if (typeof window !== "undefined") {
            localStorage.setItem("aegis_homepage_layout", JSON.stringify(data.sections));
          }
        }
      }
    }, (err) => console.warn("Layout sync failed:", err));
    return unsubscribe;
  }, []);

  return (
    <LenisProvider>
      {/* Background Universe */}
      <Universe />

      {/* Spotlight/Raycast Search Console */}
      <SearchModal />

      {/* Desktop Navigation Helper */}
      <SidebarUX />

      {/* Mobile Navigation Sheet */}
      <MobileExplore />

      {/* Navigation Header Capsule */}
      <Navbar />

      {/* Main Content Layout (Standard Natural Scroll Flow) */}
      <main className="flex-1 relative z-10">
        {sections.map((section) => {
          if (!section.visible) return null;
          const Component = sectionComponents[section.id];
          if (!Component) return null;
          
          return (
            <div key={section.id}>
              <Component />
              {section.id === "hero" && <HeroTransition />}
            </div>
          );
        })}
        <MinimalEnding />
      </main>
    </LenisProvider>
  );
}
