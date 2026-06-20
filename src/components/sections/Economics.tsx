"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Users, Sparkles, Coins, HelpCircle, Key, Globe2, FileText, Landmark, BadgeAlert, Cpu } from "lucide-react";

export default function Economics() {
  const loopStages = [
    { title: "More Participants", desc: "Institutions join the network as local nodes.", icon: Users, position: "top" },
    { title: "Better Intelligence", desc: "Shared weights improve overall models.", icon: Sparkles, position: "right" },
    { title: "More Value", desc: "Compounding efficiency yields capital returns.", icon: Coins, position: "bottom" },
    { title: "More Participants", desc: "Value returns attract further nodes.", icon: Users, position: "left" }
  ];

  const models = [
    { title: "Subscriptions", icon: Cpu, desc: "Flat rate plans for nodes accessing global consensus weights." },
    { title: "Agent as a Service", icon: Sparkles, desc: "Lease domain-specific agents (Doctor, Legal, Banking) locally." },
    { title: "API Access", icon: Key, desc: "Secure gateway endpoints for external applications querying models." },
    { title: "White Label", icon: Globe2, desc: "Deploy custom partitioned networks for private enterprises." },
    { title: "Marketplace", icon: Coins, desc: "Trade specialized LoRA adapters and custom knowledge graphs." },
    { title: "Research Access", icon: FileText, desc: "Subsidized subscriptions for academic and non-profit centers." },
    { title: "Government Contracts", icon: Landmark, desc: "Custom federal secure-node clusters and analytics layers." },
    { title: "Certification", icon: BadgeAlert, desc: "Audit and verify third-party agent safety compliance states." },
    { title: "Premium Intelligence", icon: HelpCircle, desc: "Access high-compute fine-tuned reasoning blocks." },
  ];

  return (
    <section 
      className="relative min-h-screen py-24 flex flex-col items-center justify-center bg-[#020408] border-b border-white/5"
      id="economics"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_70%,rgba(77,124,254,0.02)_0%,transparent_50%)] pointer-events-none" />

      {/* --- SUBSECTION 1: Intelligence Economy --- */}
      <div className="max-w-[1440px] mx-auto w-full px-6 md:px-12 flex flex-col items-center relative z-10 mb-32">
        <div className="text-center max-w-3xl mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-xs font-bold tracking-[0.3em] text-[#4D7CFE] mb-4 block uppercase"
          >
            THE FEEDBACK LOOP
          </motion.span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-white mb-6 leading-tight">
            The Intelligence Economy
          </h2>
          <p className="font-body text-base text-gray-400 font-light leading-relaxed">
            Unlike standard commodities, intelligence behaves as a compounding asset. More participation directly accelerates model capability, creating a self-reinforcing value cycle.
          </p>
        </div>

        {/* Circular Loop Graphic */}
        <div className="relative w-full max-w-lg h-[400px] flex items-center justify-center mb-16">
          {/* Central text */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="absolute z-20 w-36 h-36 rounded-full bg-[#020408] border border-[#4D7CFE]/30 flex flex-col items-center justify-center text-center shadow-[0_0_50px_rgba(77,124,254,0.1)] p-4"
          >
            <span className="font-heading text-[10px] font-bold tracking-widest text-[#7DD3FC] mb-1">
              THE CORE
            </span>
            <p className="font-heading font-extrabold text-sm text-white tracking-wide leading-tight">
              Intelligence compounds.
            </p>
          </motion.div>

          {/* Dotted connecting circle */}
          <div className="absolute w-[280px] h-[280px] rounded-full border border-dashed border-white/5 z-0" />

          {/* Loop Stages */}
          {/* Top Stage */}
          <div className="absolute top-0 flex flex-col items-center z-10 w-[140px] text-center">
            <div className="w-10 h-10 rounded-full border border-[#4D7CFE]/20 bg-[#4D7CFE]/5 text-[#7DD3FC] flex items-center justify-center mb-2 shadow-lg">
              <Users className="w-4.5 h-4.5" />
            </div>
            <h4 className="font-heading font-bold text-xs text-white tracking-wider uppercase mb-1">More Participants</h4>
            <p className="font-body text-[9px] text-gray-400 font-light">Nodes join the network</p>
          </div>

          {/* Right Stage */}
          <div className="absolute right-0 flex flex-col items-center z-10 w-[140px] text-center">
            <div className="w-10 h-10 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-400 flex items-center justify-center mb-2 shadow-lg">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <h4 className="font-heading font-bold text-xs text-white tracking-wider uppercase mb-1">Better Intelligence</h4>
            <p className="font-body text-[9px] text-gray-400 font-light">Weights improve locally</p>
          </div>

          {/* Bottom Stage */}
          <div className="absolute bottom-0 flex flex-col items-center z-10 w-[140px] text-center">
            <div className="w-10 h-10 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 flex items-center justify-center mb-2 shadow-lg">
              <Coins className="w-4.5 h-4.5" />
            </div>
            <h4 className="font-heading font-bold text-xs text-white tracking-wider uppercase mb-1">More Value</h4>
            <p className="font-body text-[9px] text-gray-400 font-light">Compounding yields returns</p>
          </div>

          {/* Left Stage */}
          <div className="absolute left-0 flex flex-col items-center z-10 w-[140px] text-center">
            <div className="w-10 h-10 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-400 flex items-center justify-center mb-2 shadow-lg">
              <Users className="w-4.5 h-4.5" />
            </div>
            <h4 className="font-heading font-bold text-xs text-white tracking-wider uppercase mb-1">More Participants</h4>
            <p className="font-body text-[9px] text-gray-400 font-light">Value attracts nodes</p>
          </div>
        </div>

        <Link
          href="/intelligence-economy"
          className="group inline-flex items-center gap-2 text-xs font-heading font-bold tracking-widest text-[#7DD3FC] hover:text-white transition-all duration-350"
        >
          LEARN MORE ABOUT THE FEEDBACK LOOP
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>

      {/* --- SUBSECTION 2: Revenue Model --- */}
      <div className="max-w-[1440px] mx-auto w-full px-6 md:px-12 flex flex-col items-center relative z-10">
        <div className="text-center max-w-3xl mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-xs font-bold tracking-[0.3em] text-[#4D7CFE] mb-4 block uppercase"
          >
            MONETIZATION LAYER
          </motion.span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-white mb-6 leading-tight">
            Revenue Model
          </h2>
          <p className="font-body text-base text-gray-400 font-light leading-relaxed">
            Sustaining the network requires a fair, transparent revenue distribution engine. Node providers receive payouts corresponding to verified work.
          </p>
        </div>

        {/* 9-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mb-16">
          {models.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <motion.div
                key={mod.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.06 }}
                className="glass-card p-6 md:p-8 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-[#4D7CFE]/20 transition-all duration-300 hover:shadow-[0_12px_24px_rgba(77,124,254,0.03)] text-left flex flex-col group"
              >
                <div className="w-10 h-10 rounded-lg border border-[#4D7CFE]/20 bg-[#4D7CFE]/5 text-[#7DD3FC] flex items-center justify-center mb-6 shrink-0 group-hover:scale-105 transition-transform">
                  <Icon className="w-5.5 h-5.5" />
                </div>
                <h3 className="font-heading font-bold text-sm tracking-wider text-white uppercase mb-3">
                  {mod.title}
                </h3>
                <p className="font-body text-xs text-gray-400 font-light leading-relaxed">
                  {mod.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

        <Link
          href="/revenue-model"
          className="group inline-flex items-center gap-2 text-xs font-heading font-bold tracking-widest text-[#7DD3FC] hover:text-white transition-all duration-350"
        >
          LEARN MORE ABOUT VALUE DISTRIBUTION
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
