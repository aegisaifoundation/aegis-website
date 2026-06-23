"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Compass, AlertCircle, RefreshCw, Target } from "lucide-react";
import { useGeneralContent } from "@/config/generalContent";

export default function Vision() {
  const { vision } = useGeneralContent();
  const icons = [AlertCircle, RefreshCw, Compass, Target];

  const cards = vision.cards.map((card, idx) => ({
    ...card,
    icon: icons[idx] || Compass,
  }));

  return (
    <section 
      className="relative py-32 md:py-40 flex items-center justify-center bg-transparent border-b border-white/5"
      id="vision"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_60%,rgba(77,124,254,0.015)_0%,transparent_50%)] pointer-events-none" />

      <div className="max-w-[1120px] mx-auto w-full px-6 md:px-12 relative z-10">
        <div className="flex flex-col items-center text-center">
          
          <motion.span 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-xs font-bold tracking-[0.3em] text-[#4D7CFE] mb-4 uppercase"
          >
            {vision.badge}
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight text-white mb-12 leading-tight"
          >
            {vision.title.split("\n").map((line, i) => (
              <React.Fragment key={i}>
                {i > 0 && <br />}
                {line.includes("Intelligence Network.") ? (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4D7CFE] to-[#7DD3FC] text-glow-blue">
                    {line}
                  </span>
                ) : (
                  line
                )}
              </React.Fragment>
            ))}
          </motion.h2>

          {/* 4-Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-10">
            {cards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.15 }}
                  className="glass-card glass-card-hover p-6 rounded-2xl flex flex-col items-center text-center"
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
            className="font-heading font-bold text-base text-white mb-8 tracking-wide border-b-2 border-[#7DD3FC] pb-3"
          >
            {vision.highlight}
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
              {vision.ctaText}
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
