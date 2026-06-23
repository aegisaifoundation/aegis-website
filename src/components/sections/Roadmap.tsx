"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Calendar, Compass, Server, Network, ShieldCheck, Cpu } from "lucide-react";
import { useGeneralContent } from "@/config/generalContent";

export default function Roadmap() {
  const { roadmap } = useGeneralContent();
  const icons = [Calendar, Compass, Server, Network, ShieldCheck, Cpu];
  const colors = [
    "border-blue-500/20 text-blue-400",
    "border-cyan-500/20 text-cyan-400",
    "border-purple-500/20 text-purple-400",
    "border-pink-500/20 text-pink-400",
    "border-emerald-500/30 text-emerald-400",
    "border-amber-500/20 text-amber-400"
  ];

  const steps = roadmap.steps.map((step, idx) => ({
    ...step,
    icon: icons[idx] || Cpu,
    color: colors[idx] || colors[5],
  }));

  return (
    <section 
      className="relative min-h-screen py-40 flex flex-col items-center justify-center bg-transparent border-b border-white/5"
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
            {roadmap.badge}
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-white mb-6 leading-tight"
          >
            {roadmap.title}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-body text-base text-gray-400 font-light leading-relaxed"
          >
            {roadmap.description}
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
                  <div className={`w-18 h-18 rounded-full glass-card flex items-center justify-center mb-6 shadow-xl ${step.color} relative z-10 group-hover:scale-105 transition-transform duration-350`}>
                    <Icon className="w-5.5 h-5.5" />
                    {/* Tiny index count badge */}
                    <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full border border-white/10 bg-white/5 font-heading text-[9px] font-bold flex items-center justify-center text-white">
                      {idx + 1}
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-5 w-full flex-1 text-center lg:text-left">
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
            {roadmap.ctaText}
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
