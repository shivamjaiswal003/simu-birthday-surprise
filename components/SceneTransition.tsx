import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface SceneTransitionProps {
    isActive: boolean;
    onComplete?: () => void;
}

export const SceneTransition: React.FC<SceneTransitionProps> = ({ isActive, onComplete }) => {
    const overlayRef = useRef<HTMLDivElement>(null);
    const particlesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isActive || !overlayRef.current) return;

        const tl = gsap.timeline({
            onComplete: () => {
                gsap.to(overlayRef.current, {
                    opacity: 0,
                    duration: 0.5,
                    delay: 0.3,
                    onComplete
                });
            }
        });

        // Create particle burst
        const particles = particlesRef.current?.children;
        if (particles) {
            gsap.set(particles, {
                scale: 0,
                opacity: 1,
                x: 0,
                y: 0
            });

            tl.to(particles, {
                scale: 1,
                duration: 0.3,
                stagger: 0.02,
                ease: 'back.out'
            })
                .to(particles, {
                    x: (_i: number) => (Math.random() - 0.5) * 500,
                    y: (_i: number) => (Math.random() - 0.5) * 500,
                    opacity: 0,
                    duration: 0.8,
                    stagger: 0.01,
                    ease: 'power2.out'
                }, '-=0.1');
        }

        return () => {
            tl.kill();
        };
    }, [isActive, onComplete]);

    if (!isActive) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center"
            style={{ background: 'radial-gradient(circle, rgba(255,182,193,0.4) 0%, rgba(0,0,0,0) 70%)' }}
        >
            <div ref={particlesRef} className="absolute inset-0 flex items-center justify-center">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-4 h-4 rounded-full"
                        style={{
                            background: ['#FF69B4', '#FFB6C1', '#FFC0CB', '#FF1493', '#DB7093'][i % 5],
                            boxShadow: '0 0 20px currentColor',
                        }}
                    />
                ))}
            </div>
        </div>
    );
};
