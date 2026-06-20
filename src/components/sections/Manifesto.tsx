"use client";

import { motion } from "framer-motion";

export default function Manifesto() {
  const statements = [
    "The future of AI may not belong only to giant data centers.",
    "It may belong to connected communities.",
    "Every institution becomes a node.",
    "Every contribution improves the network.",
    "Together they create something larger.",
  ];

  return (
    <section 
      className="relative min-h-screen py-32 flex flex-col items-center justify-center bg-[#020408] border-b border-white/5 overflow-hidden"
      id="manifesto"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] bg-[#4D7CFE]/3 via-transparent to-transparent z-0 blur-[140px] pointer-events-none rounded-full" />
      
      <div className="max-w-[1440px] mx-auto w-full px-6 md:px-12 flex flex-col items-center text-center relative z-10">
        
        {/* Subtitle tag */}
        <motion.span
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 0.5, y: 0 }}
          viewport={{ once: true }}
          className="font-heading text-xs font-bold tracking-[0.4em] text-white mb-16 block uppercase"
        >
          THE AEGIS MANIFESTO
        </motion.span>

        {/* Cinematic Typographic Reveal lines */}
        <div className="flex flex-col gap-8 max-w-4xl w-full">
          {statements.map((stmt, idx) => {
            const isSpecial = idx === 0 || idx === 1 || idx === 4;
            return (
              <motion.p
                key={idx}
                initial={{ opacity: 0.1, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.0, delay: idx * 0.15, ease: "easeOut" }}
                className={`font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight tracking-tight ${
                  isSpecial 
                    ? "text-white" 
                    : "text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-600"
                }`}
              >
                {idx === 4 ? (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4D7CFE] to-[#7DD3FC] text-glow-blue">
                    {stmt}
                  </span>
                ) : (
                  stmt
                )}
              </motion.p>
            );
          })}
        </div>

        {/* Small branding icon or dot at bottom */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 0.3, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-24 w-8 h-8 rounded-full border border-white/20 flex items-center justify-center"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#7DD3FC] animate-ping" />
        </motion.div>

      </div>
    </section>
  );
}
