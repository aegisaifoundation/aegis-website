import Navbar from "@/components/Navbar";
import LenisProvider from "@/components/LenisProvider";

import Hero from "@/components/sections/Hero";
import AgeOfIntelligence from "@/components/sections/AgeOfIntelligence";
import Problem from "@/components/sections/Problem";
import Vision from "@/components/sections/Vision";
import WhatIsAegis from "@/components/sections/WhatIsAegis";
import CoreArchitecture from "@/components/sections/CoreArchitecture";
import AgentEcosystem from "@/components/sections/AgentEcosystem";
import Sectors from "@/components/sections/Sectors";
import TechStack from "@/components/sections/TechStack";
import Economics from "@/components/sections/Economics";
import Roadmap from "@/components/sections/Roadmap";
import Research from "@/components/sections/Research";
import JoinNetwork from "@/components/sections/JoinNetwork";
import Manifesto from "@/components/sections/Manifesto";
import FinalEnding from "@/components/ending/FinalEnding";

import Universe from "@/components/background/Universe";
import Atmosphere from "@/components/background/Atmosphere";
import TransitionManager from "@/components/transitions/TransitionManager";

export default function Home() {
  return (
    <LenisProvider>
      {/* Background Universe */}
      <Universe />

      {/* Atmosphere Audio Controls */}
      <Atmosphere />

      {/* Navigation */}
      <Navbar />

      {/* Main content layouts wrapped in TransitionManager */}
      <main className="flex-1 relative z-10">
        <TransitionManager>
          <Hero />
          <AgeOfIntelligence />
          <Problem />
          <Vision />
          <WhatIsAegis />
          <CoreArchitecture />
          <AgentEcosystem />
          <Sectors />
          <TechStack />
          <Economics />
          <Roadmap />
          <Research />
          <JoinNetwork />
          <Manifesto />
          <FinalEnding />
        </TransitionManager>
      </main>
    </LenisProvider>
  );
}
