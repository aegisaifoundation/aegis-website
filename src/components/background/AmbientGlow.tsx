"use client";

import React from "react";

export default function AmbientGlow() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* Huge soft blue glow in the center */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] rounded-full opacity-100 blur-[200px]" 
        style={{
          background: "radial-gradient(circle, rgba(77, 124, 254, 0.05) 0%, rgba(77, 124, 254, 0) 70%)"
        }}
      />
      {/* Soft white glow in the top-left corner */}
      <div 
        className="absolute -top-[20%] -left-[20%] w-[100vw] h-[100vw] rounded-full opacity-100 blur-[220px]" 
        style={{
          background: "radial-gradient(circle, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0) 70%)"
        }}
      />
      {/* Soft white glow in the bottom-right corner */}
      <div 
        className="absolute -bottom-[20%] -right-[20%] w-[100vw] h-[100vw] rounded-full opacity-100 blur-[220px]" 
        style={{
          background: "radial-gradient(circle, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0) 70%)"
        }}
      />
      {/* Faint blue glow in the bottom-left corner */}
      <div 
        className="absolute -bottom-[10%] -left-[10%] w-[90vw] h-[90vw] rounded-full opacity-100 blur-[180px]" 
        style={{
          background: "radial-gradient(circle, rgba(77, 124, 254, 0.03) 0%, rgba(77, 124, 254, 0) 70%)"
        }}
      />
    </div>
  );
}
