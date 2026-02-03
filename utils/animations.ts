/**
 * Centralized animation utilities for smooth, premium animations
 */
import { gsap } from 'gsap';

// Custom easing presets for natural motion
export const EASING = {
    // Smooth deceleration - great for entrances
    smoothOut: 'power3.out',
    // Quick start, smooth end - for attention-grabbing
    snapOut: 'power4.out',
    // Bouncy spring - for playful elements
    bounce: 'elastic.out(1, 0.5)',
    // Soft bounce - less dramatic spring
    softBounce: 'elastic.out(1, 0.75)',
    // Smooth acceleration for exits
    smoothIn: 'power3.in',
    // Cinematic ease for transitions
    cinematic: 'power2.inOut',
    // Back ease for anticipation
    anticipate: 'back.out(1.7)',
};

// Duration presets (in seconds)
export const DURATION = {
    instant: 0.15,
    fast: 0.3,
    normal: 0.5,
    smooth: 0.7,
    slow: 1.0,
    dramatic: 1.5,
};

// Stagger presets
export const STAGGER = {
    fast: 0.05,
    normal: 0.1,
    slow: 0.15,
    dramatic: 0.2,
};

/**
 * Create a smooth fade-in animation
 */
export const fadeIn = (
    element: Element | null,
    options: {
        duration?: number;
        delay?: number;
        y?: number;
        scale?: number;
        ease?: string;
    } = {}
) => {
    if (!element) return;

    const {
        duration = DURATION.normal,
        delay = 0,
        y = 20,
        scale = 0.98,
        ease = EASING.smoothOut,
    } = options;

    return gsap.fromTo(element,
        { opacity: 0, y, scale },
        { opacity: 1, y: 0, scale: 1, duration, delay, ease }
    );
};

/**
 * Create a smooth fade-out animation
 */
export const fadeOut = (
    element: Element | null,
    options: {
        duration?: number;
        delay?: number;
        y?: number;
        scale?: number;
        ease?: string;
    } = {}
) => {
    if (!element) return;

    const {
        duration = DURATION.fast,
        delay = 0,
        y = -10,
        scale = 0.98,
        ease = EASING.smoothIn,
    } = options;

    return gsap.to(element, { opacity: 0, y, scale, duration, delay, ease });
};

/**
 * Create a staggered entrance for multiple elements
 */
export const staggerIn = (
    elements: Element[] | NodeListOf<Element> | null,
    options: {
        duration?: number;
        stagger?: number;
        y?: number;
        ease?: string;
        from?: 'start' | 'end' | 'center' | 'edges' | 'random';
    } = {}
) => {
    if (!elements || (Array.isArray(elements) && elements.length === 0)) return;

    const {
        duration = DURATION.normal,
        stagger = STAGGER.normal,
        y = 30,
        ease = EASING.smoothOut,
        from = 'start',
    } = options;

    return gsap.fromTo(elements,
        { opacity: 0, y, scale: 0.95 },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            duration,
            ease,
            stagger: { each: stagger, from }
        }
    );
};

/**
 * Create a scale pop animation (for buttons, cards)
 */
export const pop = (
    element: Element | null,
    options: {
        scale?: number;
        duration?: number;
        ease?: string;
    } = {}
) => {
    if (!element) return;

    const {
        scale = 1.05,
        duration = DURATION.fast,
        ease = EASING.bounce,
    } = options;

    return gsap.fromTo(element,
        { scale: 0.9, opacity: 0.8 },
        { scale: 1, opacity: 1, duration, ease }
    );
};

/**
 * Create a smooth scene transition
 */
export const sceneTransition = (
    element: Element | null,
    onMidpoint: () => void,
    options: {
        duration?: number;
    } = {}
) => {
    if (!element) return;

    const { duration = 0.5 } = options;

    const tl = gsap.timeline();

    // Exit animation with blur
    tl.to(element, {
        scale: 0.92,
        opacity: 0,
        rotateX: 12,
        filter: 'blur(6px)',
        y: -15,
        duration,
        ease: EASING.smoothIn,
        onComplete: onMidpoint,
    })
        // Enter animation with spring
        .fromTo(element,
            {
                scale: 0.95,
                opacity: 0,
                rotateX: -10,
                filter: 'blur(6px)',
                y: 30,
            },
            {
                scale: 1,
                opacity: 1,
                rotateX: 0,
                filter: 'blur(0px)',
                y: 0,
                duration: duration * 1.6,
                ease: EASING.softBounce,
            }
        );

    return tl;
};

/**
 * Create a ripple effect at a point
 */
export const createRipple = (
    container: HTMLElement,
    x: number,
    y: number,
    color: string = 'rgba(255, 255, 255, 0.4)'
) => {
    const ripple = document.createElement('div');
    ripple.style.cssText = `
    position: absolute;
    left: ${x}px;
    top: ${y}px;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: ${color};
    transform: translate(-50%, -50%);
    pointer-events: none;
  `;
    container.appendChild(ripple);

    gsap.to(ripple, {
        width: 200,
        height: 200,
        opacity: 0,
        duration: 0.6,
        ease: EASING.smoothOut,
        onComplete: () => ripple.remove(),
    });
};

/**
 * Create a magnetic effect for cursor
 */
export const magneticEffect = (
    element: HTMLElement,
    mouseX: number,
    mouseY: number,
    strength: number = 0.3
) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (mouseX - centerX) * strength;
    const deltaY = (mouseY - centerY) * strength;

    gsap.to(element, {
        x: deltaX,
        y: deltaY,
        duration: DURATION.fast,
        ease: EASING.smoothOut,
    });
};

/**
 * Reset magnetic effect
 */
export const resetMagnetic = (element: HTMLElement) => {
    gsap.to(element, {
        x: 0,
        y: 0,
        duration: DURATION.normal,
        ease: EASING.bounce,
    });
};

/**
 * Create a shimmer sweep animation
 */
export const shimmerSweep = (element: Element | null) => {
    if (!element) return;

    return gsap.fromTo(element,
        { x: '-100%', opacity: 0.6 },
        { x: '200%', opacity: 0, duration: 0.7, ease: EASING.smoothOut }
    );
};

/**
 * Breathing/pulsing animation for idle elements
 */
export const breathe = (element: Element | null, options: { scale?: number } = {}) => {
    if (!element) return;

    const { scale = 1.02 } = options;

    return gsap.to(element, {
        scale,
        duration: 2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
    });
};
