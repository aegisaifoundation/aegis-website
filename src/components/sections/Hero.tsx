"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useGeneralContent } from "@/config/generalContent";

export default function Hero() {
  const { hero } = useGeneralContent();

  return (
    <section
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-transparent pt-20"
      id="hero"
    >
      {/* Main Content Area */}
      <motion.div
        className="relative z-10 max-w-[1440px] mx-auto w-full px-6 md:px-12 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center py-12"
      >
        <div className="max-w-4xl flex flex-col items-center">
          
          {/* Subtitle tag / Brand Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: "easeOut" }}
            className="flex flex-col items-center mb-10"
          >
            <h1 className="font-heading font-extrabold text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-[0.25em] text-white leading-none text-glow-white-soft select-none mb-8">
              {hero.title}
            </h1>
            <p className="font-heading text-xs sm:text-sm md:text-base font-semibold tracking-[0.45em] text-[#7DD3FC] uppercase mb-4">
              {hero.subtitle}
            </p>
          </motion.div>

          {/* Small text */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
            className="font-body text-base md:text-lg text-gray-400 tracking-wide mb-14 max-w-xl font-light"
          >
            {hero.description}
          </motion.p>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-5 items-center justify-center w-full sm:w-auto"
          >
            <Link
              href="#vision"
              className="group flex items-center justify-center gap-3 font-heading font-semibold text-xs tracking-widest text-black bg-white px-8 py-4 rounded-full transition-all duration-350 hover:bg-gray-100 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:-translate-y-0.5"
            >
              {hero.exploreBtnText}
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            
            <Link
              href="#join"
              className="btn-glass group flex items-center justify-center gap-3 font-heading font-semibold text-xs tracking-widest text-white px-8 py-4"
            >
              {hero.joinBtnText}
            </Link>
          </motion.div>

        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 cursor-pointer"
        onClick={() => {
          const nextSec = document.getElementById("age-of-intelligence");
          if (nextSec) nextSec.scrollIntoView({ behavior: "smooth" });
        }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </motion.div>
      </motion.div>
    </section>
  );
}
