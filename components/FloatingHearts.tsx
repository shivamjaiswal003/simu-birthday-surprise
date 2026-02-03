import React, { useState, useEffect, useCallback } from 'react';

interface Heart {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

const EMOJIS = ['❤️', '💖', '💕', '✨', '😍', '🦋', '🎉', '🎂', '🎁', '🎊'];

export const FloatingHearts: React.FC = () => {
  const [hearts, setHearts] = useState<Heart[]>([]);

  const handleClick = useCallback((e: MouseEvent) => {
    const newHeart = {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
    };

    setHearts(prev => [...prev, newHeart]);

    // Cleanup heart after animation
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 1000);
  }, []);

  useEffect(() => {
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [handleClick]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {hearts.map(heart => (
        <span
          key={heart.id}
          className="absolute text-2xl animate-[floatUp_1s_ease-out_forwards] select-none"
          style={{
            left: heart.x,
            top: heart.y,
            // Random offset for more natural feel
            marginLeft: `${Math.random() * 20 - 10}px` 
          }}
        >
          {heart.emoji}
        </span>
      ))}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-100px) scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
};