import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface PromisesProps {
  promises: string[];
  onComplete: () => void;
}

export const Promises: React.FC<PromisesProps> = ({ promises, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);
  const dotsContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If all promises are shown
    if (currentIndex >= promises.length) {
      if (!isFinished) {
        setIsFinished(true);
        onComplete();
      }
      return;
    }

    const text = promises[currentIndex];
    setDisplayedText('');
    setIsTyping(true);
    let index = 0;

    // Fade in the new text container
    if (textRef.current) {
      gsap.fromTo(textRef.current,
        { opacity: 0, y: 20, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' }
      );
    }

    // Typing effect
    const intervalId = setInterval(() => {
      index++;
      setDisplayedText(text.substring(0, index));
      if (index >= text.length) {
        clearInterval(intervalId);
        setIsTyping(false);

        // Wait before transitioning to next promise
        setTimeout(() => {
          // Fade out current text
          if (textRef.current) {
            gsap.to(textRef.current, {
              opacity: 0,
              y: -15,
              scale: 0.98,
              duration: 0.4,
              ease: 'power2.in',
              onComplete: () => setCurrentIndex(prev => prev + 1)
            });
          }
        }, 2500);
      }
    }, 45);

    return () => clearInterval(intervalId);
  }, [currentIndex, promises, isFinished, onComplete]);

  // Animate dots on index change
  useEffect(() => {
    if (!dotsContainerRef.current) return;

    const dots = dotsContainerRef.current.querySelectorAll('.promise-dot');
    dots.forEach((dot, i) => {
      gsap.to(dot, {
        width: i === currentIndex ? 32 : 8,
        backgroundColor: i === currentIndex ? '#ec4899' : i < currentIndex ? '#f9a8d4' : '#e5e7eb',
        opacity: i === currentIndex ? 1 : i < currentIndex ? 0.6 : 1,
        duration: 0.4,
        ease: 'elastic.out(1, 0.7)',
      });
    });
  }, [currentIndex]);

  if (isFinished) {
    return (
      <div
        ref={containerRef}
        className="flex flex-col items-center justify-center min-h-[300px] w-full"
      >
        <div
          className="text-6xl mb-4"
          style={{ animation: 'heartBeat 1.5s ease-in-out infinite' }}
        >
          ❤️
        </div>
        <h3 className="text-2xl font-serif text-gray-800 italic text-center px-4">
          "You & I are a perfect match, never believe anything else."
        </h3>
        <style>{`
          @keyframes heartBeat {
            0%, 100% { transform: scale(1); }
            15% { transform: scale(1.15); }
            30% { transform: scale(1); }
            45% { transform: scale(1.08); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[300px] px-4">
      <h3 className="text-sm font-bold text-gray-400 mb-12 tracking-[0.3em] uppercase opacity-60">
        My Vows
      </h3>

      <div className="h-40 flex items-center justify-center w-full max-w-2xl relative">
        <p
          ref={textRef}
          className="text-2xl md:text-3xl font-serif text-gray-800 text-center leading-relaxed"
        >
          <span className="italic">"{displayedText}"</span>
          {isTyping && (
            <span
              className="inline-block w-0.5 h-6 ml-1 bg-pink-500 align-middle"
              style={{ animation: 'blink 1s step-end infinite' }}
            />
          )}
        </p>
      </div>

      <div ref={dotsContainerRef} className="flex gap-2 mt-12">
        {promises.map((_, i) => (
          <div
            key={i}
            className="promise-dot h-2 rounded-full bg-gray-200"
            style={{
              width: i === currentIndex ? 32 : 8,
              boxShadow: i === currentIndex ? '0 2px 8px rgba(236, 72, 153, 0.4)' : 'none',
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};