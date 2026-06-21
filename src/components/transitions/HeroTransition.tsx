"use client";

import React from "react";
import { motion } from "framer-motion";

export default function HeroTransition() {
  return (
    <section 
      className="relative w-full h-[60vh] flex flex-col items-center justify-center overflow-hidden border-y border-white/10 bg-white/[0.02] backdrop-blur-[30px] z-10"
      id="hero-transition"
    >
      <div className="max-w-[80rem] mx-auto w-full px-6 md:px-12 text-center flex flex-col items-center">
        
        {/* Category tag */}
        <motion.span
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 0.5, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="font-heading text-xs font-bold tracking-[0.4em] text-[#4D7CFE] mb-6 block uppercase"
        >
          COGNITIVE BRIDGE
        </motion.span>
        
        {/* Core quote */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight tracking-tight text-white max-w-4xl"
        >
          "The Next Infrastructure Is Intelligence"
        </motion.h2>
      </div>
    </section>
  );
}
