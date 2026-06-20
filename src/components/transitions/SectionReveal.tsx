import React from "react";

export default function SectionReveal({ children }: { children: React.ReactNode }) {
  return (
    <div className="section-content w-full h-full relative z-10">
      {children}
    </div>
  );
}
