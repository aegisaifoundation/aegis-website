import React from "react";

export default function SilentSpace({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center relative">
      {children}
    </div>
  );
}
