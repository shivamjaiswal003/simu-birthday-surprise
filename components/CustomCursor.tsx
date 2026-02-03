import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hide default cursor only if device supports hover (desktop)
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (isTouchDevice) return;

    // Add style to hide cursor only on main content, not modals
    const style = document.createElement('style');
    style.id = 'custom-cursor-style';
    style.textContent = `
      body { cursor: none; }
      /* Show normal cursor in modals, overlays, and slideshows */
      .fixed, [class*="z-[9999]"], [class*="z-[9998]"], .slideshow-overlay {
        cursor: auto !important;
      }
      .fixed button, .fixed a, [class*="z-[9999]"] button, [class*="z-[9999]"] a {
        cursor: pointer !important;
      }
    `;
    document.head.appendChild(style);

    const onMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;

      // Immediate movement for dot
      gsap.to(cursorRef.current, {
        x: clientX,
        y: clientY,
        duration: 0,
        ease: 'none'
      });

      // Smooth lag for follower ring
      gsap.to(followerRef.current, {
        x: clientX,
        y: clientY,
        duration: 0.15,
        ease: 'power2.out'
      });
    };

    const onHoverStart = () => {
      gsap.to(followerRef.current, { scale: 1.5, opacity: 0.5, borderColor: '#ff4081', duration: 0.3 });
    };

    const onHoverEnd = () => {
      gsap.to(followerRef.current, { scale: 1, opacity: 1, borderColor: '#f472b6', duration: 0.3 });
    };

    window.addEventListener('mousemove', onMouseMove);

    // Add hover listeners to clickable elements
    const clickables = document.querySelectorAll('button, a, .interactive');
    clickables.forEach(el => {
      el.addEventListener('mouseenter', onHoverStart);
      el.addEventListener('mouseleave', onHoverEnd);
    });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      const styleEl = document.getElementById('custom-cursor-style');
      if (styleEl) styleEl.remove();
      clickables.forEach(el => {
        el.removeEventListener('mouseenter', onHoverStart);
        el.removeEventListener('mouseleave', onHoverEnd);
      });
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-2 h-2 bg-pink-500 rounded-full pointer-events-none z-[9997] -translate-x-1/2 -translate-y-1/2 hidden md:block"
      />
      <div
        ref={followerRef}
        className="fixed top-0 left-0 w-8 h-8 border-2 border-pink-400 rounded-full pointer-events-none z-[9996] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 hidden md:block"
      />
    </>
  );
};