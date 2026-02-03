import confetti from 'canvas-confetti';
import { useCallback } from 'react';

export const useConfetti = () => {
  const launchConfetti = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    // School Pride effect
    (function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff0000', '#00ff00', '#0000ff']
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ff0000', '#00ff00', '#0000ff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }, []);

  return { launchConfetti };
};