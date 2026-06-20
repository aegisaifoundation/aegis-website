"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Calendar, Compass, Server, Network, ShieldCheck, Cpu } from "lucide-react";

export default function Roadmap() {
  const steps = [
    { year: "2026", title: "Prototype", desc: "Release of the AEGIS core engine, local node clients, and basic multi-agent validation.", icon: Calendar, color: "border-blue-500/20 text-blue-400" },
    { year: "Q3 2026", title: "Pilot Institutions", desc: "Deploy private node installations across select university research centers.", icon: Compass, color: "border-cyan-500/20 text-cyan-400" },
    { year: "2027", title: "100 Nodes", desc: "Establish network routes between research institutions, regional hospitals, and key servers.", icon: Server, color: "border-purple-500/20 text-purple-400" },
    { year: "Q4 2027", title: "1000 Nodes", desc: "Scale global node connections, deploying LoRA updates and aggregating weights.", icon: Network, color: "border-pink-500/20 text-pink-400" },
    { year: "2028", title: "Cross-sector Network", desc: "Unify sectors (Healthcare, Banking, Energy) into dynamic federated intelligence pipelines.", icon: ShieldCheck, color: "border-emerald-500/30 text-emerald-400" },
    { year: "2029", title: "Intelligence Infrastructure", desc: "Achieve state coordinate consensus. AEGIS coordinates 10%+ of global compute nodes.", icon: Cpu, color: "border-amber-500/20 text-amber-400" },
  ];

  return (
    <section 
      className="relative min-h-screen py-24 flex flex-col items-center justify-center bg-[#020408] border-b border-white/5"
      id="roadmap"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(77,124,254,0.02)_0%,transparent_50%)] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto w-full px-6 md:px-12 flex flex-col items-center relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mb-24">
          <motion.span 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-xs font-bold tracking-[0.3em] text-[#4D7CFE] mb-4 block uppercase"
          >
            THE PLAN
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-white mb-6 leading-tight"
          >
            AEGIS Roadmap
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-body text-base text-gray-400 font-light leading-relaxed"
          >
            From prototype builds to a globally coordinated collective intelligence backbone.
          </motion.p>
        </div>

        {/* Timeline Grid (Vertical on mobile, horizontal scroll/flex on desktop) */}
        <div className="relative w-full mb-16">
          {/* Horizontal Line behind items */}
          <div className="absolute top-[34px] left-[5%] right-[5%] h-[1px] bg-gradient-to-r from-[#4D7CFE]/10 via-[#4D7CFE]/30 to-[#4D7CFE]/5 z-0 hidden lg:block" />
          
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 w-full relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="flex flex-col items-center lg:items-start text-center lg:text-left group"
                >
                  {/* Timeline circle node */}
                  <div className={`w-18 h-18 rounded-full border bg-[#020408] flex items-center justify-center mb-6 shadow-xl ${step.color} relative z-10 group-hover:scale-105 transition-transform duration-300`}>
                    <Icon className="w-5.5 h-5.5" />
                    {/* Tiny index count badge */}
                    <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full border border-white/10 bg-white/5 font-heading text-[9px] font-bold flex items-center justify-center text-white">
                      {idx + 1}
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="glass-card p-5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-colors duration-300 w-full flex-1">
                    <span className="font-heading text-[10px] font-extrabold tracking-widest text-[#7DD3FC] block mb-1">
                      {step.year}
                    </span>
                    <h3 className="font-heading font-bold text-sm text-white tracking-wider uppercase mb-2">
                      {step.title}
                    </h3>
                    <p className="font-body text-[11px] text-gray-400 font-light leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Learn More */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <Link
            href="/roadmap"
            className="group inline-flex items-center gap-2 text-xs font-heading font-bold tracking-widest text-[#7DD3FC] hover:text-white transition-all duration-350"
          >
            LEARN MORE ABOUT DEVELOPMENT PIPELINES
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
