import React, { useRef, useEffect, useState, useCallback } from 'react';

interface HeartTreeAnimationProps {
    onComplete: () => void;
    recipientName: string;
}

// Point class for vector math
class Point {
    x: number;
    y: number;

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    clone(): Point {
        return new Point(this.x, this.y);
    }

    add(o: Point): Point {
        return new Point(this.x + o.x, this.y + o.y);
    }

    mul(n: number): Point {
        return new Point(this.x * n, this.y * n);
    }
}

// Bezier curve calculation
function bezier(cp: Point[], t: number): Point {
    const p1 = cp[0].mul((1 - t) * (1 - t));
    const p2 = cp[1].mul(2 * t * (1 - t));
    const p3 = cp[2].mul(t * t);
    return p1.add(p2).add(p3);
}

// Check if point is inside heart shape
function inheart(x: number, y: number, r: number): boolean {
    const nx = x / r;
    const ny = y / r;
    const z = (nx * nx + ny * ny - 1) ** 3 - nx * nx * ny * ny * ny;
    return z < 0;
}

// Random number generator
function random(min: number, max: number): number {
    return min + Math.floor(Math.random() * (max - min + 1));
}

// Generate heart shape points using parametric equations
function generateHeartPoints(): Point[] {
    const points: Point[] = [];
    for (let i = 10; i < 30; i += 0.2) {
        const t = i / Math.PI;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        points.push(new Point(x, y));
    }
    return points;
}

interface BranchData {
    point1: Point;
    point2: Point;
    point3: Point;
    radius: number;
    length: number;
    len: number;
    t: number;
    children: unknown[];
}

interface BloomData {
    point: Point;
    color: string;
    alpha: number;
    angle: number;
    scale: number;
}

export const HeartTreeAnimation: React.FC<HeartTreeAnimationProps> = ({
    onComplete,
    recipientName,
    onStartMusic,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [clicked, setClicked] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [dimensions, setDimensions] = useState({ width: 1100, height: 680 });
    const animationRef = useRef<number | null>(null);
    const heartPointsRef = useRef<Point[]>(generateHeartPoints());

    // State for animation
    const stateRef = useRef({
        stage: 'waiting' as 'waiting' | 'shrinking' | 'dropping' | 'growing' | 'blooming' | 'done',
        // Seed state
        seedPoint: new Point(0, 0),
        seedScale: 2,
        // Footer state
        footerLength: 0,
        // Branch state
        branches: [] as BranchData[],
        // Bloom state
        blooms: [] as BloomData[],
        bloomsCache: [] as BloomData[],
    });

    // Responsive sizing
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const width = Math.min(rect.width, 1100);
                const height = Math.min(rect.height, 680);
                setDimensions({ width, height });
            }
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // Initialize seed position when dimensions change
    useEffect(() => {
        stateRef.current.seedPoint = new Point(dimensions.width / 2 - 20, dimensions.height / 2);
    }, [dimensions]);

    // Initialize blooms cache
    useEffect(() => {
        const { width, height } = dimensions;
        const cache: BloomData[] = [];
        const r = 240;

        for (let i = 0; i < 700; i++) {
            let x: number, y: number;
            let attempts = 0;
            do {
                x = random(20, width - 20);
                y = random(20, height - 20);
                attempts++;
            } while (!inheart(x - width / 2, height - (height - 40) / 2 - y, r) && attempts < 100);

            if (attempts < 100) {
                cache.push({
                    point: new Point(x, y),
                    color: `rgb(255, ${random(0, 255)}, ${random(0, 255)})`,
                    alpha: 0.3 + Math.random() * 0.7,
                    angle: random(0, 360) * (Math.PI / 180),
                    scale: 0.1,
                });
            }
        }
        stateRef.current.bloomsCache = cache;
    }, [dimensions]);

    // Draw heart shape
    const drawHeart = useCallback(
        (ctx: CanvasRenderingContext2D, point: Point, scale: number, color: string) => {
            const heartPoints = heartPointsRef.current;
            ctx.save();
            ctx.fillStyle = color;
            ctx.translate(point.x, point.y);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            for (let i = 0; i < heartPoints.length; i++) {
                const p = heartPoints[i].mul(scale);
                ctx.lineTo(p.x, -p.y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        },
        []
    );

    // Draw text label
    const drawText = useCallback(
        (ctx: CanvasRenderingContext2D, point: Point, scale: number, color: string) => {
            ctx.save();
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.translate(point.x, point.y);
            ctx.scale(scale, scale);
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(15, 15);
            ctx.lineTo(130, 15);
            ctx.stroke();

            ctx.scale(0.75, 0.75);
            ctx.font = '12px Verdana, sans-serif';
            ctx.fillText('Click Me :)', 30, -5);
            ctx.fillText(`Birthday Queen ${recipientName}!`, 28, 10);
            ctx.restore();
        },
        [recipientName]
    );

    // Draw footer (white ground line)
    const drawFooter = useCallback(
        (ctx: CanvasRenderingContext2D, centerX: number, height: number, length: number) => {
            const len = length / 2;
            ctx.save();
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.translate(centerX, height - 2.5);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(len, 0);
            ctx.lineTo(-len, 0);
            ctx.stroke();
            ctx.restore();
        },
        []
    );

    // Draw circle (for seed/branch)
    const drawCircle = useCallback(
        (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string) => {
            ctx.save();
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
        },
        []
    );

    // Draw initial seed (before click)
    useEffect(() => {
        if (clicked) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { width, height } = dimensions;
        const seedPoint = new Point(width / 2 - 20, height / 2);

        // Clear with black background
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);

        // Draw the seed heart and text
        drawHeart(ctx, seedPoint, 2, '#FFC0CB');
        drawText(ctx, seedPoint, 2, '#FFC0CB');
    }, [clicked, dimensions, drawHeart, drawText]);

    // Main animation loop
    useEffect(() => {
        if (!clicked) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { width, height } = dimensions;
        const state = stateRef.current;
        const centerX = width / 2 - 20;

        // Scale factors
        const scaleX = width / 1100;
        const scaleY = height / 680;

        // Branch configuration from original
        const branchConfig = [
            [535, 680, 570, 250, 500, 200, 30, 100, [
                [540, 500, 455, 417, 340, 400, 13, 100, [[450, 435, 434, 430, 394, 395, 2, 40]]],
                [550, 445, 600, 356, 680, 345, 12, 100, [[578, 400, 648, 409, 661, 426, 3, 80]]],
                [539, 281, 537, 248, 534, 217, 3, 40],
                [546, 397, 413, 247, 328, 244, 9, 80, [
                    [427, 286, 383, 253, 371, 205, 2, 40],
                    [498, 345, 435, 315, 395, 330, 4, 60],
                ]],
                [546, 357, 608, 252, 678, 221, 6, 100, [[590, 293, 646, 277, 648, 271, 2, 80]]],
            ]],
        ];

        // Initialize branches from config
        const createBranch = (b: unknown[]): BranchData => ({
            point1: new Point((b[0] as number) * scaleX, (b[1] as number) * scaleY),
            point2: new Point((b[2] as number) * scaleX, (b[3] as number) * scaleY),
            point3: new Point((b[4] as number) * scaleX, (b[5] as number) * scaleY),
            radius: (b[6] as number) * Math.min(scaleX, scaleY),
            length: b[7] as number,
            len: 0,
            t: 1 / ((b[7] as number) - 1),
            children: (b[8] as unknown[]) || [],
        });

        // Clear and set black background
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);

        // Reset state
        state.stage = 'shrinking';
        state.seedPoint = new Point(centerX, height / 2);
        state.seedScale = 2;
        state.footerLength = 0;
        state.branches = [];
        state.blooms = [];

        let frameCount = 0;

        const animate = () => {
            frameCount++;

            switch (state.stage) {
                case 'shrinking': {
                    // Clear the area around the seed
                    const clearSize = 100;
                    ctx.fillStyle = '#000';
                    ctx.fillRect(
                        state.seedPoint.x - clearSize,
                        state.seedPoint.y - clearSize,
                        clearSize * 3,
                        clearSize * 2
                    );

                    // Draw shrinking heart and circle
                    drawCircle(ctx, state.seedPoint.x, state.seedPoint.y, 5, '#FFC0CB');
                    drawHeart(ctx, state.seedPoint, state.seedScale, '#FFC0CB');

                    state.seedScale *= 0.95;
                    if (state.seedScale <= 0.2) {
                        state.stage = 'dropping';
                    }
                    break;
                }

                case 'dropping': {
                    // Clear previous position
                    ctx.fillStyle = '#000';
                    ctx.fillRect(
                        state.seedPoint.x - 10,
                        state.seedPoint.y - 10,
                        20,
                        20
                    );

                    // Move seed down
                    state.seedPoint = state.seedPoint.add(new Point(0, 2));

                    // Draw the dropping circle
                    drawCircle(ctx, state.seedPoint.x, state.seedPoint.y, 5, '#FFC0CB');

                    // Draw and grow footer
                    drawFooter(ctx, centerX, height, state.footerLength);
                    if (state.footerLength < 1200) {
                        state.footerLength += 10;
                    }

                    // When seed reaches bottom, start growing
                    if (state.seedPoint.y >= height + 20) {
                        state.stage = 'growing';
                        // Initialize branches
                        for (const b of branchConfig) {
                            state.branches.push(createBranch(b));
                        }
                    }
                    break;
                }

                case 'growing': {
                    // Grow all active branches
                    const branchesToAdd: BranchData[] = [];
                    const branchesToRemove: number[] = [];

                    for (let i = 0; i < state.branches.length; i++) {
                        const branch = state.branches[i];
                        if (branch.len <= branch.length) {
                            // Calculate point on bezier curve
                            const p = bezier(
                                [branch.point1, branch.point2, branch.point3],
                                branch.len * branch.t
                            );

                            // Draw circle at this point (pink)
                            ctx.save();
                            ctx.beginPath();
                            ctx.fillStyle = '#FFC0CB';
                            ctx.shadowBlur = 2;
                            ctx.arc(p.x, p.y, branch.radius, 0, 2 * Math.PI);
                            ctx.fill();
                            ctx.restore();

                            branch.len += 1;
                            branch.radius *= 0.97;
                        } else {
                            // Branch is done, add children and mark for removal
                            branchesToRemove.push(i);
                            for (const child of branch.children) {
                                branchesToAdd.push(createBranch(child as unknown[]));
                            }
                        }
                    }

                    // Remove completed branches (in reverse order)
                    for (let i = branchesToRemove.length - 1; i >= 0; i--) {
                        state.branches.splice(branchesToRemove[i], 1);
                    }

                    // Add new branches
                    state.branches.push(...branchesToAdd);

                    // Check if all growing is done
                    if (state.branches.length === 0) {
                        state.stage = 'blooming';
                    }
                    break;
                }

                case 'blooming': {
                    // Add blooms from cache
                    if (state.bloomsCache.length > 0) {
                        const batch = state.bloomsCache.splice(0, 2);
                        state.blooms.push(...batch);
                    }

                    // Animate and draw blooms
                    const bloomsToRemove: number[] = [];
                    for (let i = 0; i < state.blooms.length; i++) {
                        const bloom = state.blooms[i];
                        const heartPoints = heartPointsRef.current;

                        // Draw bloom
                        ctx.save();
                        ctx.fillStyle = bloom.color;
                        ctx.globalAlpha = bloom.alpha;
                        ctx.translate(bloom.point.x, bloom.point.y);
                        ctx.scale(bloom.scale, bloom.scale);
                        ctx.rotate(bloom.angle);
                        ctx.beginPath();
                        ctx.moveTo(0, 0);
                        for (let j = 0; j < heartPoints.length; j++) {
                            const p = heartPoints[j];
                            ctx.lineTo(p.x, -p.y);
                        }
                        ctx.closePath();
                        ctx.fill();
                        ctx.restore();

                        // Grow bloom
                        bloom.scale += 0.1;
                        if (bloom.scale > 1) {
                            bloomsToRemove.push(i);
                        }
                    }

                    // Remove fully bloomed flowers
                    for (let i = bloomsToRemove.length - 1; i >= 0; i--) {
                        state.blooms.splice(bloomsToRemove[i], 1);
                    }

                    // Check if all blooming is done
                    if (state.bloomsCache.length === 0 && state.blooms.length === 0) {
                        state.stage = 'done';
                        // Start fade transition
                        setIsTransitioning(true);
                        // Call onComplete after transition animation
                        setTimeout(onComplete, 1800);
                    }
                    break;
                }

                case 'done':
                    // Animation complete, stop the loop
                    return;
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        // Start animation
        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [clicked, dimensions, drawHeart, drawCircle, drawFooter, onComplete]);

    // Handle canvas click
    const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (clicked) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = dimensions.width / rect.width;
        const scaleY = dimensions.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        // Check if click is near the heart (generous hitbox)
        const centerX = dimensions.width / 2 - 20;
        const centerY = dimensions.height / 2;
        const hitSize = 100;

        if (
            x >= centerX - hitSize &&
            x <= centerX + hitSize &&
            y >= centerY - hitSize &&
            y <= centerY + hitSize
        ) {
            setClicked(true);
            // Start music when heart is clicked
            if (onStartMusic) {
                onStartMusic();
            }
        }
    };

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: '#000' }}
        >
            <canvas
                ref={canvasRef}
                width={dimensions.width}
                height={dimensions.height}
                onClick={handleClick}
                className={!clicked ? 'cursor-pointer' : ''}
                style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                }}
            />
            {!clicked && (
                <div className="absolute bottom-8 text-center animate-bounce">
                    <p className="text-pink-400 font-semibold text-lg drop-shadow-lg">
                        👆 Click the heart to start the magic! 💫
                    </p>
                </div>
            )}

            {/* Smooth Transition Overlay */}
            {isTransitioning && (
                <div
                    className="absolute inset-0 z-[60] pointer-events-none"
                    style={{
                        background: 'linear-gradient(135deg, oklch(0.92 0.05 320) 0%, oklch(0.88 0.08 340) 50%, oklch(0.85 0.1 350) 100%)',
                        animation: 'fadeIn 1.5s ease-in-out forwards'
                    }}
                />
            )}

            <style>{`
                @keyframes fadeIn {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default HeartTreeAnimation;
