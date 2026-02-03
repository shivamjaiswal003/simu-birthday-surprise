import React, { useEffect, useRef, useState } from 'react';

interface TextScrambleProps {
    text: string;
    className?: string;
    delay?: number;
}

export const TextScramble: React.FC<TextScrambleProps> = ({
    text,
    className = '',
    delay = 0,
}) => {
    const [displayText, setDisplayText] = useState('');
    const [isRevealed, setIsRevealed] = useState(false);
    const chars = '!<>-_\\/[]{}—=+*^?#________';
    const frameRef = useRef<number>();
    const queueRef = useRef<{ from: string; to: string; start: number; end: number; char?: string }[]>([]);
    const frameCounter = useRef(0);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const queue: { from: string; to: string; start: number; end: number; char?: string }[] = [];
            const length = text.length;

            for (let i = 0; i < length; i++) {
                queue.push({
                    from: chars[Math.floor(Math.random() * chars.length)],
                    to: text[i],
                    start: Math.floor(Math.random() * 20),
                    end: Math.floor(Math.random() * 20) + 20
                });
            }

            queueRef.current = queue;
            frameCounter.current = 0;

            const update = () => {
                let output = '';
                let complete = 0;

                for (let i = 0; i < queue.length; i++) {
                    const { to, start, end } = queue[i];
                    let { char } = queue[i];

                    if (frameCounter.current >= end) {
                        complete++;
                        output += to;
                    } else if (frameCounter.current >= start) {
                        if (!char || Math.random() < 0.28) {
                            char = chars[Math.floor(Math.random() * chars.length)];
                            queue[i].char = char;
                        }
                        output += char;
                    } else {
                        output += queue[i].from;
                    }
                }

                setDisplayText(output);

                if (complete === queue.length) {
                    setIsRevealed(true);
                } else {
                    frameCounter.current++;
                    frameRef.current = requestAnimationFrame(update);
                }
            };

            update();
        }, delay);

        return () => {
            clearTimeout(timeout);
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [text, delay]);

    return (
        <span className={`${className} ${isRevealed ? 'text-revealed' : ''}`}>
            {displayText || text.split('').map(() => ' ').join('')}
            <style>{`
        .text-revealed {
          animation: textGlow 0.5s ease-out;
        }
        @keyframes textGlow {
          0% { text-shadow: 0 0 20px rgba(236, 72, 153, 0.8); }
          100% { text-shadow: none; }
        }
      `}</style>
        </span>
    );
};
