"use client";

import React from "react";

export default function AmbientGlow() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-[10%] left-[-10%] w-[50vw] h-[50vw] bg-radial from-[#4D7CFE]/3 via-transparent to-transparent blur-[120px] rounded-full" />
      <div className="absolute top-[45%] right-[-10%] w-[60vw] h-[60vw] bg-radial from-[#7DD3FC]/2 via-transparent to-transparent blur-[140px] rounded-full" />
      <div className="absolute bottom-[10%] left-[20%] w-[50vw] h-[50vw] bg-radial from-[#4D7CFE]/2.5 via-transparent to-transparent blur-[130px] rounded-full" />
    </div>
  );
}
