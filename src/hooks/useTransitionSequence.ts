import { useState, useEffect } from "react";

export type TransitionState = "Idle" | "Rising" | "Reading" | "Dissolving" | "Revealing";

export function useTransitionSequence(progress: number) {
  const [state, setState] = useState<TransitionState>("Idle");

  useEffect(() => {
    if (progress === 0) {
      setState("Idle");
    } else if (progress > 0 && progress < 0.3) {
      setState("Rising");
    } else if (progress >= 0.3 && progress < 0.75) {
      setState("Reading");
    } else if (progress >= 0.75 && progress < 0.95) {
      setState("Dissolving");
    } else {
      setState("Revealing");
    }
  }, [progress]);

  return state;
}
