
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameStatus, GameState, Duck, DuckStatus, DogType } from './types';
import { 
  GAME_WIDTH, 
  GAME_HEIGHT, 
  INITIAL_LIVES, 
  INITIAL_AMMO, 
  DUCK_SIZE, 
  GRASS_HEIGHT, 
  COLORS,
  RECOVERY_TIME_SECONDS,
  RECOVERY_STORAGE_KEY,
  ATTEMPTS_STORAGE_KEY
} from './constants';
import Background from './components/Background';
import DuckSprite from './components/DuckSprite';
import DogSprite from './components/DogSprite';
import UIOverlay from './components/UIOverlay';
import Header from './components/Header';
import { Play, RotateCcw, Zap, Sparkles, Wallet, Info, Clock } from 'lucide-react';

const App: React.FC = () => {
  // Audio Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const whistleOscRef = useRef<OscillatorNode | null>(null);
  const whistleLfoRef = useRef<OscillatorNode | null>(null);
  const whistleGainRef = useRef<GainNode | null>(null);

  // Initialize state from localStorage
  const getInitialAttempts = () => {
    const saved = localStorage.getItem(ATTEMPTS_STORAGE_KEY);
    return saved !== null ? parseInt(saved, 10) : 3;
  };

  const getInitialDepletedTime = () => {
    const saved = localStorage.getItem(RECOVERY_STORAGE_KEY);
    return saved !== null ? parseInt(saved, 10) : null;
  };

  const [gameState, setGameState] = useState<GameState>({
    status: GameStatus.START,
    score: 0,
    lives: INITIAL_LIVES,
    ammo: INITIAL_AMMO,
    level: 1,
    ducksHitThisLevel: 0,
    dogType: DogType.NONE,
    sessionAttempts: getInitialAttempts(),
    walletAddress: null,
    // Fix: Removed 'boolean =' which was causing a syntax error as 'boolean' is a type, but is being used as a value here.
    isMinting: false,
    aiMessage: null,
    lastLivesDepletedTime: getInitialDepletedTime(),
  });

  const [ducks, setDucks] = useState<Duck[]>([]);
  const [secondsUntilRecovery, setSecondsUntilRecovery] = useState<number | null>(null);
  const requestRef = useRef<number>();
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Initialize Audio Context on user interaction
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      whistleGainRef.current = audioCtxRef.current.createGain();
      whistleGainRef.current.gain.value = 0.02; // Very subtle
      whistleGainRef.current.connect(audioCtxRef.current.destination);
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  // Audio Cleanup
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // Whistle Sound Effect Controller
  useEffect(() => {
    const hasActiveDucks = ducks.some(d => d.status === DuckStatus.ALIVE || d.status === DuckStatus.FLYING_AWAY);
    const shouldPlayWhistle = gameState.status === GameStatus.PLAYING && hasActiveDucks;

    if (shouldPlayWhistle) {
      if (!whistleOscRef.current && audioCtxRef.current) {
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1100, ctx.currentTime);
        
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(6, ctx.currentTime); // 6Hz vibrato
        lfoGain.gain.setValueAtTime(15, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        osc.connect(whistleGainRef.current!);
        
        osc.start();
        lfo.start();
        
        whistleOscRef.current = osc;
        whistleLfoRef.current = lfo;
      }
    } else {
      if (whistleOscRef.current) {
        whistleOscRef.current.stop();
        whistleLfoRef.current?.stop();
        whistleOscRef.current = null;
        whistleLfoRef.current = null;
      }
    }
  }, [ducks, gameState.status]);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem(ATTEMPTS_STORAGE_KEY, gameState.sessionAttempts.toString());
  }, [gameState.sessionAttempts]);

  useEffect(() => {
    if (gameState.lastLivesDepletedTime) {
      localStorage.setItem(RECOVERY_STORAGE_KEY, gameState.lastLivesDepletedTime.toString());
    } else {
      localStorage.removeItem(RECOVERY_STORAGE_KEY);
    }
  }, [gameState.lastLivesDepletedTime]);

  // Recovery Timer Logic
  useEffect(() => {
    const timer = setInterval(() => {
      if (gameState.sessionAttempts === 0 && gameState.lastLivesDepletedTime) {
        const elapsed = Math.floor((Date.now() - gameState.lastLivesDepletedTime) / 1000);
        const remaining = RECOVERY_TIME_SECONDS - elapsed;

        if (remaining <= 0) {
          setGameState(prev => ({ 
            ...prev, 
            sessionAttempts: 3, 
            lastLivesDepletedTime: null,
            aiMessage: "ENERGY RESTORED! READY FOR HUNT?"
          }));
          setSecondsUntilRecovery(null);
        } else {
          setSecondsUntilRecovery(remaining);
        }
      } else {
        setSecondsUntilRecovery(null);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.sessionAttempts, gameState.lastLivesDepletedTime]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const spawnDuck = useCallback(() => {
    if (gameState.status !== GameStatus.PLAYING) return;

    const id = Date.now();
    const side = Math.random() > 0.5 ? 'left' : 'right';
    const x = side === 'left' ? -DUCK_SIZE : GAME_WIDTH;
    const y = GAME_HEIGHT - GRASS_HEIGHT - 120 - (Math.random() * 200);
    const speed = 3 + (gameState.level * 0.5);
    const vx = side === 'left' ? speed : -speed;
    const vy = -(Math.random() * 2 + 1.5);

    const newDuck: Duck = {
      id,
      x,
      y,
      vx,
      vy,
      status: DuckStatus.ALIVE,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
    setDucks([newDuck]);
    setGameState(prev => ({ ...prev, ammo: INITIAL_AMMO, dogType: DogType.NONE }));
  }, [gameState.level, gameState.status]);

  useEffect(() => {
    if (gameState.status === GameStatus.PLAYING && ducks.length === 0 && gameState.dogType === DogType.NONE) {
      const timer = setTimeout(spawnDuck, 600);
      return () => clearTimeout(timer);
    }
  }, [gameState.status, ducks.length, gameState.dogType, spawnDuck]);

  const startGame = () => {
    initAudio();
    if (gameState.sessionAttempts <= 0) return;

    setGameState(prev => ({
      ...prev,
      status: GameStatus.PLAYING,
      score: 0,
      lives: INITIAL_LIVES,
      ammo: INITIAL_AMMO,
      level: 1,
      ducksHitThisLevel: 0,
      dogType: DogType.NONE,
      sessionAttempts: prev.sessionAttempts - 1,
      aiMessage: null,
      lastLivesDepletedTime: prev.sessionAttempts - 1 === 0 ? Date.now() : prev.lastLivesDepletedTime
    }));
    setDucks([]);
  };

  const handleConnect = () => {
    initAudio();
    setGameState(prev => ({ ...prev, walletAddress: "0x1234...abcd" }));
  };

  const handleMintLives = () => {
    initAudio();
    if (!gameState.walletAddress || gameState.isMinting) return;
    
    setGameState(prev => ({ 
      ...prev, 
      isMinting: true, 
      aiMessage: "APPROVE TRANSACTION IN YOUR WALLET" 
    }));
    
    setTimeout(() => {
      setGameState(prev => ({ 
        ...prev, 
        isMinting: false, 
        sessionAttempts: 3, 
        lastLivesDepletedTime: null,
        status: GameStatus.START,
        aiMessage: "PROUD OF YOU! 3 ATTEMPTS GRANTED." 
      }));
    }, 2000);
  };

  const showDog = useCallback((type: DogType) => {
    setGameState(prev => ({ ...prev, dogType: type }));
    setTimeout(() => {
      setGameState(prev => ({ ...prev, dogType: DogType.NONE }));
    }, 2200);
  }, []);

  const handleDuckEscape = useCallback(() => {
    setDucks([]);
    setGameState(prev => {
      const newLives = prev.lives - 1;
      const isGameOver = newLives <= 0;
      if (isGameOver) {
        return { ...prev, lives: 0, status: GameStatus.GAME_OVER };
      }
      setTimeout(() => showDog(DogType.LAUGHING), 100);
      return { ...prev, lives: newLives };
    });
  }, [showDog]);

  const handleDuckLanded = useCallback(() => {
    setDucks([]);
    setGameState(prev => {
      const nextHit = prev.ducksHitThisLevel + 1;
      const shouldLevelUp = nextHit % 5 === 0;
      return { 
        ...prev, 
        score: prev.score + 100 * prev.level,
        ducksHitThisLevel: nextHit,
        level: shouldLevelUp ? prev.level + 1 : prev.level
      };
    });
    showDog(DogType.HAPPY);
  }, [showDog]);

  const update = useCallback(() => {
    if (gameState.status !== GameStatus.PLAYING) return;

    setDucks(prevDucks => {
      if (prevDucks.length === 0) return prevDucks;

      return prevDucks.map(duck => {
        let { x, y, vx, vy, status } = duck;

        if (status === DuckStatus.ALIVE) {
          x += vx;
          y += vy;
          if (y < 0) vy = Math.abs(vy) * 0.8; 
          if (x < -DUCK_SIZE - 100 || x > GAME_WIDTH + 100) {
            handleDuckEscape();
            return null as unknown as Duck;
          }
          if (Math.random() < 0.02) vy = -vy;
        } else if (status === DuckStatus.FALLING) {
          y += 12;
          if (y > GAME_HEIGHT - GRASS_HEIGHT - 30) {
            handleDuckLanded();
            return null as unknown as Duck;
          }
        } else if (status === DuckStatus.FLYING_AWAY) {
          y -= 10;
          if (y < -DUCK_SIZE) {
            handleDuckEscape();
            return null as unknown as Duck;
          }
        }
        return { ...duck, x, y, vx, vy, status };
      }).filter(Boolean);
    });

    requestRef.current = requestAnimationFrame(update);
  }, [gameState.status, handleDuckEscape, handleDuckLanded]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [update]);

  const handleShoot = (e: React.MouseEvent) => {
    initAudio();
    if (gameState.status !== GameStatus.PLAYING || gameState.ammo <= 0 || gameState.dogType !== DogType.NONE) return;
    setGameState(prev => ({ ...prev, ammo: Math.max(0, prev.ammo - 1) }));
  };

  const onDuckHit = (id: number) => {
    if (gameState.status !== GameStatus.PLAYING || gameState.ammo <= 0 || gameState.dogType !== DogType.NONE) return;

    setDucks(prev => prev.map(d => {
      if (d.id === id && d.status === DuckStatus.ALIVE) {
        setTimeout(() => {
          setDucks(curr => curr.map(cd => cd.id === id ? { ...cd, status: DuckStatus.FALLING } : cd));
        }, 400);
        return { ...d, status: DuckStatus.HIT };
      }
      return d;
    }));
  };

  useEffect(() => {
    if (gameState.ammo === 0 && ducks.length > 0 && ducks[0].status === DuckStatus.ALIVE) {
      setTimeout(() => {
        setDucks(prev => prev.map(d => d.status === DuckStatus.ALIVE ? { ...d, status: DuckStatus.FLYING_AWAY } : d));
      }, 300);
    }
  }, [gameState.ammo, ducks]);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-black overflow-hidden select-none">
      <style>{`
        @keyframes pulse-white {
          0%, 100% { border-color: white; transform: scale(1); }
          50% { border-color: #ffd700; transform: scale(1.05); }
        }
        @keyframes blink-red {
          0%, 100% { color: #ff0000; }
          50% { color: #ffffff; }
        }
        .animate-pulse-retro {
          animation: pulse-white 1.5s infinite;
        }
        .animate-blink-red {
          animation: blink-red 0.5s infinite;
        }
      `}</style>
      <div 
        ref={gameContainerRef}
        className="relative bg-black overflow-hidden shadow-2xl border-4 border-gray-800 cursor-crosshair"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        onClick={handleShoot}
      >
        <Header 
          walletAddress={gameState.walletAddress} 
          onConnect={handleConnect} 
          sessionAttempts={gameState.sessionAttempts} 
        />
        
        <Background />
        <DogSprite type={gameState.dogType} />
        
        {ducks.map(duck => (
          <DuckSprite key={duck.id} duck={duck} onHit={onDuckHit} />
        ))}

        <UIOverlay gameState={gameState} />

        {/* Floating AI/Tutorial Messages */}
        {gameState.aiMessage && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-black border-4 border-yellow-400 p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]">
            <span className="text-yellow-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
              <Sparkles size={16} /> {gameState.aiMessage}
            </span>
          </div>
        )}

        {/* Reloading Prompt */}
        {gameState.status === GameStatus.PLAYING && gameState.ammo === 0 && ducks.length > 0 && (
          <div className="absolute top-40 left-1/2 -translate-x-1/2 z-40 bg-red-600 border-4 border-white px-4 py-2 animate-pulse">
            <span className="text-white text-[12px] font-bold">OUT OF AMMO! RELOADING...</span>
          </div>
        )}

        {/* START SCREEN */}
        {gameState.status === GameStatus.START && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 p-8 text-center backdrop-blur-sm">
            <h1 className="text-6xl text-yellow-400 mb-4 tracking-[0.2em] animate-pulse drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">DUCK HUNT</h1>
            
            <div className="mb-6 p-4 border-2 border-white/20 bg-black/40">
               <div className={`text-[10px] flex items-center gap-2 ${gameState.sessionAttempts > 0 ? "text-green-400 animate-bounce" : "text-yellow-500"}`}>
                 <Info size={14} /> 
                 {gameState.sessionAttempts > 0 ? "FULL ENERGY - 3 ATTEMPTS" : "RECHARGING..."}
               </div>
            </div>

            <div className="mb-8 flex flex-col items-center gap-2">
               <div className="text-white text-[10px] opacity-70">ENERGY CAPACITY</div>
               <div className="flex gap-2">
                  {[...Array(3)].map((_, i) => (
                    <Zap key={i} size={32} className={i < gameState.sessionAttempts ? "text-yellow-400 fill-yellow-400" : "text-gray-900"} />
                  ))}
               </div>
            </div>

            {gameState.sessionAttempts > 0 ? (
              <button 
                onClick={(e) => { e.stopPropagation(); startGame(); }}
                className="group flex items-center gap-6 bg-green-600 hover:bg-green-500 text-white px-10 py-5 rounded-xl transition-all border-b-8 border-green-900 active:border-b-0 active:translate-y-2"
              >
                <Play fill="white" size={24} />
                <span className="text-xl">START HUNT</span>
              </button>
            ) : (
              <div className="bg-black border-4 border-red-600 p-6 flex flex-col items-center gap-4">
                 <p className="text-red-500 text-[12px]">OUT OF ENERGY</p>
                 {secondsUntilRecovery && (
                    <div className="flex flex-col items-center gap-2">
                       <span className="text-white text-[8px] uppercase">Wait for refill:</span>
                       <span className={`text-xl font-bold ${secondsUntilRecovery < 60 ? 'animate-blink-red' : 'text-white'}`}>
                          {formatTime(secondsUntilRecovery)}
                       </span>
                    </div>
                 )}
                 <div className="text-white text-[8px] opacity-50">-- OR --</div>
                 <button 
                   onClick={(e) => { e.stopPropagation(); handleMintLives(); }}
                   disabled={!gameState.walletAddress || gameState.isMinting}
                   className={`px-8 py-4 border-b-8 flex items-center gap-4 ${
                     gameState.walletAddress 
                      ? "bg-blue-600 border-blue-900 text-white hover:bg-blue-500" 
                      : "bg-gray-800 border-gray-950 text-gray-500 opacity-50 cursor-not-allowed"
                   }`}
                >
                  <Sparkles size={20} className={gameState.isMinting ? "animate-spin" : ""} />
                  {gameState.isMinting ? "MINTING..." : "MINT LIVES (+3)"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* GAME OVER SCREEN */}
        {gameState.status === GameStatus.GAME_OVER && (
          <div className="absolute inset-0 bg-red-950/90 flex flex-col items-center justify-center z-50 p-8 text-center backdrop-blur-md">
            <h2 className="text-6xl text-white mb-6 font-bold tracking-tighter drop-shadow-lg">GAME OVER</h2>
            <div className="text-white text-2xl mb-12 border-y-4 border-white/20 py-4 w-full">
              FINAL SCORE: <span className="text-yellow-400 font-bold ml-2">{gameState.score}</span>
            </div>
            
            {gameState.sessionAttempts > 0 ? (
              <button 
                onClick={(e) => { e.stopPropagation(); startGame(); }}
                className="flex items-center gap-6 bg-blue-600 hover:bg-blue-500 text-white px-12 py-6 rounded-xl transition-all border-b-8 border-blue-900 active:border-b-0 active:translate-y-2 shadow-2xl"
              >
                <RotateCcw size={28} />
                <span className="text-2xl font-bold uppercase">RETRY (-1 NRG)</span>
              </button>
            ) : (
              <div className="flex flex-col items-center gap-6 p-8 bg-black/60 border-4 border-white shadow-[12px_12px_0px_0px_rgba(0,0,0,0.5)]">
                <h3 className="text-red-500 text-2xl font-black italic tracking-widest">NO LIVES LEFT</h3>
                
                <div className="w-full flex flex-col gap-6">
                   {/* Option A: Web3 */}
                   <div className="flex flex-col gap-2">
                      <span className="text-yellow-400 text-[8px] uppercase font-bold">Fast Refill (Web3)</span>
                      {!gameState.walletAddress ? (
                         <button 
                            onClick={(e) => { e.stopPropagation(); handleConnect(); }}
                            className="animate-pulse-retro border-4 border-white px-8 py-4 bg-black text-yellow-400 text-sm hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3"
                          >
                            <Wallet size={16} /> [CONNECT WALLET]
                          </button>
                      ) : (
                         <button 
                            onClick={(e) => { e.stopPropagation(); handleMintLives(); }}
                            disabled={gameState.isMinting}
                            className="bg-[#39ff14] border-b-8 border-[#2e7d1f] text-black px-6 py-4 font-black text-lg hover:bg-[#32cd32] active:translate-y-2 active:border-b-0 transition-all flex items-center justify-center gap-3"
                          >
                             {gameState.isMinting ? <Sparkles className="animate-spin" /> : <Zap size={18} fill="black" />}
                             MINT LIVES (+3)
                          </button>
                      )}
                   </div>

                   <div className="flex items-center gap-4">
                      <div className="h-[2px] flex-1 bg-white/20" />
                      <span className="text-white/40 text-[8px]">OR WAIT</span>
                      <div className="h-[2px] flex-1 bg-white/20" />
                   </div>

                   {/* Option B: Wait */}
                   <div className="flex flex-col items-center gap-2 bg-red-900/20 p-4 border-2 border-red-900">
                      <span className="text-white text-[8px] opacity-60 flex items-center gap-2">
                         <Clock size={12} /> NEXT FREE REFILL IN:
                      </span>
                      <span className={`text-2xl font-bold ${secondsUntilRecovery && secondsUntilRecovery < 60 ? 'animate-blink-red' : 'text-white'}`}>
                         {secondsUntilRecovery ? formatTime(secondsUntilRecovery) : "--:--:--"}
                      </span>
                   </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
