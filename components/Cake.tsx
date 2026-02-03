import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useMicrophone } from '../hooks/useMicrophone';
import { Button } from './Button';

interface CakeProps {
  onBlown: () => void;
}

export const Cake: React.FC<CakeProps> = ({ onBlown }) => {
  const [isBlown, setIsBlown] = useState(false);
  const flameRef = useRef<HTMLDivElement>(null);
  const { isBlowing, isPermissionDenied, startMicrophone } = useMicrophone();

  // Handle blowing logic (either from Mic or Manual click)
  const handleBlowAction = () => {
    if (isBlown) return;

    setIsBlown(true);

    // Animate flame out
    gsap.to(flameRef.current, {
      scale: 0,
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in'
    });

    // Smoke effect (simulated with CSS/DOM)
    // In a real scenario we might add smoke particles here

    onBlown();
  };

  // Watch for mic blowing
  useEffect(() => {
    if (isBlowing && !isBlown) {
      handleBlowAction();
    }
  }, [isBlowing, isBlown]);

  // Attempt to start mic on mount
  useEffect(() => {
    startMicrophone();
  }, []);

  return (
    <div className="relative flex flex-col items-center gap-12 py-8">
      <div className="relative mt-20" role="img" aria-label="A birthday cake with candles">
        {/* Plate */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-56 h-4 bg-gradient-to-b from-gray-100 to-gray-300 rounded-[50%] shadow-lg z-0"></div>

        {/* Cake Bottom Layer */}
        <div className="relative w-44 h-16 bg-gradient-to-b from-[#FFE4C4] to-[#DEB887] rounded-b-xl z-10">
          {/* Decorative stripe */}
          <div className="absolute bottom-3 w-full h-2 bg-pink-300/40"></div>
        </div>

        {/* Cake Top Layer */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-14 bg-gradient-to-b from-[#FFEFD5] to-[#FFE4C4] rounded-t-2xl rounded-b-lg z-10">
          {/* Pink frosting decoration on top */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-36 h-3 bg-gradient-to-r from-pink-200 via-pink-300 to-pink-200 rounded-full"></div>
        </div>

        {/* Frosting Drips */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-36 flex justify-around z-20">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-4 bg-gradient-to-b from-pink-200 to-pink-300 rounded-b-full"
              style={{ height: `${12 + (i % 2) * 6}px` }}
            ></div>
          ))}
        </div>

        {/* Candle */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-3 h-14 bg-gradient-to-b from-sky-300 to-sky-500 z-30 rounded-sm shadow-sm">
          {/* Candle stripe pattern */}
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_3px,rgba(255,255,255,0.3)_3px,rgba(255,255,255,0.3)_6px)] rounded-sm"></div>
          {/* Wick */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-gray-700 rounded-full"></div>
        </div>

        {/* Flame */}
        <div
          ref={flameRef}
          className={`absolute -top-[7.5rem] left-1/2 -translate-x-1/2 z-40 transition-opacity duration-200 ${isBlown ? 'opacity-0' : 'opacity-100'}`}
        >
          <div className="relative">
            {/* Outer flame glow */}
            <div className="absolute -inset-2 bg-orange-400/30 rounded-full blur-md animate-pulse"></div>
            {/* Main flame */}
            <div className="w-4 h-6 bg-gradient-to-t from-orange-500 via-orange-400 to-yellow-300 rounded-full rounded-t-[80%] shadow-[0_0_15px_rgba(255,165,0,0.8)] animate-[flicker_0.3s_ease-in-out_infinite_alternate]"></div>
            {/* Inner flame */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-3 bg-gradient-to-t from-yellow-200 to-white rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold text-gray-700">
          {isBlown ? "Yay! 🎉" : "Make a wish & blow the candle!"}
        </h3>

        {!isBlown && (
          <div className="flex flex-col items-center gap-2">
            {isPermissionDenied ? (
              <Button
                onClick={handleBlowAction}
                onTouchEnd={handleBlowAction}
              >
                Blow Candle 💨
              </Button>
            ) : (
              <p className="text-sm text-gray-500 italic animate-pulse">
                (Blow into your microphone or tap the candle)
              </p>
            )}

            {/* Always offer manual fallback visibly if mic is tricky */}
            {!isPermissionDenied && (
              <button
                onClick={handleBlowAction}
                className="text-xs text-gray-400 underline mt-2 hover:text-gray-600"
              >
                Microphone not working? Click here.
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};