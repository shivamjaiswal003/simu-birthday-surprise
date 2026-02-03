import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface PhotoLightboxProps {
    imageUrl: string;
    caption: string;
    isOpen: boolean;
    onClose: () => void;
}

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
    imageUrl,
    caption,
    isOpen,
    onClose
}) => {
    const overlayRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && overlayRef.current && contentRef.current) {
            // Animate in
            gsap.fromTo(overlayRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.3, ease: 'power2.out' }
            );
            gsap.fromTo(contentRef.current,
                { scale: 0.8, opacity: 0, y: 50 },
                { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
            );
        }
    }, [isOpen]);

    const handleClose = () => {
        if (overlayRef.current && contentRef.current) {
            gsap.to(contentRef.current, {
                scale: 0.9,
                opacity: 0,
                duration: 0.2,
                ease: 'power2.in'
            });
            gsap.to(overlayRef.current, {
                opacity: 0,
                duration: 0.25,
                ease: 'power2.in',
                onComplete: onClose
            });
        } else {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 cursor-pointer"
            onClick={handleClose}
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
        >
            <div
                ref={contentRef}
                className="relative max-w-4xl max-h-[90vh] cursor-default"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute -top-12 right-0 text-white/80 hover:text-white text-4xl transition-colors z-10"
                    aria-label="Close"
                >
                    ×
                </button>

                {/* Image */}
                <img
                    src={imageUrl}
                    alt={caption}
                    className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                />

                {/* Caption */}
                <div className="mt-4 text-center">
                    <p className="text-white text-xl font-medium font-['Caveat',_cursive]">
                        {caption}
                    </p>
                </div>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-sm">
                Click anywhere to close
            </div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap');
      `}</style>
        </div>
    );
};
