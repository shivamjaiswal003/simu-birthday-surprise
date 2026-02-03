import { useEffect, useRef, useState, RefObject } from 'react';

interface UseScrollRevealOptions {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
}

/**
 * Custom hook for scroll-triggered reveal animations using IntersectionObserver.
 * Returns a ref to attach to elements and an isVisible state.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
    options: UseScrollRevealOptions = {}
): [RefObject<T>, boolean] {
    const { threshold = 0.1, rootMargin = '0px 0px -50px 0px', triggerOnce = true } = options;
    const ref = useRef<T>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        if (triggerOnce) {
                            observer.unobserve(element);
                        }
                    } else if (!triggerOnce) {
                        setIsVisible(false);
                    }
                });
            },
            { threshold, rootMargin }
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [threshold, rootMargin, triggerOnce]);

    return [ref, isVisible];
}

/**
 * Creates an IntersectionObserver that can be used to observe multiple elements.
 * Call this once and use the returned observer for multiple elements.
 */
export function createScrollRevealObserver(
    onReveal: (element: Element, isVisible: boolean) => void,
    options: UseScrollRevealOptions = {}
): IntersectionObserver {
    const { threshold = 0.1, rootMargin = '0px 0px -50px 0px' } = options;

    return new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                onReveal(entry.target, entry.isIntersecting);
            });
        },
        { threshold, rootMargin }
    );
}

export default useScrollReveal;
