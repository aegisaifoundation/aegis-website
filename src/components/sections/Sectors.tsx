"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Activity, Landmark, Sprout, GraduationCap, Microscope, ShieldCheck, Factory, ShoppingCart, Zap, Truck, Phone, TreePine, Building2, Scale, Play, UserCheck, Home, Blocks, FlaskConical, X, ExternalLink, FileText } from "lucide-react";

interface SectorItem {
  title: string;
  icon: React.ComponentType<any>;
  problem: string;
  benefits: string;
  revenue: string;
  category: string;
  details: string;
}

export default function Sectors() {
  const [activeTab, setActiveTab] = useState<string>("All");
  const [selectedSector, setSelectedSector] = useState<SectorItem | null>(null);

  React.useEffect(() => {
    const handleSelectSector = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (!customEvent.detail) return;
      const found = sectors.find(
        (sec) => sec.title.toLowerCase() === customEvent.detail.toLowerCase()
      );
      if (found) {
        setSelectedSector(found);
      }
    };
    window.addEventListener("select-sector", handleSelectSector);
    return () => window.removeEventListener("select-sector", handleSelectSector);
  }, []);

  const tabs = ["All", "Healthcare", "Banking", "Education", "Research", "Manufacturing", "Government", "Agriculture"];

  const sectors: SectorItem[] = [
    { title: "Healthcare", icon: Activity, problem: "Data siloes impede accurate diagnoses.", benefits: "Privacy-preserving model fine-tuning.", revenue: "$240B potential size", category: "Healthcare", details: "Detailed diagnostic weight alignment specs and node hardware benchmarks for hospital installations. Aegis coordinates node enclaves to compute gradients homomorphically, ensuring zero patient record exposure." },
    { title: "Banking", icon: Landmark, problem: "Rampant transaction fraud leaks capital.", benefits: "Real-time outlier network alerts.", revenue: "$180B potential size", category: "Banking", details: "Federated transaction pattern modeling and secure homomorphic anomaly detection system data sheets. Leverages zero-knowledge proofs to coordinate fraud detection parameters across regional bank enclaves." },
    { title: "Agriculture", icon: Sprout, problem: "Erratic local crop yield yields.", benefits: "Localized soil & weather sensor models.", revenue: "$90B potential size", category: "Agriculture", details: "Distributed sensor node network details, local model weights adjustment schemas, and regional crop forecast charts based on decentralized satellite telemetry." },
    { title: "Education", icon: GraduationCap, problem: "Rigid static course curricula.", benefits: "Dynamic personalized student models.", revenue: "$120B potential size", category: "Education", details: "Student vector alignment pipelines, custom LoRA generation specs, and secure knowledge graph retrieval schemas running on university node arrays." },
    { title: "Research", icon: Microscope, problem: "Slow empirical validation cycles.", benefits: "Automated simulation synthesis.", revenue: "$150B potential size", category: "Research", details: "Academic cluster computing specifications, ZK proof gradient validations, and public data source integration specs for open-source model replication." },
    { title: "Insurance", icon: ShieldCheck, problem: "High claim validation backlogs.", benefits: "Dynamic actuarial model assessment.", revenue: "$140B potential size", category: "Banking", details: "Dynamic actuarial model parameters, risk prediction vector formulas, and verified compute ledger audits executed automatically by smart insurance agents." },
    { title: "Manufacturing", icon: Factory, problem: "Unplanned device system failures.", benefits: "Predictive asset lifecycle tracking.", revenue: "$165B potential size", category: "Manufacturing", details: "Industrial telemetry parsing adaptors, machine predictive maintenance models, and edge compute requirements for local factory servers." },
    { title: "Retail", icon: ShoppingCart, problem: "Mismatched supply and demands.", benefits: "Dynamic predictive ordering pipelines.", revenue: "$210B potential size", category: "Manufacturing", details: "Consensus inventory tracking pipelines, distribution optimization charts, and retail node coordination vectors for cross-company logistic nodes." },
    { title: "Energy", icon: Zap, problem: "Inefficient electrical distribution.", benefits: "Smart grid flow load prediction.", revenue: "$130B potential size", category: "Manufacturing", details: "Grid network coordinate load prediction systems, localized energy storage routing, and real-time consumption node telemetry parameters." },
    { title: "Transportation", icon: Truck, problem: "Sub-optimal vehicle routes.", benefits: "Federated coordinate navigation.", revenue: "$115B potential size", category: "Manufacturing", details: "Federated navigation nodes coordination protocols, real-time traffic routing vectors, and vehicle telemetry integration latency benchmarks." },
    { title: "Telecom", icon: Phone, problem: "Bandwidth drop-offs during spikes.", benefits: "Dynamic cell router allocations.", revenue: "$95B potential size", category: "Government", details: "SDR cell tower routing algorithms, dynamic network load balancing systems, and edge cell node hardware requirements for municipal grids." },
    { title: "Environment", icon: TreePine, problem: "Delayed forest fire warning times.", benefits: "Sensor networks processing locally.", revenue: "$80B potential size", category: "Agriculture", details: "Low-power edge sensing parameters, automated infrared alert classification, and local alert nodes mesh designs for national forest parks." },
    { title: "Government", icon: Building2, problem: "High administrative filing friction.", benefits: "Automated document sorting pipelines.", revenue: "$175B potential size", category: "Government", details: "Secured federal document indexing modules, automated translation pipelines, and localized public data nodes complying with federal audit rules." },
    { title: "Legal", icon: Scale, problem: "Laborious document review cycles.", benefits: "Fast precedent search & matching.", revenue: "$85B potential size", category: "Government", details: "Semantic legal vector embeddings, court precedent citation indices, and secure case search enclaves for municipal law centers." },
    { title: "Media", icon: Play, problem: "Low context recommendations.", benefits: "Deep semantic interest vectoring.", revenue: "$110B potential size", category: "Education", details: "Secure local interest vectoring, conceptual movie/text mapping databases, and cross-node similarity indexes that avoid storing user history." },
    { title: "HR", icon: UserCheck, problem: "Out-of-date candidate reviews.", benefits: "Automated resume parsing/ranking.", revenue: "$70B potential size", category: "Education", details: "Structured candidate qualification parse protocols, skill vector indexing, and automated interview simulation agents for screening." },
    { title: "Real Estate", icon: Home, problem: "Mismatched property valuations.", benefits: "Predictive yield modeling indices.", revenue: "$105B potential size", category: "Banking", details: "Predictive valuation indices, local market factor weighting vectors, and node coordinate verification rules for land title registries." },
    { title: "Supply Chain", icon: Blocks, problem: "Frequent port delivery backlogs.", benefits: "Consensus cargo routing vectors.", revenue: "$160B potential size", category: "Manufacturing", details: "Global port freight coordinate tracking ledger, multi-node supply routing optimization, and node latency stats for maritime grids." },
    { title: "Pharmaceuticals", icon: FlaskConical, problem: "Long molecular discovery timelines.", benefits: "Automated chemical screening loops.", revenue: "$225B potential size", category: "Healthcare", details: "Molecular binding energy prediction networks, automated synthesis validation loops, and clinical trial enclaves for collaborative pharma nodes." },
  ];

  const filteredSectors = activeTab === "All" 
    ? sectors 
    : sectors.filter(sec => sec.category.toLowerCase() === activeTab.toLowerCase());

  return (
    <section 
      className="relative min-h-screen py-40 flex flex-col items-center justify-center bg-transparent border-b border-white/5"
      id="sectors"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_20%,rgba(77,124,254,0.02)_0%,transparent_50%)] pointer-events-none" />

      <div className="max-w-[80rem] mx-auto w-full px-6 md:px-12 flex flex-col items-center relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mb-12">
          <span className="font-heading text-xs font-bold tracking-[0.3em] text-[#4D7CFE] mb-4 block uppercase">
            APPLICATIONS
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-white mb-6 leading-tight">
            Sectors Empowered By AEGIS
          </h2>
          <p className="font-body text-base text-gray-400 font-light leading-relaxed">
            Aegis provides specialized solutions tailored for global industries. Choose a sector category and select a card to explore deep-technical node structures.
          </p>
        </div>

        {/* Tab Filter Capsule List */}
        <div className="flex flex-wrap justify-center gap-2 mb-12 max-w-4xl w-full border-b border-white/5 pb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4.5 py-2.5 rounded-full text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-[#4D7CFE] text-white shadow-md shadow-[#4D7CFE]/20"
                  : "bg-white/5 border border-white/5 text-gray-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filtered Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 w-full mb-16">
          <AnimatePresence mode="popLayout">
            {filteredSectors.map((sec, idx) => {
              const Icon = sec.icon;
              return (
                <motion.div
                  key={sec.title}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <button
                    onClick={() => setSelectedSector(sec)}
                    className="group block w-full h-full text-left glass-card glass-card-hover p-5 cursor-pointer"
                  >
                    {/* Icon */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 text-[#7DD3FC] flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-heading font-bold text-sm text-white tracking-wider uppercase group-hover:text-[#7DD3FC] transition-colors duration-300">
                        {sec.title}
                      </h3>
                    </div>

                    {/* Short Details */}
                    <div className="border-t border-white/5 pt-3">
                      <span className="font-heading text-[8px] font-extrabold tracking-widest text-gray-500 uppercase block mb-0.5">
                        PROBLEM
                      </span>
                      <p className="font-body text-[10px] text-gray-400 leading-normal font-light line-clamp-2">
                        {sec.problem}
                      </p>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Progressive Disclosure Modal */}
        <AnimatePresence>
          {selectedSector && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              {/* Backdrop Click Close */}
              <div className="absolute inset-0" onClick={() => setSelectedSector(null)} />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative z-10 w-full max-w-lg bg-[#080d16] border border-white/10 p-8 rounded-3xl shadow-[0_24px_50px_rgba(0,0,0,0.8)] text-left flex flex-col gap-6"
              >
                {/* Modal Close */}
                <button
                  onClick={() => setSelectedSector(null)}
                  className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer"
                  title="Close Modal"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 text-[#7DD3FC] flex items-center justify-center shrink-0">
                    {React.createElement(selectedSector.icon, { className: "w-6 h-6" })}
                  </div>
                  <div>
                    <span className="font-heading text-[9px] font-bold tracking-widest text-gray-500 uppercase">
                      {selectedSector.category} Node
                    </span>
                    <h3 className="font-heading font-extrabold text-xl text-white tracking-wider">
                      {selectedSector.title}
                    </h3>
                  </div>
                </div>

                {/* Problem & Benefit */}
                <div className="flex flex-col gap-3.5 border-y border-white/5 py-4">
                  <div>
                    <span className="font-heading text-[8px] font-extrabold tracking-widest text-red-400 uppercase block mb-0.5">
                      Problem Statement
                    </span>
                    <p className="font-body text-xs text-gray-400 font-light leading-relaxed">
                      {selectedSector.problem}
                    </p>
                  </div>
                  <div>
                    <span className="font-heading text-[8px] font-extrabold tracking-widest text-emerald-400 uppercase block mb-0.5">
                      Cooperative Benefit
                    </span>
                    <p className="font-body text-xs text-gray-300 font-light leading-relaxed">
                      {selectedSector.benefits}
                    </p>
                  </div>
                </div>

                {/* Progressive Deep Dive */}
                <div>
                  <span className="font-heading text-[8px] font-extrabold tracking-widest text-[#4D7CFE] uppercase block mb-1">
                    Technical Specifications
                  </span>
                  <p className="font-body text-xs text-gray-400 font-light leading-relaxed">
                    {selectedSector.details}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
                  <div>
                    <span className="font-heading text-[8px] tracking-widest text-gray-500 uppercase block">
                      Revenue Potential
                    </span>
                    <span className="font-heading text-sm font-bold text-[#7DD3FC]">
                      {selectedSector.revenue}
                    </span>
                  </div>
                  
                  {/* Dedicated Page / Whitepaper links */}
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/sectors/${selectedSector.title.toLowerCase().replace(" ", "-")}`}
                      className="flex items-center gap-1.5 font-heading text-[10px] font-semibold text-white/60 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open Page
                    </Link>
                    <Link
                      href={`/whitepapers/sectors/${selectedSector.title.toLowerCase().replace(" ", "-")}.pdf`}
                      className="flex items-center gap-1.5 font-heading text-[10px] font-semibold text-white bg-[#4D7CFE] hover:bg-[#3d6cee] transition-colors px-3 py-1.5 rounded-lg"
                    >
                      <FileText className="w-3 h-3" />
                      Whitepaper
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Related Topics Exploration Footer */}
        <div className="mt-20 pt-8 border-t border-white/5 w-full max-w-4xl text-center">
          <span className="font-heading text-[10px] font-extrabold tracking-widest text-gray-500 uppercase block mb-4">
            Related Topics
          </span>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="#economics" className="font-heading text-xs font-bold text-[#7DD3FC] hover:text-white transition-colors uppercase tracking-wider">
              Economics & Monetization
            </Link>
            <Link href="#join" className="font-heading text-xs font-bold text-[#7DD3FC] hover:text-white transition-colors uppercase tracking-wider">
              Join Network & Run Node
            </Link>
            <Link href="#research" className="font-heading text-xs font-bold text-[#7DD3FC] hover:text-white transition-colors uppercase tracking-wider">
              Research Papers
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
