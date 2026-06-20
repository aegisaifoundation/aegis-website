import { useScrollProgress } from "./useScrollProgress";
import { RefObject } from "react";

export function useParallax(ref: RefObject<HTMLElement | null>, speed: number) {
  const progress = useScrollProgress(ref);
  const offset = (progress - 0.5) * 200 * speed;
  return offset;
}
