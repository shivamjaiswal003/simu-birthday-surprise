import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'glow';
    size?: 'sm' | 'normal' | 'large';
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
    children,
    variant = 'primary',
    size = 'normal',
    className = '',
    onClick,
    disabled,
    ...props
}) => {
    const btnRef = useRef<HTMLButtonElement>(null);
    const innerRef = useRef<HTMLSpanElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const shimmerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const btn = btnRef.current;
        const inner = innerRef.current;
        if (!btn || !inner) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Magnetic pull effect (30% of distance)
            gsap.to(btn, {
                x: x * 0.3,
                y: y * 0.3,
                duration: 0.3,
                ease: 'power2.out'
            });

            // Inner content moves slightly less for depth
            gsap.to(inner, {
                x: x * 0.1,
                y: y * 0.1,
                duration: 0.3,
                ease: 'power2.out'
            });
        };

        const handleMouseLeave = () => {
            gsap.to([btn, inner], {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.3)'
            });
            setIsHovered(false);
        };

        const handleMouseEnter = () => {
            setIsHovered(true);
            if (shimmerRef.current) {
                gsap.fromTo(shimmerRef.current,
                    { x: '-100%', opacity: 0.6 },
                    { x: '200%', opacity: 0, duration: 0.8, ease: 'power2.out' }
                );
            }
        };

        btn.addEventListener('mousemove', handleMouseMove);
        btn.addEventListener('mouseleave', handleMouseLeave);
        btn.addEventListener('mouseenter', handleMouseEnter);

        return () => {
            btn.removeEventListener('mousemove', handleMouseMove);
            btn.removeEventListener('mouseleave', handleMouseLeave);
            btn.removeEventListener('mouseenter', handleMouseEnter);
        };
    }, []);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const btn = btnRef.current;
        if (!btn) return;

        // Ripple effect
        const ripple = document.createElement('span');
        ripple.className = 'absolute inset-0 bg-white/30 rounded-2xl';
        btn.appendChild(ripple);

        gsap.fromTo(ripple,
            { scale: 0, opacity: 1 },
            {
                scale: 2,
                opacity: 0,
                duration: 0.6,
                ease: 'power2.out',
                onComplete: () => ripple.remove()
            }
        );

        // Bounce animation
        gsap.to(btn, {
            scale: 0.95,
            duration: 0.1,
            ease: 'power2.out',
            onComplete: () => {
                gsap.to(btn, {
                    scale: 1,
                    duration: 0.6,
                    ease: 'elastic.out(1, 0.4)'
                });
            }
        });

        onClick?.(e);
    };

    const baseStyles = `
    relative overflow-hidden font-semibold rounded-2xl
    transition-all duration-300 ease-out
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
      hover:shadow-[0_8px_30px_rgba(236,72,153,0.6),0_4px_12px_rgba(0,0,0,0.15)]
      border border-pink-400/20
    `,
        secondary: `
      bg-white
      text-gray-800
      border border-gray-200
      shadow-md
      hover:shadow-lg hover:border-pink-300
    `,
        ghost: `
      bg-transparent
      text-gray-700 hover:text-pink-600
      hover:bg-pink-50/50
    `,
        glow: `
      bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500
      text-white
      shadow-[0_0_30px_rgba(236,72,153,0.6),0_0_60px_rgba(168,85,247,0.3)]
      hover:shadow-[0_0_40px_rgba(236,72,153,0.8),0_0_80px_rgba(168,85,247,0.5)]
      animate-pulse-subtle
      border border-white/20
    `
    };

    const sizes = {
        sm: 'px-5 py-2.5 text-sm',
        normal: 'px-7 py-3.5 text-base',
        large: 'px-10 py-5 text-lg tracking-wide'
    };

    return (
        <button
            ref={btnRef}
            onClick={handleClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {/* Shimmer effect */}
            <div
                ref={shimmerRef}
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                    transform: 'translateX(-100%)'
                }}
            />

            {/* Hover glow */}
            <div
                className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                style={{
                    background: 'radial-gradient(circle at center, rgba(255,255,255,0.3) 0%, transparent 70%)',
                }}
            />

            {/* Button content */}
            <span ref={innerRef} className="relative z-10 flex items-center justify-center gap-2">
                {children}
            </span>

            <style>{`
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.02); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 3s ease-in-out infinite;
        }
      `}</style>
        </button>
    );
};
