import React, { useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  variant?: 'default' | 'dark' | 'gradient';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  id,
  variant = 'default'
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const breatheRef = useRef<gsap.core.Tween | null>(null);

  // Subtle breathing animation when idle
  useEffect(() => {
    if (!cardRef.current || isHovered) return;

    breatheRef.current = gsap.to(cardRef.current, {
      scale: 1.005,
      duration: 3,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    return () => {
      breatheRef.current?.kill();
    };
  }, [isHovered]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    gsap.to(cardRef.current, {
      rotationX: rotateX,
      rotationY: rotateY,
      scale: 1.02,
      transformPerspective: 1000,
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    breatheRef.current?.kill();

    if (cardRef.current) {
      gsap.to(cardRef.current, {
        boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (!cardRef.current) return;

    gsap.to(cardRef.current, {
      rotationX: 0,
      rotationY: 0,
      scale: 1,
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      duration: 0.8,
      ease: 'elastic.out(1, 0.5)',
    });
  };

  // Transparent, themed backgrounds - no solid white fog
  const variantStyles = {
    default: 'bg-pink-50/70 backdrop-blur-sm shadow-lg border border-pink-200/50',
    dark: 'bg-gray-900/90 shadow-2xl border border-white/10',
    gradient: 'bg-gradient-to-br from-pink-100/30 to-purple-100/30 backdrop-blur-md shadow-lg border border-pink-200/30'
  };

  return (
    <div
      ref={cardRef}
      id={id}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        relative
        ${variantStyles[variant]}
        rounded-3xl
        p-6 md:p-10
        flex flex-col items-center justify-center
        ${className}
      `}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </div>
  );
};