import { useState, useRef, useEffect } from 'react';

export const useMicrophone = () => {
  const [isBlowing, setIsBlowing] = useState(false);
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafId = useRef<number | null>(null);

  const startMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      microphoneRef.current.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      detectBlow();
    } catch (error) {
      console.error("Microphone access denied or error:", error);
      setIsPermissionDenied(true);
    }
  };

  const detectBlow = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Simple algorithm: check average volume
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    const average = sum / bufferLength;

    // Threshold for "blowing" - usually creates a consistent loud noise
    if (average > 40) { 
        // Need to sustain it slightly or check for specific noise profile in a real robust app,
        // but for this toy app, volume threshold is usually enough.
        setIsBlowing(true);
        // Once blown, we can stop listening to save resources or keep listening if we want to flicker
    } else {
        setIsBlowing(false);
    }

    rafId.current = requestAnimationFrame(detectBlow);
  };

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  return { isBlowing, isPermissionDenied, startMicrophone };
};