"use client";

import React from "react";
import Stars from "./Stars";
import Grid from "./Grid";
import AmbientGlow from "./AmbientGlow";
import Particles from "./Particles";

export default function Universe() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-black overflow-hidden select-none">
      <Stars />
      <Grid />
      <AmbientGlow />
      <Particles />
    </div>
  );
}
