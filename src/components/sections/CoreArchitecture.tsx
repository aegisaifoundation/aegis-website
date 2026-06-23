"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Bot, Building2, ServerCrash, Cpu } from "lucide-react";
import { useGeneralContent } from "@/config/generalContent";

export default function CoreArchitecture() {
  const { coreArchitecture } = useGeneralContent();
  const icons = [Bot, Building2, ServerCrash, Cpu];
  const colors = [
    "text-cyan-400 border-cyan-500/20 bg-cyan-500/5",
    "text-purple-400 border-purple-500/20 bg-purple-500/5",
    "text-[#4D7CFE] border-[#4D7CFE]/20 bg-[#4D7CFE]/5",
    "text-emerald-400 border-emerald-500/30 bg-emerald-500/5"
  ];

  const steps = coreArchitecture.steps.map((step, idx) => ({
    ...step,
    icon: icons[idx] || Cpu,
    color: colors[idx] || colors[3],
  }));

  return (
    <section 
      className="relative min-h-screen py-40 flex flex-col items-center justify-center bg-transparent border-b border-white/5"
      id="architecture"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(77,124,254,0.015)_0%,transparent_50%)] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto w-full px-6 md:px-12 flex flex-col items-center relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-xs font-bold tracking-[0.3em] text-[#4D7CFE] mb-4 block uppercase"
          >
            {coreArchitecture.badge}
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-white mb-6 leading-tight"
          >
            {coreArchitecture.title}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-body text-base text-gray-400 font-light leading-relaxed"
          >
            {coreArchitecture.description}
          </motion.p>
        </div>

        {/* Large Typography Statement */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card glass-card-hover px-8 py-6 rounded-2xl mb-16 text-center max-w-2xl w-full"
        >
          <h3 className="font-heading font-extrabold text-xl sm:text-2xl tracking-wide text-white leading-relaxed">
            {coreArchitecture.statement.split("\n").map((line, i) => (
              <React.Fragment key={i}>
                {i > 0 && <br />}
                {line.includes("Only intelligence moves.") ? (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4D7CFE] to-[#7DD3FC] text-glow-blue">
                    {line}
                  </span>
                ) : (
                  line
                )}
              </React.Fragment>
            ))}
          </h3>
        </motion.div>

        {/* Vertical Flow Diagram */}
        <div className="relative flex flex-col items-center w-full max-w-md">
          {/* Vertical Connecting Line */}
          <div className="absolute top-10 bottom-10 left-8 -translate-x-1/2 w-[2px] bg-gradient-to-b from-[#4D7CFE]/50 via-purple-500/50 to-emerald-500/50 z-0 hidden sm:block" />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: idx * 0.12 }}
                className="relative z-10 w-full flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-12 last:mb-0"
              >
                {/* Icon wrapper */}
                <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center shrink-0 shadow-lg ${step.color} transition-transform duration-300`}>
                  <Icon className="w-7 h-7" />
                </div>

                {/* Text details */}
                <div className="glass-card glass-card-hover p-5 md:p-6 rounded-xl flex-1 text-center sm:text-left">
                  <span className="text-[10px] font-heading font-extrabold text-gray-500 tracking-widest block mb-1 uppercase">
                    STAGE 0{idx + 1}
                  </span>
                  <h4 className="font-heading font-bold text-base text-white tracking-wider uppercase mb-2">
                    {step.title}
                  </h4>
                  <p className="font-body text-xs text-gray-400 font-light leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Learn More */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 mb-12"
        >
          <Link
            href="/core-architecture"
            className="group inline-flex items-center gap-2 text-xs font-heading font-bold tracking-widest text-[#7DD3FC] hover:text-white transition-all duration-350"
          >
            {coreArchitecture.ctaText}
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* Related Topics Exploration Footer */}
        <div className="mt-12 pt-8 border-t border-white/5 w-full max-w-4xl text-center">
          <span className="font-heading text-[10px] font-extrabold tracking-widest text-gray-500 uppercase block mb-4">
            Related Topics
          </span>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="#agents" className="font-heading text-xs font-bold text-[#7DD3FC] hover:text-white transition-colors uppercase tracking-wider">
              Agent Ecosystem
            </Link>
            <Link href="#technology" className="font-heading text-xs font-bold text-[#7DD3FC] hover:text-white transition-colors uppercase tracking-wider">
              Technology Stack
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
