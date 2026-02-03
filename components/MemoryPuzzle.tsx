import React, { useState, useEffect, useCallback, useRef } from 'react';
import { gsap } from 'gsap';

interface MemoryPuzzleProps {
    imageUrl?: string;
    onComplete?: () => void;
}

// Default placeholder image
const DEFAULT_IMAGE = 'https://picsum.photos/300/300?random=puzzle';

export const MemoryPuzzle: React.FC<MemoryPuzzleProps> = ({
    imageUrl = DEFAULT_IMAGE,
    onComplete
}) => {
    const [tiles, setTiles] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [showSolution, setShowSolution] = useState(false);
    const timerRef = useRef<number | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const tileRefs = useRef<(HTMLButtonElement | null)[]>([]);

    // Generate a solvable puzzle
    const generateSolvablePuzzle = useCallback(() => {
        const solved = [1, 2, 3, 4, 5, 6, 7, 8, 0];
        let shuffled: number[];

        do {
            shuffled = [...solved].sort(() => Math.random() - 0.5);
        } while (!isSolvable(shuffled) || arraysEqual(shuffled, solved));

        return shuffled;
    }, []);

    // Check if puzzle is solvable
    const isSolvable = (arr: number[]): boolean => {
        let inversions = 0;
        const filtered = arr.filter(n => n !== 0);

        for (let i = 0; i < filtered.length; i++) {
            for (let j = i + 1; j < filtered.length; j++) {
                if (filtered[i] > filtered[j]) inversions++;
            }
        }

        return inversions % 2 === 0;
    };

    const arraysEqual = (a: number[], b: number[]): boolean => {
        return a.every((val, idx) => val === b[idx]);
    };

    // Check if puzzle is solved
    const checkWin = useCallback((currentTiles: number[]): boolean => {
        const solution = [1, 2, 3, 4, 5, 6, 7, 8, 0];
        return arraysEqual(currentTiles, solution);
    }, []);

    // Initialize puzzle with entrance animation
    useEffect(() => {
        const newTiles = generateSolvablePuzzle();
        setTiles(newTiles);

        // Stagger entrance animation
        setTimeout(() => {
            tileRefs.current.forEach((tile, i) => {
                if (tile && newTiles[i] !== 0) {
                    gsap.fromTo(tile,
                        {
                            scale: 0,
                            rotationY: 180,
                            opacity: 0
                        },
                        {
                            scale: 1,
                            rotationY: 0,
                            opacity: 1,
                            duration: 0.5,
                            delay: i * 0.06,
                            ease: 'back.out(1.7)',
                        }
                    );
                }
            });
        }, 100);
    }, [generateSolvablePuzzle]);

    // Timer logic
    useEffect(() => {
        if (isRunning && !isComplete) {
            timerRef.current = window.setInterval(() => {
                setTime(prev => prev + 1);
            }, 1000);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning, isComplete]);

    // Handle tile click
    const handleTileClick = (index: number) => {
        if (isComplete || tiles[index] === 0) return;

        const emptyIndex = tiles.indexOf(0);
        const row = Math.floor(index / 3);
        const col = index % 3;
        const emptyRow = Math.floor(emptyIndex / 3);
        const emptyCol = emptyIndex % 3;

        // Check if adjacent to empty space
        const isAdjacent =
            (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
            (Math.abs(col - emptyCol) === 1 && row === emptyRow);

        if (isAdjacent) {
            // Start timer on first move
            if (!isRunning) setIsRunning(true);

            // Animate the tile sliding
            const clickedTile = tileRefs.current[index];
            if (clickedTile) {
                // Calculate direction
                const dx = (emptyCol - col) * 100;
                const dy = (emptyRow - row) * 100;

                gsap.to(clickedTile, {
                    x: dx + '%',
                    y: dy + '%',
                    duration: 0.2,
                    ease: 'power2.out',
                    onComplete: () => {
                        // Reset position after state update
                        gsap.set(clickedTile, { x: 0, y: 0 });
                    }
                });
            }

            // Swap tiles after animation starts
            setTimeout(() => {
                const newTiles = [...tiles];
                [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
                setTiles(newTiles);
                setMoves(prev => prev + 1);

                // Check for win
                if (checkWin(newTiles)) {
                    setIsComplete(true);
                    setIsRunning(false);

                    // Celebration animation
                    if (gridRef.current) {
                        gsap.timeline()
                            .to(gridRef.current, {
                                scale: 1.08,
                                duration: 0.3,
                                ease: 'power2.out'
                            })
                            .to(gridRef.current, {
                                scale: 1,
                                duration: 0.5,
                                ease: 'elastic.out(1, 0.5)'
                            });

                        // Animate all tiles with wave effect
                        tileRefs.current.forEach((tile, i) => {
                            if (tile) {
                                gsap.to(tile, {
                                    rotationY: 360,
                                    duration: 0.6,
                                    delay: i * 0.05,
                                    ease: 'power2.out',
                                });
                            }
                        });
                    }

                    onComplete?.();
                }
            }, 150);
        }
    };

    // Reset puzzle
    const handleReset = () => {
        const newTiles = generateSolvablePuzzle();

        // Flip out animation
        tileRefs.current.forEach((tile, i) => {
            if (tile) {
                gsap.to(tile, {
                    scale: 0,
                    rotationY: -180,
                    duration: 0.3,
                    delay: i * 0.03,
                    ease: 'power2.in',
                });
            }
        });

        setTimeout(() => {
            setTiles(newTiles);
            setMoves(0);
            setTime(0);
            setIsRunning(false);
            setIsComplete(false);

            // Flip in animation
            setTimeout(() => {
                tileRefs.current.forEach((tile, i) => {
                    if (tile && newTiles[i] !== 0) {
                        gsap.fromTo(tile,
                            { scale: 0, rotationY: 180 },
                            {
                                scale: 1,
                                rotationY: 0,
                                duration: 0.4,
                                delay: i * 0.04,
                                ease: 'back.out(1.5)',
                            }
                        );
                    }
                });
            }, 100);
        }, 350);
    };

    // Format time display
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Get background position for tile
    const getTileStyle = (tileValue: number) => {
        if (tileValue === 0) return { visibility: 'hidden' as const };

        const row = Math.floor((tileValue - 1) / 3);
        const col = (tileValue - 1) % 3;

        return {
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: '300% 300%',
            backgroundPosition: `${col * 50}% ${row * 50}%`,
        };
    };

    return (
        <div className="flex flex-col items-center w-full space-y-6">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Memory Puzzle 🧩
                </h2>
                <p className="text-gray-500 text-sm">
                    Slide the tiles to reveal the hidden photo!
                </p>
            </div>

            {/* Stats */}
            <div className="flex gap-8 justify-center">
                <div className="text-center">
                    <p className="text-3xl font-bold text-pink-500">{moves}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Moves</p>
                </div>
                <div className="text-center">
                    <p className="text-3xl font-bold text-purple-500">{formatTime(time)}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Time</p>
                </div>
            </div>

            {/* Puzzle Grid */}
            <div
                ref={gridRef}
                className="relative w-[300px] h-[300px] bg-white/30 rounded-2xl p-2 shadow-xl backdrop-blur-sm border border-white/50"
                style={{ perspective: '1000px' }}
            >
                <div className="grid grid-cols-3 gap-1 w-full h-full">
                    {tiles.map((tile, index) => (
                        <button
                            key={index}
                            ref={el => tileRefs.current[index] = el}
                            onClick={() => handleTileClick(index)}
                            disabled={tile === 0 || isComplete}
                            className={`
                                relative rounded-lg overflow-hidden
                                ${tile === 0
                                    ? 'bg-transparent'
                                    : 'bg-pink-100 shadow-md cursor-pointer'
                                }
                            `}
                            style={{
                                ...getTileStyle(tile),
                                transformStyle: 'preserve-3d',
                                backfaceVisibility: 'hidden',
                            }}
                            onMouseEnter={(e) => {
                                if (tile !== 0 && !isComplete) {
                                    gsap.to(e.currentTarget, {
                                        scale: 1.05,
                                        boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                                        duration: 0.2,
                                        ease: 'power2.out',
                                    });
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (tile !== 0) {
                                    gsap.to(e.currentTarget, {
                                        scale: 1,
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                        duration: 0.2,
                                        ease: 'power2.out',
                                    });
                                }
                            }}
                        >
                            {/* Tile number overlay */}
                            {tile !== 0 && (
                                <span className="absolute bottom-1 right-1 text-xs font-bold text-white/70 drop-shadow-lg">
                                    {tile}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Win Overlay */}
                {isComplete && (
                    <div
                        className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-pink-400/90 to-purple-500/90 rounded-2xl backdrop-blur-sm"
                        style={{ animation: 'celebratePulse 2s ease-in-out infinite' }}
                    >
                        <span className="text-6xl mb-4">🎉</span>
                        <h3 className="text-2xl font-black text-white drop-shadow-lg">
                            Congratulations!
                        </h3>
                        <p className="text-white/90 mt-2">
                            Solved in {moves} moves & {formatTime(time)}
                        </p>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="flex gap-4">
                <button
                    onClick={() => setShowSolution(true)}
                    className="px-4 py-2 rounded-xl bg-white/60 hover:bg-white/80 text-gray-700 font-medium transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm border border-white/50 hover:scale-105"
                >
                    👀 Show Solution
                </button>
                <button
                    onClick={handleReset}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
                >
                    🔄 Reset
                </button>
            </div>

            {/* Solution Modal */}
            {showSolution && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={() => setShowSolution(false)}
                >
                    <div
                        className="relative bg-white rounded-2xl p-4 shadow-2xl max-w-[90vw] max-h-[90vh]"
                        onClick={e => e.stopPropagation()}
                        style={{ animation: 'modalIn 0.3s ease-out' }}
                    >
                        <button
                            onClick={() => setShowSolution(false)}
                            className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-pink-500 text-white font-bold shadow-lg hover:bg-pink-600 transition-all duration-200 flex items-center justify-center hover:scale-110"
                        >
                            ×
                        </button>
                        <p className="text-center text-gray-500 mb-3 font-medium">
                            The completed image:
                        </p>
                        <img
                            src={imageUrl}
                            alt="Solution"
                            className="w-[300px] h-[300px] object-cover rounded-xl shadow-inner"
                        />
                    </div>
                </div>
            )}

            {/* Styles */}
            <style>{`
                @keyframes celebratePulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                }
                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};
