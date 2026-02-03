import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Button } from './Button';

interface FinaleProps {
    recipientName: string;
    onReplay: () => void;
    videoUrl?: string;
    onVideoPlay?: () => void;
    onVideoEnd?: () => void;
}

export const Finale: React.FC<FinaleProps> = ({
    recipientName,
    onReplay,
    videoUrl,
    onVideoPlay,
    onVideoEnd
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const videoContainerRef = useRef<HTMLDivElement>(null);
    const [showContent, setShowContent] = useState(false);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showVideo, setShowVideo] = useState(false);

    useEffect(() => {
        // Delay content reveal for dramatic effect
        const timer = setTimeout(() => setShowContent(true), 400);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!showContent || !containerRef.current) return;

        const ctx = gsap.context(() => {
            // Split title text and animate each character
            const titleChars = titleRef.current?.querySelectorAll('.title-char');
            if (titleChars) {
                gsap.fromTo(titleChars,
                    {
                        opacity: 0,
                        y: 50,
                        rotationX: -90,
                        scale: 0.5,
                    },
                    {
                        opacity: 1,
                        y: 0,
                        rotationX: 0,
                        scale: 1,
                        duration: 0.8,
                        stagger: 0.04,
                        ease: 'back.out(1.7)',
                        delay: 0.3
                    }
                );
            }

            // Animate sparkles with random delays
            gsap.fromTo('.finale-sparkle',
                { scale: 0, opacity: 0, rotation: -180 },
                {
                    scale: 1,
                    opacity: 1,
                    rotation: 0,
                    duration: 0.6,
                    stagger: { each: 0.05, from: 'random' },
                    ease: 'elastic.out(1, 0.5)',
                    delay: 0.8
                }
            );

            // Animate sparkle continuous float
            gsap.to('.finale-sparkle', {
                y: -10,
                duration: 1.5,
                stagger: { each: 0.1, from: 'random' },
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1,
            });

            // Animate emoji wave
            gsap.fromTo('.finale-emoji',
                { y: -80, opacity: 0, rotation: -30 },
                {
                    y: 0,
                    opacity: 1,
                    rotation: 0,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: 'bounce.out',
                    delay: 1.2
                }
            );

            // Continuous emoji wave animation
            gsap.to('.finale-emoji', {
                y: -8,
                rotation: 5,
                duration: 1.2,
                stagger: { each: 0.1, from: 'start' },
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1,
                delay: 2,
            });

            // Animate message with scale
            gsap.fromTo('.finale-message',
                { y: 40, opacity: 0, scale: 0.9 },
                {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.8,
                    ease: 'power3.out',
                    delay: 2
                }
            );

            // Animate buttons
            gsap.fromTo('.finale-buttons',
                { y: 30, opacity: 0, scale: 0.95 },
                {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.6,
                    ease: 'back.out(1.5)',
                    delay: 2.4
                }
            );
        }, containerRef);

        return () => ctx.revert();
    }, [showContent]);

    const sparklePositions = [
        { top: '5%', left: '10%' },
        { top: '10%', right: '15%' },
        { top: '25%', left: '5%' },
        { top: '30%', right: '8%' },
        { top: '60%', left: '12%' },
        { top: '70%', right: '10%' },
        { top: '85%', left: '20%' },
        { top: '80%', right: '25%' },
    ];

    const emojis = ['🎂', '🥳', '🎁', '💝', '🎈', '🎊', '✨', '💖'];

    // Split text into characters for animation
    const renderAnimatedText = (text: string) => {
        return text.split('').map((char, i) => (
            <span
                key={i}
                className="title-char inline-block"
                style={{
                    display: char === ' ' ? 'inline' : 'inline-block',
                    transformStyle: 'preserve-3d',
                }}
            >
                {char === ' ' ? '\u00A0' : char}
            </span>
        ));
    };

    const handlePlayVideo = () => {
        setShowVideo(true);
        onVideoPlay?.();

        // Small delay to let the video element mount
        setTimeout(() => {
            if (videoRef.current) {
                videoRef.current.play().catch(console.error);
                setIsVideoPlaying(true);
            }
        }, 100);
    };

    const handleVideoEnded = () => {
        setIsVideoPlaying(false);
        onVideoEnd?.();
    };

    const handleVideoPlay = () => {
        setIsVideoPlaying(true);
        onVideoPlay?.();
    };

    const handleVideoPause = () => {
        setIsVideoPlaying(false);
    };

    const toggleFullscreen = async () => {
        if (!videoContainerRef.current) return;

        try {
            if (!document.fullscreenElement) {
                await videoContainerRef.current.requestFullscreen();
                setIsFullscreen(true);
            } else {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        } catch (err) {
            console.error('Fullscreen error:', err);
        }
    };

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const closeVideo = () => {
        if (videoRef.current) {
            videoRef.current.pause();
        }
        setShowVideo(false);
        setIsVideoPlaying(false);
        onVideoEnd?.();
    };

    return (
        <div
            ref={containerRef}
            className="flex flex-col items-center justify-center w-full min-h-[400px] relative overflow-visible py-8"
        >
            {/* Sparkles */}
            {sparklePositions.map((pos, i) => (
                <div
                    key={i}
                    className="finale-sparkle absolute text-2xl pointer-events-none"
                    style={{ ...pos }}
                >
                    ✨
                </div>
            ))}

            {/* Main Birthday Message */}
            {showContent && (
                <>
                    <h1
                        ref={titleRef}
                        className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 text-center leading-tight mb-4 drop-shadow-lg"
                        style={{
                            backgroundSize: '200% auto',
                            animation: 'shimmer 3s linear infinite',
                            perspective: '1000px',
                        }}
                    >
                        {renderAnimatedText('Happy Birthday,')}
                        <br />
                        {renderAnimatedText(`${recipientName}!`)}
                        <span className="title-char inline-block"> 🎂</span>
                    </h1>

                    {/* Floating Emojis */}
                    <div className="flex gap-3 my-6">
                        {emojis.map((emoji, i) => (
                            <span
                                key={i}
                                className="finale-emoji text-2xl md:text-3xl"
                                style={{ transformOrigin: 'center bottom' }}
                            >
                                {emoji}
                            </span>
                        ))}
                    </div>

                    {/* Sweet Message */}
                    <div className="finale-message text-center max-w-md px-4 mb-8">
                        <p className="text-xl md:text-2xl text-gray-700 font-medium leading-relaxed">
                            May this year bring you endless{' '}
                            <span className="text-pink-500 font-bold">joy</span>,{' '}
                            <span className="text-purple-500 font-bold">love</span>,{' '}
                            <span className="text-pink-500 font-bold">beautiful moments</span> and{' '}
                            <span className="text-purple-500 font-bold">a whole lot of Success  </span>! 💕
                        </p>
                        <p className="text-lg text-gray-500 mt-4 italic">
                            I love you more than words can say ❤️
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="finale-buttons flex flex-col sm:flex-row gap-4 items-center">
                        {videoUrl && (
                            <Button
                                onClick={handlePlayVideo}
                                variant="primary"
                                size="normal"
                                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                            >
                                🎬 Watch Our Video
                            </Button>
                        )}
                        <Button onClick={onReplay} variant="secondary" size="normal">
                            🔄 Replay Surprise
                        </Button>
                    </div>
                </>
            )}

            {/* Video Modal */}
            {showVideo && videoUrl && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
                    onClick={closeVideo}
                >
                    <div
                        ref={videoContainerRef}
                        className={`relative w-full ${isFullscreen ? 'h-full' : 'max-w-4xl mx-4'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={closeVideo}
                            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white text-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                        >
                            ✕
                        </button>

                        {/* Fullscreen Button */}
                        <button
                            onClick={toggleFullscreen}
                            className="absolute top-4 right-16 z-50 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white text-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                        >
                            {isFullscreen ? '⊙' : '⛶'}
                        </button>

                        {/* Video Player */}
                        <video
                            ref={videoRef}
                            src={videoUrl}
                            className={`w-full ${isFullscreen ? 'h-full object-contain' : 'rounded-2xl shadow-2xl'}`}
                            controls
                            playsInline
                            onEnded={handleVideoEnded}
                            onPlay={handleVideoPlay}
                            onPause={handleVideoPause}
                        />

                        {/* Emotional Text Overlay (shows when paused) */}
                        {!isVideoPlaying && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl pointer-events-none">
                                <p className="text-white text-2xl font-bold text-center px-8 drop-shadow-lg">
                                    Made with love, just for you 💕
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Keyframe Animations */}
            <style>{`
                @keyframes shimmer {
                    0% { background-position: 200% center; }
                    100% { background-position: -200% center; }
                }
            `}</style>
        </div>
    );
};

