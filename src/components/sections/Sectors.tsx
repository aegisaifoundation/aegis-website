"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Activity, Landmark, Sprout, GraduationCap, Microscope, ShieldCheck, Factory, ShoppingCart, Zap, Truck, Phone, TreePine, Building2, Scale, Play, UserCheck, Home, Blocks, FlaskConical, X, ExternalLink, FileText } from "lucide-react";
import { useCardContent } from "@/config/cardContent";
import { useGeneralContent } from "@/config/generalContent";

interface SectorItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  problem: string;
  benefits: string;
  revenue: string;
  category: string;
  details: string;
}

export default function Sectors() {
  const { sectors: sectorsContent } = useGeneralContent();
  const [activeTab, setActiveTab] = useState<string>("All");
  const [selectedSector, setSelectedSector] = useState<SectorItem | null>(null);
  const { sectors: savedSectors } = useCardContent();

  const icons: Record<string, React.ComponentType<{ className?: string }>> = { 
    Healthcare: Activity, 
    Banking: Landmark, 
    Agriculture: Sprout, 
    Education: GraduationCap, 
    Research: Microscope, 
    Insurance: ShieldCheck, 
    Manufacturing: Factory, 
    Retail: ShoppingCart, 
    Energy: Zap, 
    Transportation: Truck, 
    Telecom: Phone, 
    Environment: TreePine, 
    Government: Building2, 
    Legal: Scale, 
    Media: Play, 
    HR: UserCheck, 
    "Real Estate": Home, 
    "Supply Chain": Blocks, 
    Pharmaceuticals: FlaskConical 
  };

  const sectors: SectorItem[] = savedSectors.map((sector) => ({ 
    ...sector, 
    icon: icons[sector.title] || Blocks 
  }));

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
  }, [sectors]);

  const tabs = ["All", "Healthcare", "Banking", "Education", "Research", "Manufacturing", "Government", "Agriculture"];

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
            {sectorsContent.badge}
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-white mb-6 leading-tight">
            {sectorsContent.title}
          </h2>
          <p className="font-body text-base text-gray-400 font-light leading-relaxed">
            {sectorsContent.description}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full mb-16">
          <AnimatePresence mode="popLayout">
            {filteredSectors.map((sec) => {
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
                    className="group block w-full h-full text-left glass-card glass-card-hover p-6 cursor-pointer"
                  >
                    {/* Icon */}
                    <div className="flex items-center gap-4.5 mb-5">
                      <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 text-[#7DD3FC] flex items-center justify-center shrink-0">
                        <Icon className="w-5.5 h-5.5" />
                      </div>
                      <h3 className="font-heading font-bold text-[15px] text-white tracking-wider uppercase group-hover:text-[#7DD3FC] transition-colors duration-300">
                        {sec.title}
                      </h3>
                    </div>

                    {/* Short Details */}
                    <div className="border-t border-white/5 pt-4">
                      <span className="font-heading text-[9px] font-extrabold tracking-widest text-gray-500 uppercase block mb-1">
                        PROBLEM
                      </span>
                      <p className="font-body text-[11.5px] text-gray-400 leading-relaxed font-light line-clamp-3">
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
