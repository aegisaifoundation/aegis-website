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

export default function Home() {
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
        <Hero />
        <HeroTransition />
        <AgeOfIntelligence />
        <Vision />
        <Problem />
        <CoreArchitecture />
        <AgentEcosystem />
        <TechStack />
        <Sectors />
        <Economics />
        <Research />
        <Roadmap />
        <JoinNetwork />
        <Manifesto />
        <MinimalEnding />
      </main>
    </LenisProvider>
  );
}
