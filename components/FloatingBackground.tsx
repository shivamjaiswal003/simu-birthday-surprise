import React, { useMemo } from 'react';

interface FloatingParticle {
    id: number;
    emoji: string;
    left: number;
    top: number;
    size: number;
    duration: number;
    delay: number;
    opacity: number;
}

const FLOATING_EMOJIS = ['💖', '💕', '❤️', '✨', '💗', '💓', '🦋', '🌸'];

/**
 * Floating background hearts/particles that animate continuously.
 * Creates a dreamy, romantic atmosphere.
 */
export const FloatingBackground: React.FC<{ count?: number }> = ({ count = 20 }) => {
    // Generate particles once on mount
    const particles = useMemo<FloatingParticle[]>(() => {
        return Array.from({ length: count }, (_, i) => ({
            id: i,
            emoji: FLOATING_EMOJIS[Math.floor(Math.random() * FLOATING_EMOJIS.length)],
            left: Math.random() * 100, // percentage
            top: Math.random() * 100, // percentage
            size: 0.8 + Math.random() * 1.2, // rem
            duration: 8 + Math.random() * 12, // seconds
            delay: Math.random() * 10, // seconds
            opacity: 0.1 + Math.random() * 0.3,
        }));
    }, [count]);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {particles.map((particle) => (
                <span
                    key={particle.id}
                    className="absolute select-none animate-float-gentle"
                    style={{
                        left: `${particle.left}%`,
                        top: `${particle.top}%`,
                        fontSize: `${particle.size}rem`,
                        opacity: particle.opacity,
                        animationDuration: `${particle.duration}s`,
                        animationDelay: `${particle.delay}s`,
                    }}
                >
                    {particle.emoji}
                </span>
            ))}

            <style>{`
        @keyframes floatGentle {
          0%, 100% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: var(--start-opacity, 0.2);
          }
          25% {
            transform: translateY(-20px) translateX(10px) rotate(5deg);
            opacity: var(--mid-opacity, 0.4);
          }
          50% {
            transform: translateY(-30px) translateX(-5px) rotate(-3deg);
            opacity: var(--start-opacity, 0.2);
          }
          75% {
            transform: translateY(-15px) translateX(-15px) rotate(8deg);
            opacity: var(--mid-opacity, 0.35);
          }
        }

        .animate-float-gentle {
          animation: floatGentle var(--duration, 10s) ease-in-out infinite;
          --start-opacity: 0.15;
          --mid-opacity: 0.35;
        }
      `}</style>
        </div>
    );
};

export default FloatingBackground;
