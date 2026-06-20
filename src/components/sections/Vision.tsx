"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, Compass, AlertCircle, RefreshCw, Target } from "lucide-react";

// Dynamic import of 3D Network Sphere WebGL component
const NetworkSphere = dynamic(() => import("../3d/NetworkSphere"), { ssr: false });

export default function Vision() {
  const visionCards = [
    { title: "Problem", text: "Centralized AI concentrates power and compute control inside a few monopolistic gatekeepers.", icon: AlertCircle },
    { title: "Paradox", text: "Scaling central nodes makes models incredibly powerful but fragile, biased, and inaccessible locally.", icon: RefreshCw },
    { title: "Vision", text: "A cooperative public intelligence resource owned and operated by the global communities that use it.", icon: Compass },
    { title: "Mission", text: "Build the secure coordination software layer that connects local nodes into a unified brain.", icon: Target },
  ];

  return (
    <section 
      className="relative min-h-screen py-56 flex items-center justify-center bg-transparent border-b border-white/5"
      id="vision"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_60%,rgba(77,124,254,0.015)_0%,transparent_50%)] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto w-full px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
        
        {/* Left column 3D model */}
        <div className="lg:col-span-6 order-last lg:order-first relative w-full h-[400px] md:h-[500px] flex items-center justify-center rounded-2xl overflow-hidden border border-white/5 bg-transparent">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 bg-[#7DD3FC]/5 blur-3xl rounded-full z-0" />
          
          <div className="relative z-10 w-full h-full">
            <NetworkSphere />
          </div>

          <div className="absolute bottom-5 left-5 right-5 glass-card px-4 py-3 rounded-lg border border-white/10 z-20 flex justify-between items-center bg-[#0a0f19]/50">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-heading text-[10px] tracking-wider font-semibold text-gray-400 uppercase">
                COOPERATIVE NETWORK SPHERE
              </span>
            </div>
            <span className="font-body text-[10px] text-gray-500">
              ACTIVE &bull; 0% CENTRAL SHIELD
            </span>
          </div>
        </div>

        {/* Right column details */}
        <div className="lg:col-span-6 flex flex-col items-start text-left">
          
          <motion.span 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-xs font-bold tracking-[0.3em] text-[#4D7CFE] mb-4 uppercase"
          >
            THE AEGIS ARCHETYPE
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-white mb-8 leading-tight"
          >
            A Decentralized<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4D7CFE] to-[#7DD3FC] text-glow-blue">
              Intelligence Network.
            </span>
          </motion.h2>

          {/* 4-Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-8">
            {visionCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.15 }}
                  className="glass-card glass-card-hover p-6 rounded-2xl flex flex-col items-start text-left"
                >
                  <div className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 text-[#7DD3FC] flex items-center justify-center mb-3.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-heading font-bold text-xs text-white tracking-widest uppercase mb-1.5">
                    {card.title}
                  </h3>
                  <p className="font-body text-[11px] text-gray-400 font-light leading-relaxed">
                    {card.text}
                  </p>
                </motion.div>
              );
            })}
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="font-heading font-bold text-base text-white mb-8 tracking-wide border-l-2 border-[#7DD3FC] pl-5 py-1"
          >
            Collective intelligence emerges.
          </motion.p>

          {/* Learn More */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <Link
              href="/the-vision"
              className="group inline-flex items-center gap-2 text-xs font-heading font-bold tracking-widest text-[#7DD3FC] hover:text-white transition-all duration-350"
            >
              LEARN MORE ABOUT COLLECTIVE EMERGENCE
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
