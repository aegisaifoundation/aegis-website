"use client";

import { motion } from "framer-motion";
import { ArrowRight, FileText, Layout, BookOpen, Download } from "lucide-react";

export default function Research() {
  const documents = [
    { title: "Whitepapers", filename: "AEGIS_Vision_Whitepaper.pdf", type: "Consensus Paper", icon: FileText, size: "4.2 MB", date: "Jan 2026", color: "hover:border-blue-500/30" },
    { title: "Technical Papers", filename: "Federated_LoRA_Aggregation.pdf", type: "Core Technology", icon: BookOpen, size: "8.5 MB", date: "Mar 2026", color: "hover:border-cyan-500/30" },
    { title: "Architecture Documents", filename: "Node_System_Specifications.pdf", type: "System Specs", icon: FileText, size: "12.1 MB", date: "Apr 2026", color: "hover:border-purple-500/30" },
    { title: "Presentations", filename: "AEGIS_Deck_2026.pdf", type: "Intro Slides", icon: Layout, size: "15.4 MB", date: "May 2026", color: "hover:border-pink-500/30" },
    { title: "Blogs", filename: "Why_Local_Nodes_Beat_Hyperscalers.md", type: "Network Essay", icon: BookOpen, size: "120 KB", date: "Jun 2026", color: "hover:border-emerald-500/30" },
  ];

  return (
    <section 
      className="relative min-h-screen py-24 flex flex-col items-center justify-center bg-[#020408] border-b border-white/5"
      id="research"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_70%,rgba(77,124,254,0.02)_0%,transparent_50%)] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto w-full px-6 md:px-12 flex flex-col items-center relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-xs font-bold tracking-[0.3em] text-[#4D7CFE] mb-4 block uppercase"
          >
            RESOURCE REPOSITORY
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-white mb-6 leading-tight"
          >
            Research & Documentation
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-body text-base text-gray-400 font-light leading-relaxed"
          >
            Read our scientific foundation papers, technical blueprints, architecture document specs, and essays.
          </motion.p>
        </div>

        {/* File Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 w-full mb-16">
          {documents.map((doc, idx) => {
            const Icon = doc.icon;
            return (
              <motion.div
                key={doc.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className={`glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300 hover:shadow-[0_12px_24px_rgba(77,124,254,0.03)] hover:-translate-y-1.5 flex flex-col justify-between text-left group ${doc.color}`}
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 rounded-xl border border-white/10 bg-white/5 text-[#7DD3FC] flex items-center justify-center shrink-0">
                      <Icon className="w-5.5 h-5.5" />
                    </div>
                    
                    <button className="text-gray-500 hover:text-white transition-colors p-1" aria-label="Download Document">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <span className="font-heading text-[9px] font-extrabold tracking-widest text-[#4D7CFE] uppercase block mb-1">
                    {doc.type}
                  </span>
                  
                  <h3 className="font-heading font-bold text-sm text-white tracking-wider mb-2 uppercase group-hover:text-[#7DD3FC] transition-colors duration-300">
                    {doc.title}
                  </h3>
                  
                  <p className="font-body text-[10px] text-gray-400 font-mono font-light leading-relaxed truncate mb-6">
                    {doc.filename}
                  </p>
                </div>

                <div className="border-t border-white/5 pt-4 flex justify-between items-center text-[10px] text-gray-500">
                  <span>{doc.date}</span>
                  <span>{doc.size}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Read All */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <a
            href="/research"
            className="group inline-flex items-center gap-2 text-xs font-heading font-bold tracking-widest text-[#7DD3FC] hover:text-white transition-all duration-350"
          >
            BROWSE COMPLETE REPOSITORY
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </motion.div>

      </div>
    </section>
  );
}
