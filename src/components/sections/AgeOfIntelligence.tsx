"use client";

import { motion } from "framer-motion";
import { ArrowDown, BrainCircuit } from "lucide-react";
import Link from "next/link";

export default function AgeOfIntelligence() {
  const eras = [
    { title: "Agriculture", desc: "Mechanical cultivation of the physical world. Land & Labor.", color: "text-emerald-400" },
    { title: "Industry", desc: "Mass production and energy harnessing. Machines & Capital.", color: "text-amber-400" },
    { title: "Information", desc: "Digitalization, compute systems, global internet. Code & Silicon.", color: "text-[#4D7CFE]" },
    { title: "Intelligence", desc: "Collaborative knowledge networks and federated AI systems. The AEGIS Core.", color: "text-purple-400" },
  ];

  return (
    <section 
      className="relative min-h-screen py-40 flex flex-col items-center justify-center bg-transparent border-b border-white/5"
      id="age-of-intelligence"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(77,124,254,0.015)_0%,transparent_50%)] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto w-full px-6 md:px-12 flex flex-col items-center text-center relative z-10">
        
        {/* Quote Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <span className="font-heading text-xs font-bold tracking-[0.3em] text-[#4D7CFE] block mb-4 uppercase">
            The Historical Shift
          </span>
          <h2 className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight text-white leading-tight">
            &ldquo;The Next Infrastructure<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4D7CFE] to-[#7DD3FC] text-glow-blue">
              Is Intelligence&rdquo;
            </span>
          </h2>
        </motion.div>

        {/* Timeline items container */}
        <div className="flex flex-col items-center max-w-xl w-full">
          {eras.map((era, idx) => {
            const isLast = idx === eras.length - 1;
            return (
              <div key={era.title} className="flex flex-col items-center w-full">
                {/* Era Card */}
                <motion.div
                  initial={{ opacity: 0, y: 35, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: idx * 0.15 }}
                  className="w-full glass-card glass-card-hover p-6 md:p-8 flex flex-col md:flex-row items-center gap-5"
                >
                  {/* Left Circle Number */}
                  <div className={`w-12 h-12 rounded-full border border-white/10 flex items-center justify-center font-heading font-bold text-sm bg-white/5 shrink-0 ${era.color}`}>
                    0{idx + 1}
                  </div>
                  
                  {/* Text details */}
                  <div className="text-center md:text-left">
                    <h3 className="font-heading font-bold text-lg tracking-wider text-white mb-2 uppercase flex items-center justify-center md:justify-start gap-2">
                      {era.title}
                      {era.title === "Intelligence" && <BrainCircuit className="w-5 h-5 text-purple-400 animate-pulse" />}
                    </h3>
                    <p className="font-body text-sm text-gray-400 font-light leading-relaxed">
                      {era.desc}
                    </p>
                  </div>
                </motion.div>

                {/* Animated Arrow Down */}
                {!isLast && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    whileInView={{ opacity: 0.4, height: "45px" }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: idx * 0.2 }}
                    className="flex flex-col items-center justify-center my-3 text-[#4D7CFE]"
                  >
                    <div className="w-[1px] h-full bg-gradient-to-b from-[#4D7CFE]/80 to-transparent" />
                    <ArrowDown className="w-4 h-4 -mt-1.5 animate-bounce" />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {/* Learn More Action */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-16"
        >
          <Link
            href="/age-of-intelligence"
            className="group inline-flex items-center gap-2 text-xs font-heading font-bold tracking-widest text-[#7DD3FC] hover:text-white transition-all duration-350"
          >
            LEARN MORE ABOUT THE SHIFT
            <ArrowDown className="w-3.5 h-3.5 rotate-270 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
