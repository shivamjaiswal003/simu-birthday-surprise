
import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface Memory {
  url: string;
  caption: string;
}

interface PolaroidStackProps {
  memories: Memory[];
  onComplete: () => void;
}

export const PolaroidStack: React.FC<PolaroidStackProps> = ({ memories, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const stackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Initial entrance animation for the stack
    if (stackRef.current) {
      gsap.fromTo(stackRef.current, 
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
      );
    }
  }, []);

  const handleNext = () => {
    if (currentIndex >= memories.length) return;

    const currentCard = cardRefs.current[currentIndex];
    
    // Fly out animation to the right with rotation
    if (currentCard) {
      gsap.to(currentCard, {
        x: window.innerWidth,
        rotation: Math.random() * 90 - 45,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.in',
        onComplete: () => {
          if (currentIndex === memories.length - 1) {
            onComplete();
          }
          setCurrentIndex(prev => prev + 1);
        }
      });
    }
  };

  return (
    <div className="relative w-full h-[450px] flex items-center justify-center perspective-1000">
      <div ref={stackRef} className="relative w-[300px] h-[400px]">
        {memories.map((memory, index) => {
          // Reverse index so first item is on top in DOM order (z-index handling)
          // Actually, standard mapping with absolute positioning puts last item on top.
          // We want index 0 to be on top.
          const isCurrent = index === currentIndex;
          const isPast = index < currentIndex;
          
          // Calculate random rotation for "messy stack" look, but stable per ID
          const rotation = (index % 2 === 0 ? 1 : -1) * (Math.random() * 6 + 2); 
          
          return (
            <div
              key={index}
              ref={(el) => { cardRefs.current[index] = el; }}
              onClick={isCurrent ? handleNext : undefined}
              className={`
                absolute top-0 left-0 w-full h-full 
                bg-white p-4 pb-12 shadow-2xl rounded-sm 
                transition-transform duration-500
                border border-gray-100
                flex flex-col items-center
                cursor-pointer
                hover:scale-[1.02]
              `}
              style={{
                zIndex: memories.length - index,
                transform: `rotate(${isPast ? 0 : rotation}deg) scale(${1 - index * 0.02})`,
                display: isPast ? 'none' : 'flex',
                // Make cards behind the current one slightly darker/blurred
                filter: index > currentIndex ? 'brightness(0.95)' : 'none'
              }}
            >
              {/* Photo Area */}
              <div className="w-full h-[85%] bg-gray-100 mb-4 overflow-hidden relative">
                <img 
                  src={memory.url} 
                  alt="Memory" 
                  className="w-full h-full object-cover select-none pointer-events-none"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-blue-500/10 mix-blend-overlay pointer-events-none" />
              </div>
              
              {/* Caption Area - Handwriting Font */}
              <div className="font-['Caveat',_cursive] text-2xl text-gray-700 text-center leading-none transform -rotate-1">
                {memory.caption}
              </div>

              {isCurrent && (
                <div className="absolute bottom-2 right-4 text-xs text-gray-400 animate-pulse font-sans">
                  (Tap to keep)
                </div>
              )}
            </div>
          );
        })}
        
        {currentIndex >= memories.length && (
           <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-xl font-bold text-white animate-bounce">
                All memories kept ❤️
              </p>
           </div>
        )}
      </div>
      
      {/* Import the handwriting font locally for this component */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap');
      `}</style>
    </div>
  );
};
