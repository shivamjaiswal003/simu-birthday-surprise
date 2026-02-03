import React, { useRef, useCallback } from 'react';
import { gsap } from 'gsap';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'glow';
  size?: 'sm' | 'normal' | 'large';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'normal',
  className = '',
  onClick,
  disabled,
  ...props
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const shimmerRef = useRef<HTMLDivElement>(null);
  const rippleContainerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    gsap.to(btnRef.current, {
      scale: 0.94,
      duration: 0.12,
      ease: 'power2.out'
    });

    // Create ripple effect
    if (rippleContainerRef.current && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('div');
      ripple.className = 'button-ripple';
      ripple.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 70%);
        transform: translate(-50%, -50%);
        pointer-events: none;
      `;
      rippleContainerRef.current.appendChild(ripple);

      gsap.to(ripple, {
        width: Math.max(rect.width, rect.height) * 2.5,
        height: Math.max(rect.width, rect.height) * 2.5,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => ripple.remove(),
      });
    }
  };

  const handleMouseUp = () => {
    gsap.to(btnRef.current, {
      scale: 1,
      duration: 0.5,
      ease: 'elastic.out(1, 0.4)'
    });
  };

  const handleMouseEnter = useCallback((e: React.MouseEvent) => {
    // Shimmer sweep
    if (shimmerRef.current) {
      gsap.fromTo(shimmerRef.current,
        { x: '-100%', opacity: 0.6 },
        { x: '200%', opacity: 0, duration: 0.7, ease: 'power2.out' }
      );
    }

    // Glow pulse for primary/glow variants
    if (glowRef.current && (variant === 'primary' || variant === 'glow')) {
      gsap.to(glowRef.current, {
        opacity: 1,
        scale: 1.1,
        duration: 0.3,
        ease: 'power2.out',
      });
    }

    // Subtle lift
    gsap.to(btnRef.current, {
      y: -2,
      duration: 0.2,
      ease: 'power2.out',
    });
  }, [variant]);

  const handleMouseLeave = () => {
    handleMouseUp();

    // Reset glow
    if (glowRef.current) {
      gsap.to(glowRef.current, {
        opacity: 0,
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
    }

    // Reset position
    gsap.to(btnRef.current, {
      x: 0,
      y: 0,
      duration: 0.3,
      ease: 'elastic.out(1, 0.5)',
    });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!btnRef.current || disabled) return;

    const rect = btnRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Subtle magnetic pull (reduced strength for smooth feel)
    const deltaX = (e.clientX - centerX) * 0.08;
    const deltaY = (e.clientY - centerY) * 0.08;

    gsap.to(btnRef.current, {
      x: deltaX,
      y: deltaY - 2, // Keep the lift
      duration: 0.2,
      ease: 'power2.out',
    });
  }, [disabled]);

  const baseStyles = `
    relative overflow-hidden font-semibold rounded-2xl
    transition-shadow duration-300 ease-out
    outline-none focus-visible:ring-4 focus-visible:ring-pink-400/50 focus-visible:ring-offset-2
    select-none cursor-pointer
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600
      hover:from-pink-600 hover:via-rose-600 hover:to-pink-700
      text-white
      shadow-[0_4px_20px_rgba(236,72,153,0.4),0_2px_8px_rgba(0,0,0,0.1)]
      hover:shadow-[0_8px_35px_rgba(236,72,153,0.55),0_4px_12px_rgba(0,0,0,0.15)]
    `,
    secondary: `
      bg-white/90 backdrop-blur-sm
      text-gray-800
      border border-gray-200/80
      shadow-[0_2px_12px_rgba(0,0,0,0.08)]
      hover:bg-white hover:shadow-[0_6px_25px_rgba(0,0,0,0.12)]
      hover:border-pink-200
    `,
    ghost: `
      bg-transparent
      text-gray-700 hover:text-pink-600
      hover:bg-pink-50/50
    `,
    glow: `
      bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500
      text-white
      shadow-[0_0_25px_rgba(236,72,153,0.5),0_0_50px_rgba(168,85,247,0.3)]
      hover:shadow-[0_0_35px_rgba(236,72,153,0.7),0_0_70px_rgba(168,85,247,0.4)]
      animate-pulse-subtle
    `
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    normal: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg tracking-wide'
  };

  return (
    <button
      ref={btnRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onTouchStart={(e) => handleMouseDown(e as unknown as React.MouseEvent)}
      onTouchEnd={handleMouseUp}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {/* Glow effect layer */}
      {(variant === 'primary' || variant === 'glow') && (
        <div
          ref={glowRef}
          className="absolute inset-0 pointer-events-none opacity-0 rounded-2xl"
          style={{
            background: 'radial-gradient(circle at center, rgba(236,72,153,0.4) 0%, transparent 70%)',
            filter: 'blur(15px)',
            transform: 'scale(1)',
          }}
        />
      )}

      {/* Shimmer effect on hover */}
      <div
        ref={shimmerRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
          transform: 'translateX(-100%)'
        }}
      />

      {/* Ripple container */}
      <div
        ref={rippleContainerRef}
        className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl"
      />

      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>

      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.92; }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </button>
  );
};