import React, { useState, useEffect } from 'react';

interface CountdownProps {
  startDate: string;
}

export const Countdown: React.FC<CountdownProps> = ({ startDate }) => {
  const [timeElapsed, setTimeElapsed] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const start = new Date(startDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = now - start;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeElapsed({ days, hours, minutes, seconds });
    };

    const timer = setInterval(updateTimer, 1000);
    updateTimer(); // Initial call

    return () => clearInterval(timer);
  }, [startDate]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-6 w-full">
      <h3 className="text-xl md:text-2xl text-gray-600 font-semibold text-center">
        We've been "us" for
      </h3>
      
      <div className="flex flex-col items-center">
        <div className="flex items-baseline gap-2">
            <span className="text-6xl md:text-8xl font-black text-[oklch(0.65_0.22_350)] drop-shadow-sm tracking-tighter tabular-nums">
            {timeElapsed.days}
            </span>
            <span className="text-2xl text-gray-600 font-semibold">days</span>
        </div>

        <p className="text-sm text-gray-400 mt-1 mb-4 font-medium">
            (Since April 24, 2020)
        </p>
        
        {/* Running sub-timer for detailed "growth" feel */}
        <div className="flex gap-4 text-gray-500 font-mono text-lg md:text-xl mt-2 bg-white/40 px-6 py-2 rounded-full backdrop-blur-sm shadow-sm border border-white/50">
            <div className="flex flex-col items-center min-w-[30px]">
                <span className="font-bold tabular-nums">{timeElapsed.hours.toString().padStart(2, '0')}</span>
                <span className="text-[10px] uppercase tracking-wider opacity-70">hrs</span>
            </div>
            <span className="font-bold text-pink-400 animate-pulse">:</span>
            <div className="flex flex-col items-center min-w-[30px]">
                <span className="font-bold tabular-nums">{timeElapsed.minutes.toString().padStart(2, '0')}</span>
                <span className="text-[10px] uppercase tracking-wider opacity-70">min</span>
            </div>
             <span className="font-bold text-pink-400 animate-pulse">:</span>
            <div className="flex flex-col items-center min-w-[30px]">
                <span className="font-bold tabular-nums">{timeElapsed.seconds.toString().padStart(2, '0')}</span>
                <span className="text-[10px] uppercase tracking-wider opacity-70">sec</span>
            </div>
        </div>
      </div>
    </div>
  );
};