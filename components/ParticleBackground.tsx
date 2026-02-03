import React, { useEffect, useRef } from 'react';

export const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // Handle High DPI displays for crispness
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Configuration
    const particleCount = 150; 
    const particles: Snowflake[] = [];
    let mouse = { x: -1000, y: -1000 };

    class Snowflake {
      x: number;
      y: number;
      radius: number;
      density: number;
      color: string;
      vx: number;
      vy: number;
      originalVx: number; // To restore drift after interaction

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = Math.random() * 2 + 0.5; // Small, delicate snow
        this.density = Math.random() * particleCount;
        
        // Romantic palette: mostly white, some faint pink/gold hints
        const colors = [
            `rgba(255, 255, 255, ${Math.random() * 0.4 + 0.4})`, // White
            `rgba(255, 255, 255, ${Math.random() * 0.4 + 0.4})`, // White
            `rgba(255, 240, 245, ${Math.random() * 0.4 + 0.4})`, // Lavender blush
            `rgba(255, 228, 225, ${Math.random() * 0.3 + 0.3})`  // Misty rose
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        this.vx = Math.random() * 0.5 - 0.25; // Gentle drift
        this.vy = Math.random() * 1.5 + 0.5;  // Falling speed
        this.originalVx = this.vx;
      }

      update() {
        // Apply sine wave sway based on density and vertical position
        const sway = Math.sin(this.density + this.y / 80) * 0.3;
        
        // Interactive Wind from Mouse
        // Calculate distance from mouse
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const interactionRadius = 150;

        let forceX = 0;
        let forceY = 0;

        if (distance < interactionRadius) {
            // Repulsive force, simulating wind pushing snow away
            const force = (interactionRadius - distance) / interactionRadius;
            const directionX = dx / distance;
            const directionY = dy / distance;
            
            // Push stronger horizontally, lighter vertically
            forceX = directionX * force * 2; 
            forceY = directionY * force * 2; 
        }

        // Apply velocities
        this.x += this.vx + sway + forceX;
        this.y += this.vy + forceY;

        // Reset snow if it goes off screen
        if (this.y > height) {
            this.y = -10;
            this.x = Math.random() * width;
        }
        
        // Wrap horizontal
        if (this.x > width + 10) this.x = -10;
        if (this.x < -10) this.x = width + 10;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.fillStyle = this.color;
        // Soft circle for snow
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Snowflake());
    }

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Event Listeners
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    
    // Reset mouse when leaving window so snow falls naturally
    const handleMouseLeave = () => {
        mouse.x = -1000;
        mouse.y = -1000;
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseleave', handleMouseLeave); // Reset on exit
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-0" />;
};