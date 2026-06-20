import React from "react";

interface GlassPanelProps {
  blur: number;
  opacity: number;
}

export default function GlassPanel({ blur, opacity }: GlassPanelProps) {
  return (
    <div
      className="glass-panel absolute inset-0 z-40 pointer-events-none border-t border-white/8 rounded-t-[48px] overflow-hidden"
      style={{
        background: `rgba(10, 15, 25, ${opacity})`,
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        transform: "translateY(100%)",
      }}
    >
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] pointer-events-none rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(77, 124, 254, 0.08) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
