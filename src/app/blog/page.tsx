"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Universe from "@/components/background/Universe";
import MinimalEnding from "@/components/ending/MinimalEnding";
import { ArrowLeft, BookOpen, Cpu, Calendar, User } from "lucide-react";
import { useCardContent } from "@/config/cardContent";
import { useGeneralContent } from "@/config/generalContent";

export default function BlogAndSubsystemsPage() {
  const { subsystems = [] } = useCardContent();
  const { blogEssay } = useGeneralContent();
  const [activeEngine, setActiveEngine] = useState<number>(1);

  const essayParagraphs = blogEssay?.paragraphs
    ? blogEssay.paragraphs.split(/\n\s*\n/).filter(Boolean)
    : [
        "In an era dominated by centralized artificial intelligence giants, a critical question looms: Can we build a global collective intelligence without sacrificing local sovereignty, data ownership, and individual privacy?",
        "The answer is AEGIS.",
        "AEGIS (Advanced Engine for General Intelligence and Sovereignty) represents a paradigm shift in how AI models are executed, optimized, and connected. It is a production-grade, decentralized platform designed to keep raw data firmly under the user's control while enabling sovereign nodes to securely collaborate, learn, and grow together."
      ];

  const activeSubsystem = subsystems[activeEngine - 1];
  const featuresList = activeSubsystem?.features
    ? typeof activeSubsystem.features === "string"
      ? activeSubsystem.features.split(",").map(f => f.trim())
      : activeSubsystem.features
    : [];

  return (
    <div className="relative min-h-screen bg-black text-white font-body selection:bg-[#4D7CFE] selection:text-white">
      {/* Background stars */}
      <Universe />
      
      <Navbar />

      <main className="relative z-10 max-w-[1000px] mx-auto px-6 md:px-12 pt-32 pb-24 flex flex-col gap-16">
        
        {/* Back Link */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white tracking-widest uppercase transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Blog Post Core Container */}
        <article className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
          <header className="flex flex-col gap-4 text-center border-b border-white/5 pb-8">
            <span className="font-heading text-xs font-bold tracking-[0.45em] text-[#7DD3FC] uppercase">
              PLATFORM SPOTLIGHT
            </span>
            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl leading-tight text-white uppercase tracking-wide">
              {blogEssay?.title || "Demystifying AEGIS:"}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4D7CFE] to-[#7DD3FC]">
                {blogEssay?.subtitle || "The Sovereign, Privacy-First Collective Intelligence Network"}
              </span>
            </h1>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400 font-medium mt-2">
              <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {blogEssay?.author || "AEGIS AI Foundation"}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {blogEssay?.date || "June 2026"}</span>
              <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> {blogEssay?.readTime || "8 min read"}</span>
            </div>
          </header>

          {/* Section 1: Intro */}
          <div className="text-sm md:text-base text-gray-300 leading-relaxed font-light flex flex-col gap-6">
            {essayParagraphs.map((para, idx) => {
              if (para.includes("The answer is AEGIS")) {
                return (
                  <p key={idx} className="font-semibold text-white text-base font-heading pl-4 border-l-2 border-[#4D7CFE]">
                    {para}
                  </p>
                );
              }
              return (
                <p key={idx}>
                  {para}
                </p>
              );
            })}
          </div>

          {/* Section 2: Interactive Subsystem Showcase */}
          <section className="my-10 border border-white/5 bg-white/[0.01] p-6 md:p-8 rounded-3xl flex flex-col gap-8">
            <div className="text-center md:text-left">
              <span className="text-[10px] font-bold text-[#7DD3FC] tracking-widest uppercase block mb-1">
                SYSTEM CORE ARCHITECTURE
              </span>
              <h2 className="font-heading font-extrabold text-2xl text-white">
                The 9 Foundational Core Engines
              </h2>
              <p className="text-xs text-gray-500 font-light mt-1">
                AEGIS operates via a modular double-engine design, separating TS orchestrators from native C++20 background runtime nodes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8 items-start">
              {/* Engine Tabs */}
              <div className="flex flex-col gap-1.5 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
                {subsystems.map((sub, idx) => (
                  <button
                    key={sub.id || idx}
                    onClick={() => setActiveEngine(idx + 1)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      activeEngine === idx + 1
                        ? "bg-[#4D7CFE]/15 border-[#4D7CFE] text-white shadow-md shadow-[#4D7CFE]/5"
                        : "bg-white/[0.01] border-white/5 text-gray-500 hover:text-white"
                    }`}
                  >
                    {sub.short}
                  </button>
                ))}
              </div>

              {/* Engine Display Screen */}
              <div className="p-6 md:p-8 bg-black/40 border border-white/5 rounded-2xl flex flex-col gap-5 min-h-[280px] justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#4D7CFE]/5 rounded-full blur-3xl pointer-events-none" />
                
                <div>
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-[#4D7CFE]/10 border border-[#4D7CFE]/20 text-[#7DD3FC] flex items-center justify-center">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[8px] font-mono font-bold text-gray-500 uppercase tracking-widest">
                        AEGIS ENGINE SUB-NAMESPACE {activeEngine}
                      </span>
                      <h3 className="font-heading font-extrabold text-base text-white tracking-wide uppercase">
                        {activeSubsystem?.name}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs md:text-sm text-gray-400 leading-relaxed font-light">
                    {activeSubsystem?.desc}
                  </p>
                </div>

                <div>
                  <span className="text-[8px] font-heading font-extrabold tracking-widest text-[#7DD3FC] uppercase block mb-2.5">
                    Subsystem Feature Capabilities
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {featuresList.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-[10.5px] text-gray-300 font-light">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Gaps & Problems Solved */}
          <div className="text-sm md:text-base text-gray-300 leading-relaxed font-light flex flex-col gap-8">
            <div>
              <h2 className="font-heading font-extrabold text-xl text-white mb-4 uppercase tracking-wider">
                The Real Problems AEGIS Solves
              </h2>
              <p className="mb-4">
                Centralized cloud AI has structural limitations that are increasingly hitting walls. AEGIS directly resolves these pain points:
              </p>
              
              <ul className="flex flex-col gap-4 mt-6">
                <li className="flex gap-4.5 items-start">
                  <span className="w-2 h-2 rounded-full bg-[#4D7CFE] mt-2 shrink-0" />
                  <div>
                    <strong className="text-white block font-heading text-xs sm:text-sm uppercase tracking-wide">Privacy Violations</strong>
                    <span className="text-xs text-gray-400 mt-0.5 block leading-relaxed font-light">
                      Centralized models require uploading raw customer databases, medical charts, or intellectual property to external clouds. AEGIS operates entirely locally, processing data and refining models on the user's machine.
                    </span>
                  </div>
                </li>
                
                <li className="flex gap-4.5 items-start">
                  <span className="w-2 h-2 rounded-full bg-[#4D7CFE] mt-2 shrink-0" />
                  <div>
                    <strong className="text-white block font-heading text-xs sm:text-sm uppercase tracking-wide">Decentralized Coordination without Data Sharing</strong>
                    <span className="text-xs text-gray-400 mt-0.5 block leading-relaxed font-light">
                      Previously, training collaborative models required consolidating datasets. AEGIS utilizes Federated & Swarm Learning to train models across independent nodes. Only model weight updates are transmitted; raw data never leaves the node.
                    </span>
                  </div>
                </li>

                <li className="flex gap-4.5 items-start">
                  <span className="w-2 h-2 rounded-full bg-[#4D7CFE] mt-2 shrink-0" />
                  <div>
                    <strong className="text-white block font-heading text-xs sm:text-sm uppercase tracking-wide">The Cost of Centralized APIs</strong>
                    <span className="text-xs text-gray-400 mt-0.5 block leading-relaxed font-light">
                      Subscribing to external APIs introduces latency, usage restrictions, and exponential scaling costs. AEGIS routes execution through local hardware backends (like Ollama or GGUF files) and utilizes distributed peer execution to split complex tasks.
                    </span>
                  </div>
                </li>

                <li className="flex gap-4.5 items-start">
                  <span className="w-2 h-2 rounded-full bg-[#4D7CFE] mt-2 shrink-0" />
                  <div>
                    <strong className="text-white block font-heading text-xs sm:text-sm uppercase tracking-wide">The "Cold Start" of Agent Performance</strong>
                    <span className="text-xs text-gray-400 mt-0.5 block leading-relaxed font-light">
                      When a new agent or node joins a network, it must learn from scratch. AEGIS shares distilled Knowledge Objects and reasoning templates through the Collaboration Engine, allowing a new node to immediately leverage peer insights without access to their training data.
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Section 4: Enterprise Vertical Customers */}
            <div className="mt-6">
              <h2 className="font-heading font-extrabold text-xl text-white mb-4 uppercase tracking-wider">
                Who Are The Real Customers?
              </h2>
              <p className="mb-4">
                AEGIS is configured to serve distinct, privacy-sensitive customer sectors:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="p-5 border border-white/5 rounded-2xl bg-white/[0.005]">
                  <h3 className="font-heading font-bold text-xs text-[#7DD3FC] uppercase tracking-wide mb-1.5">Healthcare Systems</h3>
                  <p className="text-[11.5px] text-gray-400 leading-normal font-light">
                    Hospitals run private nodes, processing patient scans locally, and share distilled insights with peer hospitals securely without exposing medical records.
                  </p>
                </div>
                
                <div className="p-5 border border-white/5 rounded-2xl bg-white/[0.005]">
                  <h3 className="font-heading font-bold text-xs text-[#7DD3FC] uppercase tracking-wide mb-1.5">Defense & Government</h3>
                  <p className="text-[11.5px] text-gray-400 leading-normal font-light">
                    Sovereign agencies deploy air-gapped, always-local P2P network clusters to process drone telemetry and share specialized strategies safely.
                  </p>
                </div>

                <div className="p-5 border border-white/5 rounded-2xl bg-white/[0.005]">
                  <h3 className="font-heading font-bold text-xs text-[#7DD3FC] uppercase tracking-wide mb-1.5">Enterprise & Finance</h3>
                  <p className="text-[11.5px] text-gray-400 leading-normal font-light">
                    Software companies and banks host local enclaves to serve developers, specializing nodes into programming and fraud analytics specialists securely.
                  </p>
                </div>

                <div className="p-5 border border-white/5 rounded-2xl bg-white/[0.005]">
                  <h3 className="font-heading font-bold text-xs text-[#7DD3FC] uppercase tracking-wide mb-1.5">Academic Researchers</h3>
                  <p className="text-[11.5px] text-gray-400 leading-normal font-light">
                    University centers combine local GPU compute resources for swarm training epochs without centralized ownership or scaling bottlenecks.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 5: Conclusion */}
            <div className="mt-8 border-t border-white/5 pt-8 text-center flex flex-col gap-4">
              <h2 className="font-heading font-extrabold text-xl text-white uppercase tracking-wider">
                The Cognitive Evolution Loop
              </h2>
              <p className="max-w-2xl mx-auto text-xs sm:text-sm text-gray-400 leading-relaxed font-light">
                Traditional AI systems perform task execution as a transient process. AEGIS converts execution into evolution:
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-1.5 font-mono text-[9px] sm:text-[10px] text-[#10B981] font-semibold mt-2">
                <span>EXECUTION</span>
                <span>&rarr;</span>
                <span>EXPERIENCE</span>
                <span>&rarr;</span>
                <span>REFLECTION</span>
                <span>&rarr;</span>
                <span>KNOWLEDGE</span>
                <span>&rarr;</span>
                <span>VALIDATION</span>
                <span>&rarr;</span>
                <span>COLLECTIVE MEMORY</span>
                <span>&rarr;</span>
                <span>RECOMMENDATION</span>
              </div>
              
              <p className="text-xs text-gray-500 font-light max-w-xl mx-auto mt-2 leading-relaxed">
                By closing this loop, the AEGIS network grows more intelligent with every task solved, creating a global, sovereign, and privacy-preserving brain.
              </p>
            </div>
          </div>
        </article>
      </main>

      <MinimalEnding />
    </div>
  );
}
