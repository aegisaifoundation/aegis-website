"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Microscope, Stethoscope, GraduationCap, Building, Shovel, Landmark, Scale, Factory, Heart, Truck } from "lucide-react";
import { useCardContent } from "@/config/cardContent";

export default function AgentEcosystem() {
  const { agents } = useCardContent();
  const icons: Record<string, typeof Microscope> = { "Research Agent": Microscope, "Doctor Agent": Stethoscope, "Education Agent": GraduationCap, "Government Agent": Building, "Agriculture Agent": Shovel, "Banking Agent": Landmark, "Legal Agent": Scale, "Manufacturing Agent": Factory, "Insurance Agent": Heart, "Supply Chain Agent": Truck };

  return (
    <section 
      className="relative min-h-screen py-40 flex flex-col items-center justify-center bg-transparent border-b border-white/5"
      id="agents"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_80%,rgba(77,124,254,0.015)_0%,transparent_50%)] pointer-events-none" />

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
            const Icon = icons[agent.title] || Microscope;
            return (
              <motion.div
                key={agent.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="glass-card glass-card-hover p-6 flex flex-col items-center text-center group"
              >
                <div className="w-12 h-12 rounded-xl border flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 text-[#7DD3FC] border-[#4D7CFE]/20 bg-white/5">
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
