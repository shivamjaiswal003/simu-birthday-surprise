import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';

interface ScratchRevealProps {
  children: React.ReactNode;
  onRevealComplete?: () => void;
}

export const ScratchReveal: React.FC<ScratchRevealProps> = ({ children, onRevealComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = container.offsetWidth;
    const height = container.offsetHeight;
    
    // Set canvas resolution higher for crisp edges
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Fill with fog layer
    ctx.fillStyle = 'rgba(200, 200, 220, 0.9)'; // Foggy glass color
    ctx.fillRect(0, 0, width, height);
    
    // Add text "Rub to reveal"
    ctx.font = 'bold 24px Nunito, sans-serif';
    ctx.fillStyle = '#ff4081';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("✨ Rub me! ✨", width / 2, height / 2);

    // Scratch logic
    let isDrawing = false;

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      let x, y;
      if ('touches' in e) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
      } else {
        x = (e as MouseEvent).clientX - rect.left;
        y = (e as MouseEvent).clientY - rect.top;
      }
      return { x, y };
    };

    const scratch = (x: number, y: number) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, Math.PI * 2);
      ctx.fill();
      
      // Check progress occasionally
      if (Math.random() > 0.8) checkReveal();
    };

    const checkReveal = () => {
        // Sample pixels to see how much is transparent
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // Use actual pixel dims
        const pixels = imageData.data;
        let transparentCount = 0;
        // Optimization: check every 10th pixel
        for (let i = 0; i < pixels.length; i += 40) {
            if (pixels[i + 3] < 128) transparentCount++;
        }
        
        const totalPixels = pixels.length / 40;
        const percent = (transparentCount / totalPixels) * 100;
        setScratchProgress(percent);

        if (percent > 40 && !isRevealed) {
            revealAll();
        }
    };

    const revealAll = () => {
        setIsRevealed(true);
        gsap.to(canvas, { opacity: 0, duration: 0.8, onComplete: () => {
            if (canvas) canvas.style.display = 'none';
            if (onRevealComplete) onRevealComplete();
        }});
    };

    const start = (e: MouseEvent | TouchEvent) => {
        e.preventDefault();
        isDrawing = true;
    };
    const move = (e: MouseEvent | TouchEvent) => {
        e.preventDefault();
        if (!isDrawing) return;
        const { x, y } = getPos(e);
        scratch(x, y);
    };
    const end = () => { isDrawing = false; };

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('touchstart', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, { passive: false }); // Important for preventing scroll
    window.addEventListener('mouseup', end);
    window.addEventListener('touchend', end);

    return () => {
        canvas.removeEventListener('mousedown', start);
        canvas.removeEventListener('touchstart', start);
        window.removeEventListener('mousemove', move);
        window.removeEventListener('touchmove', move);
        window.removeEventListener('mouseup', end);
        window.removeEventListener('touchend', end);
    };
  }, [isRevealed, onRevealComplete]);

  return (
    <div ref={containerRef} className="relative w-full h-full rounded-xl overflow-hidden">
        {/* The content to be revealed */}
        <div className="w-full h-full">
            {children}
        </div>
        {/* The scratch canvas overlay */}
        <canvas 
            ref={canvasRef} 
            className="absolute top-0 left-0 cursor-crosshair touch-none"
            style={{ zIndex: 20 }} 
        />
    </div>
  );
};