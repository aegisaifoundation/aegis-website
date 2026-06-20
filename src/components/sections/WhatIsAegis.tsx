"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Bot, SearchCode, Cpu, Settings2, Network, ShieldCheck, ShieldAlert, FileKey } from "lucide-react";

export default function WhatIsAegis() {
  const cards = [
    { title: "AI Agents", desc: "Autonomous reasoning blocks designed to perform tasks across domains.", icon: Bot, color: "hover:border-[#4D7CFE]/30" },
    { title: "RAG Systems", desc: "Retrieval-Augmented Generation that connects local models to proprietary databases.", icon: SearchCode, color: "hover:border-[#7DD3FC]/30" },
    { title: "Federated Learning", desc: "Decentralized model training without transferring raw data off premises.", icon: Cpu, color: "hover:border-purple-500/30" },
    { title: "Selective LoRA", desc: "Parameter-efficient fine-tuning that distributes updates efficiently across nodes.", icon: Settings2, color: "hover:border-pink-500/30" },
    { title: "Knowledge Graphs", desc: "Structured networks linking facts, entities, and context together.", icon: Network, color: "hover:border-emerald-500/30" },
    { title: "Trust Layer", desc: "Validation policies that guarantee secure outputs and filter adversarial prompt requests.", icon: ShieldCheck, color: "hover:border-blue-500/30" },
    { title: "Secure Aggregation", desc: "Cryptographic consensus combining model weights safely to block leakage.", icon: ShieldAlert, color: "hover:border-amber-500/30" },
    { title: "Blockchain Verification", desc: "Distributed ledger ledger-proofing that locks and audits node contributions.", icon: FileKey, color: "hover:border-indigo-500/30" },
  ];

  return (
    <section 
      className="relative min-h-screen py-24 flex flex-col items-center justify-center bg-[#020408] border-b border-white/5"
      id="what-is-aegis"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(77,124,254,0.015)_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto w-full px-6 md:px-12 flex flex-col items-center relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-xs font-bold tracking-[0.3em] text-[#4D7CFE] mb-4 block uppercase"
          >
            THE AEGIS ENGINE
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-white mb-6 leading-tight"
          >
            Comprehensive Toolkit For<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4D7CFE] to-[#7DD3FC] text-glow-blue">
              Decentralized AI.
            </span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-body text-base text-gray-400 font-light leading-relaxed"
          >
            Aegis provides a robust architecture combining privacy-preserving training, structured database integrations, cryptographic trust verifications, and agentic workflows.
          </motion.p>
        </div>

        {/* 8-Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-16">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className={`glass-card p-6 md:p-8 rounded-2xl flex flex-col items-start text-left border border-white/5 transition-all duration-400 hover:-translate-y-1.5 hover:bg-white/[0.02] hover:shadow-[0_15px_30px_rgba(77,124,254,0.04)] ${card.color} group`}
              >
                <div className="p-3 rounded-xl border border-white/10 bg-white/5 text-[#7DD3FC] group-hover:text-white group-hover:border-[#4D7CFE]/30 group-hover:bg-[#4D7CFE]/5 transition-all duration-300 mb-6">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-base text-white tracking-wider mb-3 uppercase">
                  {card.title}
                </h3>
                <p className="font-body text-xs text-gray-400 font-light leading-relaxed">
                  {card.desc}
                </p>
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
        >
          <Link
            href="/what-is-aegis"
            className="group inline-flex items-center gap-2 text-xs font-heading font-bold tracking-widest text-[#7DD3FC] hover:text-white transition-all duration-350"
          >
            LEARN MORE ABOUT THE CAPABILITIES
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
