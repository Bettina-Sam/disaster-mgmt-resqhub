import confetti from "canvas-confetti";
import { useCallback } from "react";

export default function useConfetti() {
  const burst = useCallback((opts = {}) => {
    confetti({
      particleCount: 140,
      spread: 70,
      startVelocity: 38,
      gravity: 0.8,
      ticks: 180,
      origin: { y: 0.2 },
      ...opts,
    });
  }, []);

  return { burst };
}
