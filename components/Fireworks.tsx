import React, { useEffect, useRef } from 'react';

interface FireworksProps {
    active: boolean;
}

export const Fireworks: React.FC<FireworksProps> = ({ active }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();

    useEffect(() => {
        if (!active) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        let width = window.innerWidth;
        let height = window.innerHeight;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        // Particle class for firework particles
        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            alpha: number;
            color: string;
            size: number;
            decay: number;
            gravity: number;

            constructor(x: number, y: number, color: string) {
                this.x = x;
                this.y = y;
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 6 + 2;
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed;
                this.alpha = 1;
                this.color = color;
                this.size = Math.random() * 3 + 1;
                this.decay = Math.random() * 0.015 + 0.01;
                this.gravity = 0.05;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.vy += this.gravity;
                this.vx *= 0.99;
                this.alpha -= this.decay;
            }

            draw() {
                if (!ctx) return;
                ctx.save();
                ctx.globalAlpha = Math.max(0, this.alpha);
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        // Rocket class for launching fireworks
        class Rocket {
            x: number;
            y: number;
            targetY: number;
            vy: number;
            exploded: boolean;
            color: string;
            trailParticles: Particle[];

            constructor() {
                this.x = Math.random() * width * 0.6 + width * 0.2;
                this.y = height;
                this.targetY = Math.random() * height * 0.4 + height * 0.1;
                this.vy = -8 - Math.random() * 4;
                this.exploded = false;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.trailParticles = [];
            }

            update(): Particle[] {
                const newParticles: Particle[] = [];

                if (!this.exploded) {
                    this.y += this.vy;
                    this.vy += 0.1;

                    // Trail effect
                    if (Math.random() > 0.3) {
                        const trail = new Particle(this.x, this.y, 'rgba(255, 220, 180, 0.8)');
                        trail.vx = (Math.random() - 0.5) * 0.5;
                        trail.vy = Math.random() * 2;
                        trail.size = 2;
                        trail.decay = 0.05;
                        this.trailParticles.push(trail);
                    }

                    // Explode when reaching target
                    if (this.y <= this.targetY || this.vy >= 0) {
                        this.exploded = true;
                        // Create explosion particles
                        const particleCount = 80 + Math.floor(Math.random() * 40);
                        for (let i = 0; i < particleCount; i++) {
                            newParticles.push(new Particle(this.x, this.y, this.color));
                        }
                    }
                }

                // Update trail particles
                this.trailParticles = this.trailParticles.filter(p => {
                    p.update();
                    return p.alpha > 0;
                });

                return newParticles;
            }

            draw() {
                if (!ctx) return;

                // Draw trail
                this.trailParticles.forEach(p => p.draw());

                if (!this.exploded) {
                    ctx.save();
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            }
        }

        const colors = [
            '#ff6b9d', // Pink
            '#c084fc', // Purple
            '#60a5fa', // Blue
            '#fbbf24', // Gold
            '#34d399', // Mint
            '#f472b6', // Hot pink
            '#a78bfa', // Violet
            '#fb7185', // Rose
        ];

        let rockets: Rocket[] = [];
        let particles: Particle[] = [];
        let lastLaunch = 0;
        const launchInterval = 800; // ms between launches

        const animate = (timestamp: number) => {
            ctx.clearRect(0, 0, width, height);

            // Launch new rockets periodically
            if (timestamp - lastLaunch > launchInterval) {
                rockets.push(new Rocket());
                lastLaunch = timestamp;
            }

            // Update and draw rockets
            rockets = rockets.filter(rocket => {
                const newParticles = rocket.update();
                particles.push(...newParticles);
                rocket.draw();
                return !rocket.exploded || rocket.trailParticles.length > 0;
            });

            // Update and draw particles
            particles = particles.filter(particle => {
                particle.update();
                particle.draw();
                return particle.alpha > 0;
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [active]);

    if (!active) return null;

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-[200]"
        />
    );
};
