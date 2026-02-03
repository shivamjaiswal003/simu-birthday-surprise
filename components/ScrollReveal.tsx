import React, { ReactNode, useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';

interface ScrollRevealProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right';
    distance?: number;
    duration?: number;
    threshold?: number;
    triggerOnce?: boolean;
    scale?: number;
    rotate?: number;
}

/**
 * Enhanced scroll-triggered reveal animations using GSAP for smoother motion.
 * Uses IntersectionObserver for performance.
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
    children,
    className = '',
    delay = 0,
    direction = 'up',
    distance = 40,
    duration = 0.7,
    threshold = 0.1,
    triggerOnce = true,
    scale = 0.95,
    rotate = 0,
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [hasTriggered, setHasTriggered] = useState(false);

    // Calculate initial transform based on direction
    const getInitialValues = () => {
        const transforms: { x?: number; y?: number } = {};
        switch (direction) {
            case 'up':
                transforms.y = distance;
                break;
            case 'down':
                transforms.y = -distance;
                break;
            case 'left':
                transforms.x = distance;
                break;
            case 'right':
                transforms.x = -distance;
                break;
        }
        return transforms;
    };

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        // Set initial state
        const initialTransform = getInitialValues();
        gsap.set(element, {
            opacity: 0.6, // Start visible, not fully transparent!
            scale,
            rotation: rotate,
            ...initialTransform,
        });

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && (!triggerOnce || !hasTriggered)) {
                    setHasTriggered(true);

                    // Quick, smooth reveal animation
                    gsap.to(element, {
                        opacity: 1,
                        scale: 1,
                        rotation: 0,
                        x: 0,
                        y: 0,
                        duration: duration * 0.6, // Faster
                        delay: delay / 1000,
                        ease: 'power2.out', // Smooth, not bouncy
                        clearProps: 'transform',
                    });
                } else if (!entry.isIntersecting && !triggerOnce && hasTriggered) {
                    // Reset when scrolling away (only if triggerOnce is false)
                    gsap.to(element, {
                        opacity: 0,
                        scale,
                        ...initialTransform,
                        duration: 0.3,
                        ease: 'power2.in',
                    });
                    setHasTriggered(false);
                }
            },
            { threshold }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [delay, direction, distance, duration, threshold, triggerOnce, scale, rotate, hasTriggered]);

    return (
        <div ref={ref} className={className} style={{ willChange: 'opacity, transform' }}>
            {children}
        </div>
    );
};

/**
 * Enhanced staggered reveal animations with GSAP.
 * Wraps multiple children with increasing delays.
 */
export const ScrollRevealStagger: React.FC<{
    children: ReactNode[];
    staggerDelay?: number;
    className?: string;
    direction?: 'up' | 'down' | 'left' | 'right';
    baseDelay?: number;
    duration?: number;
}> = ({
    children,
    staggerDelay = 80,
    className = '',
    direction = 'up',
    baseDelay = 0,
    duration = 0.6,
}) => {
        return (
            <>
                {React.Children.map(children, (child, index) => (
                    <ScrollReveal
                        delay={baseDelay + index * staggerDelay}
                        className={className}
                        direction={direction}
                        duration={duration}
                        scale={0.92}
                    >
                        {child}
                    </ScrollReveal>
                ))}
            </>
        );
    };

export default ScrollReveal;
