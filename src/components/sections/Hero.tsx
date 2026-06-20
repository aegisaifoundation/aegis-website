"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";

// Dynamic import of 3D WebGL Canvas to prevent SSR hydration errors
const EarthNetwork = dynamic(() => import("../3d/EarthNetwork"), { ssr: false });

export default function Hero() {
  return (
    <section
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#020408] pt-20"
      id="hero"
    >
      {/* 3D WebGL Earth Backdrop */}
      <div className="absolute inset-0 w-full h-full z-0 opacity-20">
        <EarthNetwork />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.006)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.006)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] z-1 pointer-events-none" />

      {/* Radial Gradient Glow behind center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-radial from-[#4D7CFE]/5 via-[#4D7CFE]/0 to-transparent z-1 blur-[120px] pointer-events-none" />

      {/* Main Content Area */}
      <motion.div
        className="relative z-10 max-w-[1440px] mx-auto w-full px-6 md:px-12 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center py-12"
      >
        <div className="max-w-4xl flex flex-col items-center">
          
          {/* Subtitle tag / Brand Title */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center mb-14"
          >
            <h1 className="font-heading font-extrabold text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-[0.25em] text-white leading-none text-glow-white-soft select-none mb-6">
              AEGIS
            </h1>
            <p className="font-heading text-xs sm:text-sm font-semibold tracking-[0.35em] text-[#7DD3FC] uppercase">
              INTELLIGENCE INFRASTRUCTURE
            </p>
          </motion.div>

          {/* Title Statement */}
          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.15, ease: "easeOut" }}
            className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-[46px] tracking-tight leading-[1.25] text-white mb-14"
          >
            The Future Of Intelligence May Not Belong To <br className="hidden md:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-400">
              Giant Data Centers.
            </span> <br />
            It May Belong To{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4D7CFE] to-[#7DD3FC] text-glow-blue">
              Connected Communities.
            </span>
          </motion.h2>

          {/* Small text */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="font-body text-base md:text-lg text-gray-400 tracking-wide mb-16 max-w-xl font-light"
          >
            Building Intelligence Through Connection
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
              className="group flex items-center justify-center gap-3 font-heading font-semibold text-xs tracking-widest text-[#020408] bg-white px-8 py-4 rounded-full transition-all duration-350 hover:bg-gray-100 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:-translate-y-0.5"
            >
              EXPLORE THE VISION
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            
            <Link
              href="#join"
              className="group flex items-center justify-center gap-3 font-heading font-semibold text-xs tracking-widest text-white border border-white/10 bg-[#08111f]/45 hover:bg-[#0c182c]/80 hover:border-white/20 px-8 py-4 rounded-full transition-all duration-350 hover:shadow-[0_0_20px_rgba(77,124,254,0.15)] hover:-translate-y-0.5"
            >
              JOIN THE NETWORK
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
