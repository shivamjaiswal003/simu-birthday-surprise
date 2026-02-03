import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { createPortal } from 'react-dom';

interface VoiceNotePlayerProps {
    voiceNoteUrl: string;
    correctDate: string; // YYYY-MM-DD format
    onClose: () => void;
    onPlay?: () => void;
    onPause?: () => void;
}

export const VoiceNotePlayer: React.FC<VoiceNotePlayerProps> = ({
    voiceNoteUrl,
    correctDate,
    onClose,
    onPlay,
    onPause,
}) => {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [error, setError] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Entrance animation
    useEffect(() => {
        if (modalRef.current) {
            gsap.fromTo(modalRef.current,
                { opacity: 0, scale: 0.9, y: 20 },
                { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
            );
        }
    }, []);

    // Focus animation for unlocked state
    useEffect(() => {
        if (isUnlocked && modalRef.current) {
            gsap.to(modalRef.current, {
                scale: 1.02,
                duration: 0.3,
                yoyo: true,
                repeat: 1,
                ease: 'power2.inOut',
            });
        }
    }, [isUnlocked]);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSelectedDate(value);
        setError(false);

        // Check if the selected date matches
        if (value === correctDate) {
            // Success animation
            if (inputRef.current) {
                gsap.to(inputRef.current, {
                    borderColor: '#22c55e',
                    boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)',
                    duration: 0.3,
                });
            }
            setTimeout(() => {
                setIsUnlocked(true);
            }, 500);
        }
    };

    const handleSubmit = () => {
        if (selectedDate === correctDate) {
            setIsUnlocked(true);
        } else {
            setError(true);
            // Shake animation on error
            if (inputRef.current) {
                gsap.timeline()
                    .to(inputRef.current, { x: -10, duration: 0.05 })
                    .to(inputRef.current, { x: 10, duration: 0.05 })
                    .to(inputRef.current, { x: -10, duration: 0.05 })
                    .to(inputRef.current, { x: 10, duration: 0.05 })
                    .to(inputRef.current, { x: 0, duration: 0.05 });
                gsap.to(inputRef.current, {
                    borderColor: '#ef4444',
                    duration: 0.2,
                });
            }
        }
    };

    const handleClose = () => {
        if (modalRef.current) {
            gsap.to(modalRef.current, {
                opacity: 0,
                scale: 0.9,
                y: 20,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: onClose,
            });
        } else {
            onClose();
        }
    };

    const togglePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
                onPause?.();
            } else {
                audioRef.current.play().catch(console.error);
                onPlay?.();
            }
            setIsPlaying(!isPlaying);
        }
    };

    // Handle audio events
    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            const handleEnded = () => {
                setIsPlaying(false);
                onPause?.();
            };
            const handlePlay = () => {
                setIsPlaying(true);
                onPlay?.();
            };
            const handlePause = () => {
                setIsPlaying(false);
                onPause?.();
            };

            audio.addEventListener('ended', handleEnded);
            audio.addEventListener('play', handlePlay);
            audio.addEventListener('pause', handlePause);

            return () => {
                audio.removeEventListener('ended', handleEnded);
                audio.removeEventListener('play', handlePlay);
                audio.removeEventListener('pause', handlePause);
            };
        }
    }, [isUnlocked, onPlay, onPause]);

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}
            onClick={handleClose}
        >
            <div
                ref={modalRef}
                className="relative w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all duration-200 hover:scale-110 z-10"
                >
                    ✕
                </button>

                {!isUnlocked ? (
                    /* Password/Date Picker Section */
                    <div className="p-8 text-center">
                        {/* Decorative Icon */}
                        <div className="relative mx-auto w-20 h-20 mb-6">
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full animate-pulse opacity-30" />
                            <div className="relative w-full h-full bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                <span className="text-3xl">🎤</span>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            A Secret Message 💌
                        </h2>
                        <p className="text-gray-500 mb-6">
                            This is just for you... When did we start? 💕
                        </p>

                        {/* Date Picker */}
                        <div className="mb-6">
                            <label className="block text-sm text-gray-500 mb-2 font-medium">
                                Pick our special date
                            </label>
                            <input
                                ref={inputRef}
                                type="date"
                                value={selectedDate}
                                onChange={handleDateChange}
                                className={`w-full px-4 py-3 rounded-xl border-2 text-center text-lg font-medium
                                    transition-all duration-300 outline-none
                                    ${error
                                        ? 'border-red-400 bg-red-50'
                                        : 'border-pink-200 bg-pink-50/50 focus:border-pink-400 focus:bg-white'
                                    }`}
                                style={{
                                    colorScheme: 'light',
                                }}
                            />
                            {error && (
                                <p className="text-red-500 text-sm mt-2 animate-pulse">
                                    Hmm, that's not quite right... Try again! 💭
                                </p>
                            )}
                        </div>

                        {/* Hint */}
                        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 mb-6 border border-pink-100">
                            <p className="text-sm text-gray-600">
                                <span className="font-semibold text-pink-500">Hint:</span> The day our story began...
                                <span className="text-purple-500 ml-1">Our anniversary 💕</span>
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                        >
                            Unlock Message 🔓
                        </button>
                    </div>
                ) : (
                    /* Audio Player Section */
                    <div className="p-8 text-center">
                        {/* Success Animation */}
                        <div className="relative mx-auto w-24 h-24 mb-6">
                            <div
                                className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full"
                                style={{ animation: 'pulse 2s ease-in-out infinite' }}
                            />
                            <div className="relative w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-xl">
                                <span className="text-4xl">💚</span>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            You got it! 🎉
                        </h2>
                        <p className="text-gray-500 mb-6">
                            Here's a special voice note just for you...
                        </p>

                        {/* Audio Player */}
                        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 mb-6 border border-pink-100">
                            <audio
                                ref={audioRef}
                                src={voiceNoteUrl}
                                preload="auto"
                                className="hidden"
                            />

                            {/* Play/Pause Button */}
                            <button
                                onClick={togglePlayPause}
                                className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110
                                    ${isPlaying
                                        ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                                        : 'bg-gradient-to-br from-pink-500 to-purple-500'
                                    }`}
                            >
                                <span className="text-2xl text-white">
                                    {isPlaying ? '⏸️' : '▶️'}
                                </span>
                            </button>

                            <p className="text-pink-600 font-medium">
                                {isPlaying ? 'Playing...' : 'Tap to play'}
                            </p>

                            {/* Equalizer Animation */}
                            {isPlaying && (
                                <div className="flex justify-center gap-1 mt-4 h-8">
                                    {[...Array(5)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-1.5 bg-gradient-to-t from-pink-500 to-purple-500 rounded-full"
                                            style={{
                                                animation: `equalizer 0.5s ease-in-out infinite alternate`,
                                                animationDelay: `${i * 0.1}s`,
                                                height: '100%',
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Native Audio Controls */}
                        <audio
                            src={voiceNoteUrl}
                            controls
                            className="w-full rounded-xl"
                            style={{ height: '40px' }}
                        />
                    </div>
                )}

                {/* Keyframe Styles */}
                <style>{`
                    @keyframes equalizer {
                        0% { transform: scaleY(0.3); }
                        100% { transform: scaleY(1); }
                    }
                    @keyframes pulse {
                        0%, 100% { opacity: 0.3; transform: scale(1); }
                        50% { opacity: 0.5; transform: scale(1.1); }
                    }
                `}</style>
            </div>
        </div>,
        document.body
    );
};
