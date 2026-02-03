import React, { useState, useEffect, useRef, useCallback } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export const Typewriter: React.FC<TypewriterProps> = ({
  text,
  speed = 50,
  onComplete
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const animationRef = useRef<{ timer: number | null; index: number }>({
    timer: null,
    index: 0
  });

  const stableOnComplete = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    // Reset for new text
    setDisplayedText('');
    animationRef.current.index = 0;

    // Clear any existing timer
    if (animationRef.current.timer) {
      clearInterval(animationRef.current.timer);
      animationRef.current.timer = null;
    }

    // Start typing animation
    animationRef.current.timer = window.setInterval(() => {
      const nextIndex = animationRef.current.index + 1;

      if (nextIndex <= text.length) {
        animationRef.current.index = nextIndex;
        setDisplayedText(text.slice(0, nextIndex));
      }

      // Stop when done
      if (nextIndex >= text.length) {
        if (animationRef.current.timer) {
          clearInterval(animationRef.current.timer);
          animationRef.current.timer = null;
        }
        stableOnComplete();
      }
    }, speed);

    // Cleanup on unmount
    return () => {
      if (animationRef.current.timer) {
        clearInterval(animationRef.current.timer);
        animationRef.current.timer = null;
      }
    };
  }, [text, speed, stableOnComplete]);

  return (
    <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">
      {displayedText}
      <span className="inline-block w-2 h-5 ml-1 bg-[oklch(0.65_0.22_350)] animate-pulse align-middle" />
    </p>
  );
};