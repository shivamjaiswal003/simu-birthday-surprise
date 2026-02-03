import { useRef, useEffect, useState } from 'react';

export const useAudio = (url: string) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = 0.5;
    audio.preload = 'auto';

    const onError = (e: Event) => {
      console.warn("Audio failed to load:", url, e);
    };
    audio.addEventListener('error', onError);

    audioRef.current = audio;

    return () => {
      audio.removeEventListener('error', onError);
      audio.pause();
      audioRef.current = null;
    };
  }, [url]);

  const unlockAudio = async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (e) {
        console.error("Audio autoplay failed:", e);
      }
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.error(e));
      setIsPlaying(true);
    }
  };

  const playAudio = () => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play().catch(e => console.error("Play failed:", e));
      setIsPlaying(true);
    }
  };

  const muteAudio = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const unmuteAudio = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      setIsMuted(false);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  return {
    isPlaying,
    isMuted,
    toggleAudio,
    playAudio,
    unlockAudio,
    muteAudio,
    unmuteAudio,
    pauseAudio,
    audioRef
  };
};