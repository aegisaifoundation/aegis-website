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
import Manifesto from "@/components/sections/Manifesto";
import JoinNetwork from "@/components/sections/JoinNetwork";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <LenisProvider>
      {/* Navigation */}
      <Navbar />

      {/* Main content layouts */}
      <main className="flex-1">
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
        <Manifesto />
        <JoinNetwork />
      </main>

      {/* Footer */}
      <Footer />
    </LenisProvider>
  );
}
