import React, { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { GlassCard } from './components/GlassCard';
import { Typewriter } from './components/Typewriter';
import { Countdown } from './components/Countdown';
import { ReasonsGrid } from './components/ReasonsGrid';
import { Cake } from './components/Cake';
import { PolaroidStack } from './components/PolaroidStack';
import { Promises } from './components/Promises';
import { MusicPlayer } from './components/MusicPlayer';
import { FloatingHearts } from './components/FloatingHearts';
import { FloatingBackground } from './components/FloatingBackground';
import { ScrollReveal } from './components/ScrollReveal';
import { CustomCursor } from './components/CustomCursor';
import { ParticleBackground } from './components/ParticleBackground';
import { ScratchReveal } from './components/ScratchReveal';
import { Finale } from './components/Finale';
import { Fireworks } from './components/Fireworks';
import { MemoryPuzzle } from './components/MemoryPuzzle';
import { MemoryGallery } from './components/MemoryGallery';
import { HeartTreeAnimation } from './components/HeartTreeAnimation';
import { MagneticButton } from './components/MagneticButton';
import { TextScramble } from './components/TextScramble';
import { SparkleText } from './components/SparkleText';
import { VoiceNotePlayer } from './components/VoiceNotePlayer';
import { CONFIG } from './constants';
import { useAudio } from './hooks/useAudio';
import { useConfetti } from './hooks/useConfetti';

enum Scene {
  TREE_INTRO = 'TREE_INTRO',
  INTRO = 'INTRO',
  ASK = 'ASK',
  THREAT = 'THREAT',
  CAKE = 'CAKE',
  COUNTDOWN = 'COUNTDOWN',
  LETTER = 'LETTER',
  REASONS = 'REASONS',
  PROMISES = 'PROMISES',
  GALLERY = 'GALLERY',
  PUZZLE = 'PUZZLE',
  FINALE = 'FINALE',
}

const App: React.FC = () => {
  const [currentScene, setCurrentScene] = useState<Scene>(Scene.TREE_INTRO);
  const [showLetterButton, setShowLetterButton] = useState(false);
  const [isLetterRevealed, setIsLetterRevealed] = useState(false);
  const [showPromisesButton, setShowPromisesButton] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showVoiceNote, setShowVoiceNote] = useState(false);
  const bgRef = useRef<HTMLDivElement>(null);
  const noBtnRef = useRef<HTMLButtonElement>(null);

  const { isPlaying, playAudio, toggleAudio, unlockAudio, muteAudio, unmuteAudio } = useAudio(CONFIG.audioUrl);
  const { launchConfetti } = useConfetti();

  // Living Gradient Animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(bgRef.current, {
        duration: 20,
        backgroundPosition: '400% 400%',
        ease: 'none',
        repeat: -1,
      });
    });
    return () => ctx.revert();
  }, []);

  // Runaway Button Logic
  const handleNoHover = () => {
    if (!noBtnRef.current) return;
    const x = (Math.random() - 0.5) * 300;
    const y = (Math.random() - 0.5) * 300;
    gsap.to(noBtnRef.current, { x, y, duration: 0.3, ease: 'power2.out' });
  };

  // Cinematic 3D Flip Scene Transition
  const transitionTo = useCallback((nextScene: Scene) => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    const card = document.getElementById('glass-card');
    if (!card) return;

    const tl = gsap.timeline({
      onComplete: () => setIsTransitioning(false)
    });

    // 3D flip out animation
    tl.to(card, {
      rotationY: -90,
      opacity: 0,
      scale: 0.85,
      duration: 0.35,
      ease: 'power3.in',
      onComplete: () => setCurrentScene(nextScene)
    })
      // Reset position for flip in
      .set(card, {
        rotationY: 90,
        scale: 0.85,
      })
      // 3D flip in animation
      .to(card, {
        rotationY: 0,
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: 'power4.out',
      });
  }, [isTransitioning]);

  const handleStart = async () => {
    await unlockAudio();
    playAudio();
    transitionTo(Scene.ASK);
  };

  const handleCakeBlown = () => {
    launchConfetti();
    setTimeout(() => {
      transitionTo(Scene.COUNTDOWN);
    }, 2500);
  };

  const handleLetterComplete = useCallback(() => {
    setShowLetterButton(true);
  }, []);

  const handleShowReasons = useCallback(() => {
    transitionTo(Scene.REASONS);
    setTimeout(() => {
      launchConfetti();
    }, 500);
  }, [transitionTo, launchConfetti]);

  return (
    <>
      {/* SCENE 0: TREE_INTRO - Full Screen */}
      {currentScene === Scene.TREE_INTRO && (
        <HeartTreeAnimation
          onComplete={() => setCurrentScene(Scene.INTRO)}
          recipientName={CONFIG.recipientName}
          onStartMusic={playAudio}
        />
      )}

      {/* Main App Container - Hidden during tree intro */}
      {currentScene !== Scene.TREE_INTRO && (
        <div
          ref={bgRef}
          className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
          style={{
            background: `linear-gradient(135deg, 
              oklch(0.92 0.05 320) 0%, 
              oklch(0.88 0.08 340) 25%,
              oklch(0.85 0.1 350) 50%,
              oklch(0.88 0.08 290) 75%,
              oklch(0.92 0.06 280) 100%)`,
            backgroundSize: '400% 400%',
            animation: 'gradientShift 20s ease infinite'
          }}
        >
          <style>{`
            @keyframes gradientShift {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
          `}</style>

          <CustomCursor />
          <ParticleBackground />
          <FloatingBackground count={30} />
          <MusicPlayer isPlaying={isPlaying} onToggle={toggleAudio} />
          <FloatingHearts />

          {/* Heartbeat Vignette Overlay */}
          <div className="absolute inset-0 pointer-events-none z-[1]"
            style={{
              background: 'radial-gradient(circle, transparent 60%, rgba(255,182,193,0.3) 100%)',
              animation: 'heartbeat 4s infinite ease-in-out'
            }}
          >
            <style>{`
          @keyframes heartbeat {
            0% { opacity: 0.3; transform: scale(1); }
            15% { opacity: 0.5; transform: scale(1.02); } /* First strong beat */
            30% { opacity: 0.3; transform: scale(1); }
            45% { opacity: 0.4; transform: scale(1.01); } /* Second softer beat */
            100% { opacity: 0.3; transform: scale(1); }
          }
        `}</style>
          </div>

          {/* Decorative gradient orbs - enhanced with movement */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div
              className="absolute w-[800px] h-[800px] rounded-full opacity-30 blur-[120px]"
              style={{
                background: 'radial-gradient(circle, rgba(255,182,193,0.8) 0%, transparent 70%)',
                top: '-20%',
                left: '-10%',
                animation: 'floatOrb1 20s ease-in-out infinite',
              }}
            />
            <div
              className="absolute w-[600px] h-[600px] rounded-full opacity-25 blur-[100px]"
              style={{
                background: 'radial-gradient(circle, rgba(147,112,219,0.8) 0%, transparent 70%)',
                bottom: '-10%',
                right: '-5%',
                animation: 'floatOrb2 25s ease-in-out infinite',
              }}
            />
            <div
              className="absolute w-[400px] h-[400px] rounded-full opacity-20 blur-[80px]"
              style={{
                background: 'radial-gradient(circle, rgba(255,218,185,0.8) 0%, transparent 70%)',
                top: '40%',
                left: '60%',
                animation: 'floatOrb3 18s ease-in-out infinite',
              }}
            />
          </div>

          <style>{`
            @keyframes floatOrb1 {
              0%, 100% { transform: translate(0, 0) scale(1); }
              25% { transform: translate(50px, 30px) scale(1.1); }
              50% { transform: translate(20px, 60px) scale(0.9); }
              75% { transform: translate(-30px, 40px) scale(1.05); }
            }
            @keyframes floatOrb2 {
              0%, 100% { transform: translate(0, 0) scale(1); }
              33% { transform: translate(-40px, -30px) scale(1.15); }
              66% { transform: translate(30px, -50px) scale(0.95); }
            }
            @keyframes floatOrb3 {
              0%, 100% { transform: translate(0, 0) rotate(0deg); }
              50% { transform: translate(20px, -20px) rotate(180deg); }
            }
          `}</style>

          <GlassCard id="glass-card" className="z-10 w-full max-w-[650px] m-4 min-h-[420px]" variant="gradient">

            {/* SCENE 1: INTRO */}
            {currentScene === Scene.INTRO && (
              <div className="flex flex-col items-center text-center space-y-8 p-8">
                <div className="relative">
                  <div className="text-7xl animate-bounce drop-shadow-lg">🎂</div>
                  <div className="absolute -inset-4 bg-pink-400/20 rounded-full blur-xl animate-pulse" />
                </div>

                <SparkleText
                  text={CONFIG.introTitle}
                  className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 bg-clip-text text-transparent drop-shadow-sm tracking-tight leading-tight"
                />

                <TextScramble
                  text={CONFIG.introSubtitle}
                  className="text-xl text-gray-600 font-medium max-w-md"
                  delay={500}
                />

                <div className="pt-6">
                  <MagneticButton onClick={handleStart} size="large" variant="glow">
                    <span className="flex items-center gap-2">
                      {CONFIG.introButtonText}
                      <span className="animate-pulse">✨</span>
                    </span>
                  </MagneticButton>
                </div>
              </div>
            )}

            {/* SCENE 1.5: ASK */}
            {currentScene === Scene.ASK && (
              <div className="flex flex-col items-center text-center space-y-8 p-8 w-full">
                <div className="relative">
                  <div className="text-8xl animate-bounce drop-shadow-2xl filter drop-shadow-pink-500">🥺</div>
                  <div className="absolute -inset-6 bg-pink-400/10 rounded-full blur-2xl animate-pulse" />
                </div>

                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  {CONFIG.askTitle}
                </h2>

                <p className="text-gray-500 text-xl font-light tracking-wide">{CONFIG.askSubtitle}</p>

                <div className="flex gap-8 justify-center items-center w-full relative h-28 mt-8">
                  <MagneticButton
                    onClick={() => transitionTo(Scene.CAKE)}
                    variant="primary"
                    size="large"
                    className="transform hover:scale-110 transition-transform duration-300"
                  >
                    <span className="flex items-center gap-2">
                      YES!
                      <span className="animate-pulse">❤️</span>
                    </span>
                  </MagneticButton>

                  <div className="relative">
                    <button
                      ref={noBtnRef}
                      onMouseEnter={handleNoHover}
                      onClick={() => transitionTo(Scene.THREAT)}
                      className="px-6 py-3 rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-600 font-semibold hover:bg-red-50 hover:border-red-200 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      No 🙄
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SCENE 1.6: THREAT */}
            {currentScene === Scene.THREAT && (
              <div className="flex flex-col items-center text-center space-y-8 p-8">
                <div className="relative">
                  <div className="text-9xl animate-pulse drop-shadow-2xl">🔫😿</div>
                  <div className="absolute -inset-8 bg-red-400/10 rounded-full blur-3xl animate-pulse" />
                </div>

                <TextScramble
                  text={CONFIG.threatTitle}
                  className="text-5xl md:text-6xl font-black bg-gradient-to-r from-red-500 via-orange-500 to-pink-500 bg-clip-text text-transparent"
                  delay={100}
                />

                <p className="text-2xl font-medium text-gray-600 animate-pulse">{CONFIG.threatSubtitle}</p>

                <MagneticButton onClick={() => transitionTo(Scene.ASK)} variant="primary" size="large">
                  <span className="flex items-center gap-2">
                    😭 Okay sorry!
                    <span className="animate-bounce">💝</span>
                  </span>
                </MagneticButton>
              </div>
            )}

            {/* SCENE 2: CAKE */}
            {currentScene === Scene.CAKE && (
              <div className="flex flex-col items-center justify-center w-full py-4">
                <Cake onBlown={handleCakeBlown} />
              </div>
            )}

            {/* SCENE 3: COUNTDOWN */}
            {currentScene === Scene.COUNTDOWN && (
              <div className="flex flex-col items-center justify-center w-full space-y-6 p-4">
                <Countdown startDate={CONFIG.startDate} />
                <p className="text-lg text-gray-500 italic font-medium text-center max-w-md">
                  {CONFIG.countdownSubtitle}
                </p>
                <MagneticButton onClick={() => transitionTo(Scene.LETTER)} variant="primary">
                  <span className="flex items-center gap-2">Open Letter <span className="animate-bounce">💌</span></span>
                </MagneticButton>
              </div>
            )}

            {/* SCENE 4: LETTER */}
            {currentScene === Scene.LETTER && (
              <div className="flex flex-col items-center w-full space-y-8">
                <h2 className="text-2xl font-bold text-gray-700">Secret Message...</h2>
                <div className="w-full h-[300px] relative">
                  <ScratchReveal onRevealComplete={() => setIsLetterRevealed(true)}>
                    <div className="w-full h-full bg-white/60 p-6 rounded-xl shadow-inner text-left flex items-center justify-center border border-pink-100">
                      {isLetterRevealed && (
                        <Typewriter
                          text={CONFIG.letterContent}
                          speed={50}
                          onComplete={handleLetterComplete}
                        />
                      )}
                    </div>
                  </ScratchReveal>
                </div>
                <div className={`transition-all duration-1000 transform ${showLetterButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                  <MagneticButton onClick={handleShowReasons} variant="glow">
                    <span className="flex items-center gap-2">Why I love you <span className="animate-pulse">→</span></span>
                  </MagneticButton>
                </div>
              </div>
            )}

            {/* SCENE 5: REASONS */}
            {currentScene === Scene.REASONS && (
              <div className="flex flex-col items-center w-full h-full max-h-[85vh]">
                <ScrollReveal delay={0} duration={600}>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {CONFIG.reasonsTitle}
                  </h2>
                </ScrollReveal>
                <ScrollReveal delay={200} duration={700} className="w-full overflow-y-auto pr-2 custom-scrollbar pb-4">
                  <ReasonsGrid reasons={CONFIG.reasons} />
                </ScrollReveal>
                <ScrollReveal delay={400} duration={600} className="mt-6 pt-4 w-full flex justify-center">
                  <MagneticButton onClick={() => transitionTo(Scene.PROMISES)} variant="primary">
                    <span className="flex items-center gap-2">One more thing... <span className="animate-bounce">✨</span></span>
                  </MagneticButton>
                </ScrollReveal>
              </div>
            )}

            {/* SCENE 6: PROMISES */}
            {currentScene === Scene.PROMISES && (
              <Promises
                promises={CONFIG.promises}
                onComplete={() => setShowPromisesButton(true)}
              />
            )}
            {currentScene === Scene.PROMISES && (
              <div className={`mt-8 transition-all duration-1000 transform ${showPromisesButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <MagneticButton onClick={() => transitionTo(Scene.GALLERY)} variant="glow">
                  <span className="flex items-center gap-2">Our Journey <span className="animate-pulse">→</span></span>
                </MagneticButton>
              </div>
            )}


            {/* SCENE 7: GALLERY */}
            {currentScene === Scene.GALLERY && (
              <div className="flex flex-col items-center w-full h-full">
                <ScrollReveal delay={0} duration={600}>
                  <h2 className="text-3xl font-bold text-gray-800 mb-1">
                    Memory Lane
                  </h2>
                  <p className="text-gray-500 mb-3 text-sm">
                    Click any photo to start the slideshow! ✨
                  </p>
                </ScrollReveal>

                <ScrollReveal delay={200} duration={800} className="flex-1 overflow-y-auto max-h-[45vh] w-full custom-scrollbar">
                  <MemoryGallery
                    memories={CONFIG.memories}
                    onComplete={() => { }}
                  />
                </ScrollReveal>

                <ScrollReveal delay={400} duration={600} className="mt-4 pt-4 flex gap-4 flex-wrap justify-center shrink-0">
                  <MagneticButton onClick={() => transitionTo(Scene.PUZZLE)} variant="primary">
                    <span className="flex items-center gap-2">🧩 Memory Puzzle</span>
                  </MagneticButton>
                  <MagneticButton onClick={() => {
                    setShowFireworks(true);
                    launchConfetti();
                    transitionTo(Scene.FINALE);
                  }} variant="glow">
                    <span className="flex items-center gap-2">Grand Finale <span className="animate-pulse">✨</span></span>
                  </MagneticButton>
                </ScrollReveal>
              </div>
            )}

            {/* SCENE 7.5: PUZZLE */}
            {currentScene === Scene.PUZZLE && (
              <div className="flex flex-col items-center w-full">
                <MemoryPuzzle
                  imageUrl={CONFIG.puzzleImageUrl}
                  onComplete={() => {
                    launchConfetti();
                  }}
                />
                <div className="mt-8">
                  <MagneticButton onClick={() => {
                    setShowFireworks(true);
                    launchConfetti();
                    transitionTo(Scene.FINALE);
                  }} variant="glow" size="large">
                    <span className="flex items-center gap-2">The Grand Finale <span className="animate-pulse">✨</span></span>
                  </MagneticButton>
                </div>
              </div>
            )}

            {/* SCENE 8: FINALE */}
            {currentScene === Scene.FINALE && (
              <Finale
                recipientName={CONFIG.recipientName}
                videoUrl={CONFIG.finaleVideoUrl}
                onVideoPlay={muteAudio}
                onVideoEnd={unmuteAudio}
                onReplay={() => {
                  setShowFireworks(false);
                  setShowLetterButton(false);
                  setIsLetterRevealed(false);
                  setShowPromisesButton(false);
                  setCurrentScene(Scene.TREE_INTRO);
                }}
              />
            )}
          </GlassCard>

          {/* Fireworks Overlay */}
          <Fireworks active={showFireworks && currentScene === Scene.FINALE} />

          {/* Voice Note Button with attention-grabbing animation */}
          <div className="fixed bottom-4 right-4 z-50 flex flex-col items-center gap-1">
            {/* Bouncing Arrow */}
            <div className="text-pink-500 text-xl animate-bounce">
              ↓
            </div>
            {/* Label */}
            <span className="text-xs text-pink-600 font-semibold bg-white/80 px-2 py-0.5 rounded-full shadow-sm">
              Secret! 💕
            </span>
            {/* Button with pulse ring */}
            <button
              onClick={() => setShowVoiceNote(true)}
              className="relative w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-white text-2xl flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
              title="Secret Voice Note 🎤"
            >
              {/* Pulse ring animation */}
              <span className="absolute inset-0 rounded-full bg-pink-400 animate-ping opacity-40"></span>
              <span className="relative">🎤</span>
            </button>
          </div>

          {/* Voice Note Player Modal */}
          {showVoiceNote && (
            <VoiceNotePlayer
              voiceNoteUrl={CONFIG.voiceNoteUrl}
              correctDate={CONFIG.anniversaryDate}
              onClose={() => setShowVoiceNote(false)}
              onPlay={muteAudio}
              onPause={unmuteAudio}
            />
          )}
        </div>
      )}
    </>
  );
};

export default App;