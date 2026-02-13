
import React from 'react';
import { Duck, DuckStatus } from '../types';
import { DUCK_SIZE } from '../constants';
import { Target } from 'lucide-react';

interface DuckSpriteProps {
  duck: Duck;
  onHit: (id: number) => void;
}

const DuckSprite: React.FC<DuckSpriteProps> = ({ duck, onHit }) => {
  const isFacingRight = duck.vx > 0;
  
  const getDuckContent = () => {
    switch (duck.status) {
      case DuckStatus.HIT:
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-white text-xs mb-1">HIT!</div>
            <Target size={30} className="text-red-500" />
          </div>
        );
      case DuckStatus.FALLING:
        return (
          <div className="rotate-180 scale-x-[-1]">
             <DuckIcon color={duck.color} isFlapping={false} />
          </div>
        );
      case DuckStatus.FLYING_AWAY:
        return (
           <div className="opacity-70">
              <DuckIcon color="#888" isFlapping={true} />
           </div>
        );
      default:
        return (
          <div className={`${isFacingRight ? 'scale-x-1' : 'scale-x-[-1]'}`}>
            <DuckIcon color={duck.color} isFlapping={true} />
          </div>
        );
    }
  };

  return (
    <div
      onClick={() => onHit(duck.id)}
      className="absolute cursor-crosshair transition-transform duration-75"
      style={{
        left: duck.x,
        top: duck.y,
        width: DUCK_SIZE,
        height: DUCK_SIZE,
        zIndex: duck.status === DuckStatus.FALLING ? 5 : 10,
      }}
    >
      {getDuckContent()}
    </div>
  );
};

const DuckIcon: React.FC<{ color: string; isFlapping: boolean }> = ({ color, isFlapping }) => (
  <div className="relative w-full h-full flex items-center justify-center">
    {/* Body */}
    <div 
      className={`w-4/5 h-3/5 rounded-full relative ${isFlapping ? 'animate-flap' : ''}`}
      style={{ backgroundColor: color }}
    >
      {/* Head */}
      <div 
        className="absolute -right-2 top-0 w-8 h-8 rounded-full border-2 border-black" 
        style={{ backgroundColor: color }}
      >
        {/* Eye */}
        <div className="absolute right-2 top-2 w-1.5 h-1.5 bg-black rounded-full" />
        {/* Beak */}
        <div className="absolute -right-2 top-3 w-4 h-2 bg-orange-500 rounded-sm" />
      </div>
      {/* Wing */}
      <div 
        className="absolute top-2 left-2 w-1/2 h-1/2 bg-white/30 rounded-full border border-black/20" 
      />
    </div>
  </div>
);

export default DuckSprite;
