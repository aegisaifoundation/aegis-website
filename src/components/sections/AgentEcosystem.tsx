"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Microscope, Stethoscope, GraduationCap, Building, Shovel, Landmark, Scale, Factory, Heart, Truck } from "lucide-react";

export default function AgentEcosystem() {
  const agents = [
    { title: "Research Agent", icon: Microscope, desc: "Accelerates scientific discoveries, catalogs papers, and validates experimental models.", color: "text-blue-400 border-blue-500/20" },
    { title: "Doctor Agent", icon: Stethoscope, desc: "Assists clinical diagnoses, parses medical history files, and structures patient care pathways.", color: "text-emerald-400 border-emerald-500/20" },
    { title: "Education Agent", icon: GraduationCap, desc: "Personalizes learning curricula, answers academic questions, and generates interactive quizzes.", color: "text-amber-400 border-amber-500/20" },
    { title: "Government Agent", icon: Building, desc: "Streamlines municipal filing processing, structures legislative databases, and audits public records.", color: "text-cyan-400 border-cyan-500/20" },
    { title: "Agriculture Agent", icon: Shovel, desc: "Analyzes crop yields, tracks localized weather anomalies, and designs soil treatment regimes.", color: "text-teal-400 border-teal-500/20" },
    { title: "Banking Agent", icon: Landmark, desc: "Identifies outlier transactions, reviews credit histories, and audits compliance policies.", color: "text-indigo-400 border-indigo-500/20" },
    { title: "Legal Agent", icon: Scale, desc: "Indexes statutory precedents, checks case citations, and highlights contract clauses.", color: "text-purple-400 border-purple-500/20" },
    { title: "Manufacturing Agent", icon: Factory, desc: "Predicts assembly machine breakdowns, monitors resource feeds, and maps logistics lines.", color: "text-pink-400 border-pink-500/20" },
    { title: "Insurance Agent", icon: Heart, desc: "Models actuarial risk factors, automates claim filing pipelines, and checks policy limits.", color: "text-rose-400 border-rose-500/20" },
    { title: "Supply Chain Agent", icon: Truck, desc: "Balances warehouse stock, optimizes delivery routes, and tracks vendor shipments.", color: "text-[#4D7CFE] border-[#4D7CFE]/20" },
  ];

  return (
    <section 
      className="relative min-h-screen py-24 flex flex-col items-center justify-center bg-[#020408] border-b border-white/5"
      id="agent-ecosystem"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_80%,rgba(77,124,254,0.02)_0%,transparent_50%)] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto w-full px-6 md:px-12 flex flex-col items-center relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-xs font-bold tracking-[0.3em] text-[#4D7CFE] mb-4 block uppercase"
          >
            THE NETWORK WORKFORCE
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-white mb-6 leading-tight"
          >
            Distributed Agent Ecosystem
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-body text-base text-gray-400 font-light leading-relaxed"
          >
            Specialized intelligent entities residing at local nodes, coordinating with other agents to address cross-domain institutional tasks.
          </motion.p>
        </div>

        {/* Circular Grid Container of Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 w-full mb-16">
          {agents.map((agent, idx) => {
            const Icon = agent.icon;
            return (
              <motion.div
                key={agent.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className={`glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-350 hover:shadow-[0_15px_30px_rgba(77,124,254,0.03)] hover:scale-[1.03] flex flex-col items-center text-center group`}
              >
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 ${agent.color} bg-white/5`}>
                  <Icon className="w-5.5 h-5.5" />
                </div>
                <h3 className="font-heading font-bold text-sm text-white tracking-wider mb-2 uppercase">
                  {agent.title}
                </h3>
                <p className="font-body text-[11px] text-gray-400 font-light leading-relaxed">
                  {agent.desc}
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
            href="/agent-ecosystem"
            className="group inline-flex items-center gap-2 text-xs font-heading font-bold tracking-widest text-[#7DD3FC] hover:text-white transition-all duration-350"
          >
            LEARN MORE ABOUT AGENT COORDINATION
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
