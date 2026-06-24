"use client";

import React from "react";

export default function LogoReveal() {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <img
        src="/assets/logo.png"
        alt="AEGIS Logo"
        loading="lazy"
        className="w-28 h-28 object-contain filter drop-shadow-[0_0_24px_rgba(255,255,255,0.2)] select-none"
      />
      
      <div className="flex flex-col items-center gap-3">
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl tracking-[0.35em] text-white uppercase select-none">
          AEGIS
        </h1>
        <p className="font-heading text-[9px] sm:text-xs font-semibold tracking-[0.45em] text-[#7DD3FC] uppercase select-none">
          INTELLIGENCE INFRASTRUCTURE
        </p>
        <p className="font-body text-xs text-gray-500 font-light tracking-widest mt-6 select-none">
          Building Intelligence Through Connection
        </p>
      </div>
    </div>
  );
}
