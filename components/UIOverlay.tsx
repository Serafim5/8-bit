
import React from 'react';
import { GameState } from '../types';
import { Heart, Zap } from 'lucide-react';
import { INITIAL_AMMO, INITIAL_LIVES } from '../constants';

interface UIOverlayProps {
  gameState: GameState;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ gameState }) => {
  return (
    <div className="absolute bottom-0 w-full h-24 bg-black border-t-4 border-green-800 flex items-center justify-around px-8 z-30 pointer-events-none">
      {/* Energy Section */}
      <div className="flex flex-col items-center">
        <span className="text-yellow-400 text-[8px] mb-2 font-bold tracking-widest">ENERGY</span>
        <div className="flex gap-1">
          {[...Array(3)].map((_, i) => (
            <Zap
              key={i}
              size={18}
              className={i < gameState.sessionAttempts ? 'text-yellow-400 fill-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'text-gray-800'}
            />
          ))}
        </div>
      </div>

      {/* Ammo Section */}
      <div className="flex flex-col items-center">
        <span className="text-white text-[8px] mb-2 font-bold">SHOTS</span>
        <div className="flex gap-1">
          {Array.from({ length: INITIAL_AMMO }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-6 border-2 ${i < gameState.ammo ? 'bg-blue-400 border-white' : 'bg-gray-800 border-gray-600'}`}
            />
          ))}
        </div>
      </div>

      {/* Score Section */}
      <div className="flex flex-col items-center">
        <span className="text-white text-[8px] mb-1 font-bold">SCORE</span>
        <span className="text-yellow-400 text-xl font-bold">{gameState.score.toString().padStart(6, '0')}</span>
      </div>

      {/* Health Section */}
      <div className="flex flex-col items-center">
        <span className="text-white text-[8px] mb-2 font-bold">HITS</span>
        <div className="flex gap-2">
          {Array.from({ length: INITIAL_LIVES }).map((_, i) => (
            <Heart
              key={i}
              size={20}
              className={i < gameState.lives ? 'text-red-500 fill-red-500' : 'text-gray-900'}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UIOverlay;
