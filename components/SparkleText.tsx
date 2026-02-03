import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface SparkleTextProps {
    text: string;
    className?: string;
}

export const SparkleText: React.FC<SparkleTextProps> = ({ text, className = '' }) => {
    const containerRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const sparkles = containerRef.current.querySelectorAll('.sparkle');

        gsap.fromTo(sparkles,
            {
                scale: 0,
                rotation: 0,
                opacity: 0
            },
            {
                scale: 1,
                rotation: 180,
                opacity: 1,
                duration: 0.6,
                stagger: {
                    each: 0.1,
                    from: 'random',
                    repeat: -1,
                    repeatDelay: 2
                },
                ease: 'back.out(2)'
            }
        );
    }, [text]);

    return (
        <span ref={containerRef} className={`relative inline-block ${className}`}>
            {text}
            {/* Sparkle decorations */}
            <span className="sparkle absolute -top-2 -right-4 text-2xl opacity-0">✨</span>
            <span className="sparkle absolute -bottom-2 -left-4 text-xl opacity-0">💫</span>
            <span className="sparkle absolute top-0 -left-6 text-lg opacity-0">⭐</span>
        </span>
    );
};
