import React from 'react';

interface MusicPlayerProps {
  isPlaying: boolean;
  onToggle: () => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ isPlaying, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md border border-white/40 rounded-full shadow-lg hover:bg-white/30 transition-all duration-300 group"
    >
      <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
      <span className="text-xs font-bold text-gray-700 tracking-wide uppercase">
        {isPlaying ? 'Playing Our Song' : 'Music Paused'}
      </span>
      {/* Visual Equalizer Bars */}
      {isPlaying && (
        <div className="flex gap-0.5 items-end h-3 ml-1">
          <div className="w-0.5 bg-gray-700 animate-[bounce_1s_infinite] h-full"></div>
          <div className="w-0.5 bg-gray-700 animate-[bounce_1.2s_infinite] h-2/3"></div>
          <div className="w-0.5 bg-gray-700 animate-[bounce_0.8s_infinite] h-full"></div>
        </div>
      )}
    </button>
  );
};