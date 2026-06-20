"use client";

import React from "react";

export default function LogoReveal() {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <svg
        className="w-28 h-28 text-white/90 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 50,8 A 42,42 0 0,0 15,28"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path
          d="M 85,28 A 42,42 0 0,0 50,8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path
          d="M 10,38 A 40,40 0 0,0 10,62"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeDasharray="4 4"
          opacity="0.4"
        />
        <path
          d="M 90,38 A 40,40 0 0,0 90,62"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeDasharray="4 4"
          opacity="0.4"
        />
        <path
          d="M 50,24 L 76,70 H 24 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <polygon points="50,44 64,68 36,68" fill="currentColor" opacity="0.8" />
      </svg>
      
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
