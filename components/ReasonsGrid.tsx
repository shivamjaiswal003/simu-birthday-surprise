import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface ReasonsGridProps {
  reasons: string[];
}

export const ReasonsGrid: React.FC<ReasonsGridProps> = ({ reasons }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const items = containerRef.current.querySelectorAll('.reason-item');

    // Set initial state - flipped and hidden
    gsap.set(items, {
      rotationY: -180,
      opacity: 0,
      scale: 0.8,
      transformPerspective: 1000,
    });

    // 3D flip entrance animation - staggered
    gsap.to(items, {
      rotationY: 0,
      opacity: 1,
      scale: 1,
      duration: 0.5,
      stagger: {
        each: 0.04, // 24 items × 0.04 = ~1s total spread
        from: 'start',
      },
      ease: 'back.out(1.2)',
    });
  }, []);

  // Vibrant solid colors for better readability
  const cardColors = [
    'bg-pink-400',
    'bg-purple-400',
    'bg-rose-400',
    'bg-fuchsia-400',
    'bg-violet-400',
    'bg-pink-500',
  ];

  return (
    <div ref={containerRef} className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full mt-4" style={{ perspective: '1000px' }}>
      {reasons.map((reason, index) => (
        <div
          key={index}
          className={`reason-item
            ${cardColors[index % cardColors.length]}
            p-4 
            rounded-2xl 
            shadow-lg
            text-center
            flex items-center justify-center
            min-h-[80px]
            hover:scale-105 hover:shadow-xl hover:-translate-y-1
            transition-all duration-300
            cursor-default
          `}
          style={{
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
          }}
        >
          <span className="text-white font-bold text-sm md:text-base drop-shadow-md">
            {reason}
          </span>
        </div>
      ))}
    </div>
  );
};