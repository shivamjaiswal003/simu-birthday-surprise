import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';

interface Memory {
    url: string;
    caption: string;
}

interface MemoryGalleryProps {
    memories: Memory[];
    onComplete?: () => void;
}

// Slideshow component with Ken Burns effect
const SlideshowOverlay: React.FC<{
    memories: Memory[];
    selectedIndex: number;
    onClose: () => void;
    onNavigate: (index: number) => void;
}> = ({ memories, selectedIndex, onClose, onNavigate }) => {
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);
    const overlayRef = useRef<HTMLDivElement>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const captionRef = useRef<HTMLDivElement>(null);
    const autoPlayRef = useRef<number | null>(null);
    const kenBurnsRef = useRef<gsap.core.Tween | null>(null);

    // Auto-play logic
    useEffect(() => {
        if (isAutoPlaying) {
            autoPlayRef.current = window.setInterval(() => {
                onNavigate(selectedIndex < memories.length - 1 ? selectedIndex + 1 : 0);
            }, 5000);
        }
        return () => {
            if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        };
    }, [isAutoPlaying, selectedIndex, memories.length, onNavigate]);

    // Ken Burns effect on image
    useEffect(() => {
        if (!imageRef.current) return;

        // Kill previous animation
        kenBurnsRef.current?.kill();

        // Random starting position for variety
        const startScale = 1 + Math.random() * 0.1;
        const endScale = 1.15 + Math.random() * 0.05;
        const startX = (Math.random() - 0.5) * 5;
        const startY = (Math.random() - 0.5) * 5;
        const endX = (Math.random() - 0.5) * 5;
        const endY = (Math.random() - 0.5) * 5;

        // Reset and animate
        gsap.set(imageRef.current, {
            scale: startScale,
            x: startX + '%',
            y: startY + '%',
            opacity: 0,
        });

        // Fade in with smooth entrance
        gsap.to(imageRef.current, {
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out',
        });

        // Ken Burns pan & zoom
        kenBurnsRef.current = gsap.to(imageRef.current, {
            scale: endScale,
            x: endX + '%',
            y: endY + '%',
            duration: 12,
            ease: 'none',
        });

        // Animate caption
        if (captionRef.current) {
            gsap.fromTo(captionRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: 'power3.out' }
            );
        }

        return () => {
            kenBurnsRef.current?.kill();
        };
    }, [selectedIndex]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowLeft':
                    onNavigate(selectedIndex > 0 ? selectedIndex - 1 : memories.length - 1);
                    break;
                case 'ArrowRight':
                    onNavigate(selectedIndex < memories.length - 1 ? selectedIndex + 1 : 0);
                    break;
                case 'Escape':
                    onClose();
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIndex, memories.length, onNavigate, onClose]);

    // Prevent body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';

        // Entrance animation
        if (overlayRef.current) {
            gsap.fromTo(overlayRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.4, ease: 'power2.out' }
            );
        }

        return () => { document.body.style.overflow = ''; };
    }, []);

    const navigatePrev = () => onNavigate(selectedIndex > 0 ? selectedIndex - 1 : memories.length - 1);
    const navigateNext = () => onNavigate(selectedIndex < memories.length - 1 ? selectedIndex + 1 : 0);

    const handleClose = () => {
        if (overlayRef.current) {
            gsap.to(overlayRef.current, {
                opacity: 0,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: onClose,
            });
        } else {
            onClose();
        }
    };

    return createPortal(
        <div
            ref={overlayRef}
            className="fixed inset-0 bg-black/95 flex flex-col"
            style={{ zIndex: 99999 }}
            onClick={handleClose}
        >
            {/* Close Button */}
            <button
                onClick={handleClose}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl flex items-center justify-center z-50 transition-all duration-200 hover:scale-110"
                aria-label="Close"
            >
                ✕
            </button>

            {/* Main Image Area with Ken Burns */}
            <div
                ref={imageContainerRef}
                className="flex-1 flex items-center justify-center p-4 sm:p-8 min-h-0 overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-lg">
                    <img
                        ref={imageRef}
                        src={memories[selectedIndex].url}
                        alt={memories[selectedIndex].caption}
                        className="max-w-full max-h-full object-contain shadow-2xl"
                        style={{
                            maxHeight: 'calc(100vh - 220px)',
                            transformOrigin: 'center center',
                        }}
                    />
                </div>
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={(e) => { e.stopPropagation(); navigatePrev(); }}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/25 text-white text-2xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                aria-label="Previous"
            >
                ‹
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); navigateNext(); }}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/25 text-white text-2xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                aria-label="Next"
            >
                ›
            </button>

            {/* Bottom Section */}
            <div
                ref={captionRef}
                className="shrink-0 bg-gradient-to-t from-black via-black/90 to-transparent pt-6 pb-4 px-4"
                onClick={e => e.stopPropagation()}
            >
                {/* Caption */}
                <div className="text-center mb-4">
                    <p className="text-white text-base sm:text-lg md:text-xl font-light leading-relaxed max-w-xl mx-auto">
                        "{memories[selectedIndex].caption}"
                    </p>
                    <p className="text-pink-400 text-sm mt-2 font-medium">
                        {selectedIndex + 1} of {memories.length}
                    </p>
                </div>

                {/* Thumbnail Strip */}
                <div className="flex justify-center mb-3">
                    <div className="flex gap-1.5 sm:gap-2 p-2 bg-white/5 rounded-xl overflow-x-auto max-w-[95vw]">
                        {memories.map((memory, index) => (
                            <button
                                key={index}
                                onClick={() => onNavigate(index)}
                                className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden transition-all duration-300 ${index === selectedIndex
                                    ? 'ring-2 ring-pink-400 scale-110 shadow-lg shadow-pink-500/20'
                                    : 'opacity-50 hover:opacity-80 hover:scale-105'
                                    }`}
                            >
                                <img
                                    src={memory.url}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex justify-center">
                    <div className="flex gap-4 items-center bg-white/10 rounded-full px-5 py-2">
                        <button
                            onClick={navigatePrev}
                            className="text-white/70 hover:text-white text-lg transition-all duration-200 hover:scale-110"
                        >
                            ⏮
                        </button>
                        <button
                            onClick={() => setIsAutoPlaying(p => !p)}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${isAutoPlaying
                                ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
                                : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                        >
                            {isAutoPlaying ? '⏸' : '▶'}
                        </button>
                        <button
                            onClick={navigateNext}
                            className="text-white/70 hover:text-white text-lg transition-all duration-200 hover:scale-110"
                        >
                            ⏭
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export const MemoryGallery: React.FC<MemoryGalleryProps> = ({ memories }) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    const openSlideshow = (index: number) => setSelectedIndex(index);
    const closeSlideshow = useCallback(() => setSelectedIndex(null), []);
    const navigateTo = useCallback((index: number) => setSelectedIndex(index), []);

    // Quick stagger entrance - items start partially visible
    useEffect(() => {
        if (!gridRef.current) return;

        const items = gridRef.current.querySelectorAll('.gallery-item');

        // Start items semi-visible to avoid "broken loading" appearance
        gsap.set(items, { opacity: 0.5, y: 10, scale: 0.95 });

        // Quick reveal - all items appear within 0.4s total
        gsap.to(items, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.3,
            stagger: 0.03, // 9 items × 0.03s = 0.27s total
            ease: 'power2.out',
        });
    }, []);

    return (
        <div className="w-full">
            {/* Gallery Grid - Compact 3-column layout */}
            <div ref={gridRef} className="grid grid-cols-3 gap-2">
                {memories.map((memory, index) => (
                    <div
                        key={index}
                        onClick={() => openSlideshow(index)}
                        className="gallery-item relative group cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 aspect-square bg-gray-100"
                        onMouseEnter={(e) => {
                            gsap.to(e.currentTarget, {
                                scale: 1.03,
                                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                                duration: 0.3,
                                ease: 'power2.out',
                            });
                            const img = e.currentTarget.querySelector('img');
                            if (img) {
                                gsap.to(img, { scale: 1.1, duration: 0.4, ease: 'power2.out' });
                            }
                        }}
                        onMouseLeave={(e) => {
                            gsap.to(e.currentTarget, {
                                scale: 1,
                                boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
                                duration: 0.3,
                                ease: 'power2.out',
                            });
                            const img = e.currentTarget.querySelector('img');
                            if (img) {
                                gsap.to(img, { scale: 1, duration: 0.4, ease: 'power2.out' });
                            }
                        }}
                    >
                        <img
                            src={memory.url}
                            alt={memory.caption}
                            loading="lazy"
                            className="w-full h-full object-cover"
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        {/* Caption - smaller on compact grid */}
                        <div className="absolute bottom-0 left-0 right-0 p-2">
                            <p className="text-white text-[10px] sm:text-xs font-medium line-clamp-1 drop-shadow">
                                {memory.caption}
                            </p>
                        </div>

                        {/* Play indicator */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform group-hover:scale-100 scale-75 transition-transform duration-300">
                                <span className="text-pink-500 text-sm ml-0.5">▶</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Slideshow */}
            {selectedIndex !== null && (
                <SlideshowOverlay
                    memories={memories}
                    selectedIndex={selectedIndex}
                    onClose={closeSlideshow}
                    onNavigate={navigateTo}
                />
            )}
        </div>
    );
};

