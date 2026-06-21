"use client";

import React from "react";
import Stars from "./Stars";
import Grid from "./Grid";
import AmbientGlow from "./AmbientGlow";
import Particles from "./Particles";

export default function Universe() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#000000] overflow-hidden select-none">
      <Stars />
      <Grid />
      <AmbientGlow />
      <Particles />
      {/* Film grain noise overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.015] bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.65%22%20numOctaves%3D%223%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22%2F%3E%3C%2Fsvg%3E')] mix-blend-overlay"
      />
    </div>
  );
}
