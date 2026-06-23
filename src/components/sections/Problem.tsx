"use client";

import React from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, Server, Zap, Coins, Users, Database } from "lucide-react";
import { useGeneralContent } from "@/config/generalContent";

// Dynamic import of 3D Server WebGL component
const DataCenter3D = dynamic(() => import("../3d/DataCenter3D"), { ssr: false });

export default function Problem() {
  const { problem } = useGeneralContent();
  const icons = [Server, Coins, Zap, Users, Database];

  const requirements = problem.requirements.map((req, idx) => ({
    ...req,
    icon: icons[idx] || Server,
  }));

  return (
    <section 
      className="relative min-h-screen py-48 flex items-center justify-center bg-transparent border-b border-white/5"
      id="problem"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_40%,rgba(77,124,254,0.015)_0%,transparent_50%)] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto w-full px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
        
        {/* Left column details */}
        <div className="lg:col-span-6 flex flex-col items-start text-left">
          
          <motion.span 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-xs font-bold tracking-[0.3em] text-[#4D7CFE] mb-4 uppercase"
          >
            {problem.badge}
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-white mb-6 leading-tight"
          >
            {problem.title.split("\n").map((line, i) => (
              <React.Fragment key={i}>
                {i > 0 && <br />}
                {line.includes("Is Concentrated.") ? (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-[#4D7CFE]">
                    {line}
                  </span>
                ) : (
                  line
                )}
              </React.Fragment>
            ))}
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-body text-base text-gray-400 font-light leading-relaxed mb-8 max-w-lg"
          >
            {problem.description}
          </motion.p>

          {/* Grid list of requirements */}
          <div className="flex flex-col gap-4 w-full mb-8">
            {requirements.map((req, idx) => {
              const Icon = req.icon;
              return (
                <motion.div
                  key={req.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="flex items-start gap-4 p-4 glass-card glass-card-hover"
                >
                  <div className="p-2.5 rounded-lg border border-[#4D7CFE]/20 bg-[#4D7CFE]/5 text-[#7DD3FC]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-sm tracking-wider text-white uppercase mb-1">
                      {req.name}
                    </h4>
                    <p className="font-body text-xs text-gray-400 font-light">
                      {req.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Large Quote */}
          <motion.blockquote
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="border-l-2 border-[#4D7CFE] pl-6 py-2 my-6 text-left"
          >
            <p className="font-heading font-medium text-lg italic text-gray-300 leading-relaxed mb-1">
              &ldquo;{problem.quote}&rdquo;
            </p>
          </motion.blockquote>

          {/* Learn More */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Link
              href="/the-problem"
              className="group inline-flex items-center gap-2 text-xs font-heading font-bold tracking-widest text-[#7DD3FC] hover:text-white transition-all duration-350"
            >
              {problem.ctaText}
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>

        </div>

        {/* Right column 3D model */}
        <div className="lg:col-span-6 relative w-full h-[400px] md:h-[500px] flex items-center justify-center rounded-2xl overflow-hidden border border-white/5 bg-transparent">
          {/* Subtle glow border backing */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 bg-[#4D7CFE]/5 blur-3xl rounded-full z-0" />
          
          <div className="relative z-10 w-full h-full">
            <DataCenter3D />
          </div>

          <div className="absolute bottom-5 left-5 right-5 glass-card px-4 py-3 rounded-lg border border-white/10 z-20 flex justify-between items-center bg-[#0a0f19]/50">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="font-heading text-[10px] tracking-wider font-semibold text-gray-400 uppercase">
                CONCENTRATED FACILITY MODEL
              </span>
            </div>
            <span className="font-body text-[10px] text-gray-500">
              HIGH CARBON &bull; CENTRALIZED GATEWAY
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
