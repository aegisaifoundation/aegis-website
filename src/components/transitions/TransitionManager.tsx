"use client";

import React from "react";
import TransitionLayer from "./TransitionLayer";
import { transitionThemes } from "@/config/transitionThemes";

interface TransitionManagerProps {
  children: React.ReactNode[];
}

export default function TransitionManager({ children }: TransitionManagerProps) {
  const childrenArray = React.Children.toArray(children);

  return (
    <>
      {childrenArray.map((child, idx) => {
        const theme = transitionThemes[idx];
        if (!theme) return child;

        return (
          <TransitionLayer
            key={theme.id}
            quoteTitle={theme.quote}
            quoteSubtitle={theme.subtitle}
            blurLevel={theme.blur}
            opacityLevel={theme.opacity}
            pinDuration={theme.pin}
            animationDuration={theme.duration}
            alignment={theme.alignment}
            quoteSize={theme.quoteSize}
            sectionId={theme.id}
            mode={theme.mode}
          >
            {child}
          </TransitionLayer>
        );
      })}
    </>
  );
}
