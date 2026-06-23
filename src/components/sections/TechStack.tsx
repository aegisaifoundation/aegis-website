"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Bot, Database, Search, Share2, Shield, Fingerprint, Layers, Cpu, Network } from "lucide-react";
import { useCardContent } from "@/config/cardContent";
import { useGeneralContent } from "@/config/generalContent";

export default function TechStack() {
  const { technology: stack } = useCardContent();
  const { technology: techContent } = useGeneralContent();

  const icons: Record<string, typeof Bot> = { 
    "Multi-Agent Systems": Bot, 
    RAG: Search, 
    "Vector Databases": Database, 
    "Knowledge Graphs": Network, 
    "Federated Learning": Share2, 
    "Selective LoRA": Cpu, 
    "Secure Aggregation": Layers, 
    "Trust Engine": Shield, 
    "Blockchain Layer": Fingerprint 
  };

  return (
    <section 
      className="relative min-h-screen py-48 flex flex-col items-center justify-center bg-transparent border-b border-white/5"
      id="technology"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(77,124,254,0.02)_0%,transparent_50%)] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto w-full px-6 md:px-12 flex flex-col items-center relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-xs font-bold tracking-[0.3em] text-[#4D7CFE] mb-4 block uppercase"
          >
            {techContent.badge}
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-white mb-6 leading-tight"
          >
            {techContent.title}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-body text-base text-gray-400 font-light leading-relaxed"
          >
            {techContent.description}
          </motion.p>
        </div>

        {/* Sequential Animation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mb-16">
          {stack.map((item, idx) => {
            const Icon = icons[item.title] || Bot;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="glass-card glass-card-hover p-6 md:p-8 text-left flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-lg border border-[#4D7CFE]/20 bg-[#4D7CFE]/5 text-[#7DD3FC] flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-heading font-bold text-sm tracking-wider text-white uppercase group-hover:text-[#7DD3FC] transition-colors duration-300">
                      {item.title}
                    </h3>
                  </div>
                  <p className="font-body text-xs text-gray-400 font-light leading-relaxed mb-6">
                    {item.desc}
                  </p>
                </div>
                
                <div className="border-t border-white/5 pt-4 flex justify-between items-center">
                  <span className="font-heading text-[8px] font-extrabold tracking-widest text-gray-500 uppercase">
                    PROTOCOL SPEC
                  </span>
                  <span className="font-body text-[10px] font-medium text-[#7DD3FC]">
                    {item.spec}
                  </span>
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
          className="mb-12"
        >
          <Link
            href="/technology-stack"
            className="group inline-flex items-center gap-2 text-xs font-heading font-bold tracking-widest text-[#7DD3FC] hover:text-white transition-all duration-350"
          >
            LEARN MORE ABOUT THE CORE STACK
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* Related Topics Exploration Footer */}
        <div className="mt-12 pt-8 border-t border-white/5 w-full max-w-4xl text-center">
          <span className="font-heading text-[10px] font-extrabold tracking-widest text-gray-500 uppercase block mb-4">
            Related Topics
          </span>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="#research" className="font-heading text-xs font-bold text-[#7DD3FC] hover:text-white transition-colors uppercase tracking-wider">
              Research Papers
            </Link>
            <Link href="#sectors" className="font-heading text-xs font-bold text-[#7DD3FC] hover:text-white transition-colors uppercase tracking-wider">
              Industrial Sectors
            </Link>
            <Link href="#economics" className="font-heading text-xs font-bold text-[#7DD3FC] hover:text-white transition-colors uppercase tracking-wider">
              Economics & Monetization
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
