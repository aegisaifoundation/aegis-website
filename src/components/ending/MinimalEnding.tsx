"use client";

import React from "react";
import { motion } from "framer-motion";
import LogoReveal from "./LogoReveal";
import { ArrowUp } from "lucide-react";

export default function MinimalEnding() {
  const handleExploreAgain = () => {
    const hero = document.getElementById("hero");
    if (hero) {
      hero.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section 
      className="relative min-h-[70vh] w-full flex flex-col items-center justify-center bg-transparent border-t border-white/5 py-32 overflow-hidden"
      id="final"
    >
      <div className="max-w-[80rem] mx-auto w-full px-6 flex flex-col items-center text-center relative z-10 gap-12">
        {/* Animated Large Logo & Text */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0 }}
          className="flex flex-col items-center"
        >
          <LogoReveal />
        </motion.div>

        {/* Explore Again link */}
        <motion.button
          onClick={handleExploreAgain}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 0.4, y: 0 }}
          whileHover={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex items-center gap-2 font-heading text-[10px] font-bold tracking-[0.40em] text-white uppercase cursor-pointer py-2 px-4 transition-all duration-300"
          title="Scroll to Top"
        >
          <ArrowUp className="w-3.5 h-3.5" />
          Explore Again
        </motion.button>
      </div>
    </section>
  );
}
