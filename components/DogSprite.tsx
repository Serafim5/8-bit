
import React from 'react';
import { DogType } from '../types';
import { GRASS_HEIGHT } from '../constants';

interface DogSpriteProps {
  type: DogType;
}

const DogSprite: React.FC<DogSpriteProps> = ({ type }) => {
  if (type === DogType.NONE) return null;

  const isLaughing = type === DogType.LAUGHING;

  return (
    <div 
      className="absolute left-1/2 -translate-x-1/2 z-[25] flex flex-col items-center"
      style={{ 
        bottom: GRASS_HEIGHT - 10,
        animation: 'dogSequence 2.6s ease-in-out forwards'
      }}
    >
      <style>{`
        @keyframes dogSequence {
          0% { transform: translate(-50%, 150px); }
          12% { transform: translate(-50%, 0px); }
          88% { transform: translate(-50%, 0px); }
          100% { transform: translate(-50%, 150px); }
        }

        @keyframes headTurn {
          0%, 12% { transform: rotate(0deg); }
          18% { transform: rotate(-8deg) translateX(-4px); }
          28% { transform: rotate(8deg) translateX(4px); }
          35%, 100% { transform: rotate(0deg); }
        }

        @keyframes featureScan {
          0%, 12% { transform: translateX(0); }
          18% { transform: translateX(-6px); }
          28% { transform: translateX(6px); }
          35%, 100% { transform: translateX(0); }
        }

        @keyframes earFlop {
          0%, 12% { transform: rotate(0deg); }
          18% { transform: rotate(-15deg); }
          28% { transform: rotate(15deg); }
          35%, 100% { transform: rotate(0deg); }
        }

        @keyframes reactionPop {
          0%, 35% { transform: scale(1); }
          40% { transform: scale(1.1); }
          45%, 100% { transform: scale(1); }
        }

        @keyframes dogLaugh {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        .animate-head-turn {
          animation: headTurn 2.6s ease-in-out forwards;
        }
        
        .animate-features {
          animation: featureScan 2.6s ease-in-out forwards;
        }

        .animate-ear-left {
          animation: earFlop 2.6s ease-in-out forwards;
        }

        .animate-ear-right {
          animation: earFlop 2.6s ease-in-out forwards;
        }

        .animate-laugh {
          animation: dogLaugh 0.15s infinite 1s; /* Start laughing after scan */
        }

        .animate-reaction-pop {
          animation: reactionPop 2.6s ease-in-out forwards;
        }

        .duck-wing {
          animation: flap 0.1s infinite;
        }
      `}</style>
      
      {isLaughing && (
        <div 
          className="bg-white px-3 py-1 rounded-lg text-[10px] mb-2 border-2 border-black shadow-lg z-30 opacity-0"
          style={{ animation: 'fadeInOut 1.5s ease-in-out 1s forwards' }}
        >
          <style>{`
            @keyframes fadeInOut {
              0% { opacity: 0; transform: translateY(10px); }
              20% { opacity: 1; transform: translateY(0); }
              80% { opacity: 1; transform: translateY(0); }
              100% { opacity: 0; transform: translateY(-10px); }
            }
          `}</style>
          HE HE HE!
        </div>
      )}

      {/* Dog Container */}
      <div className={`relative w-32 h-32 flex flex-col items-center ${isLaughing ? 'animate-laugh' : 'animate-reaction-pop'}`}>
        
        {/* Held Ducks (only when Happy) - Hidden during scan */}
        {!isLaughing && (
          <div 
            className="absolute -top-6 w-full flex justify-between px-1 z-20 opacity-0"
            style={{ animation: 'fadeIn 0.2s ease-out 0.9s forwards' }}
          >
            <style>{` @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } `}</style>
            <HeldDuck color="#FFD700" side="left" />
            <HeldDuck color="#FF4500" side="right" />
          </div>
        )}

        {/* Dog Head */}
        <div className="relative w-20 h-20 bg-[#8B4513] rounded-2xl border-4 border-black shadow-inner animate-head-turn">
          {/* Ears - Independent movement during head turn */}
          <div className="absolute -left-6 top-0 w-10 h-16 bg-[#5D2E0C] rounded-2xl border-2 border-black -rotate-12 origin-top-right animate-ear-left" />
          <div className="absolute -right-6 top-0 w-10 h-16 bg-[#5D2E0C] rounded-2xl border-2 border-black rotate-12 origin-top-left animate-ear-right" />
          
          {/* Facial Features Group (Scans) */}
          <div className="w-full h-full animate-features">
            {/* Eyes */}
            <div className="absolute top-6 left-4 flex gap-6">
              <div className="w-3 h-4 bg-white rounded-full border border-black relative">
                 <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-black rounded-full" />
              </div>
              <div className="w-3 h-4 bg-white rounded-full border border-black relative">
                 <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-black rounded-full" />
              </div>
            </div>

            {/* Snout */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-14 h-10 bg-[#DEB887] rounded-full border-2 border-black flex flex-col items-center pt-1">
               <div className="w-4 h-2.5 bg-black rounded-full mb-1" />
               <div className="w-6 h-0.5 bg-black/20 rounded-full" />
               
               {/* Tongue (only when laughing) */}
               {isLaughing && (
                 <div className="w-4 h-3 bg-red-500 rounded-b-full border-x border-b border-black -mb-1 animate-pulse" />
               )}
            </div>
          </div>
        </div>

        {/* Dog Body / Paws */}
        <div className="w-24 h-12 bg-[#8B4513] border-x-4 border-t-4 border-black rounded-t-3xl -mt-2 z-10">
           <div className="flex justify-between px-2 pt-2">
              <div className="w-6 h-6 bg-[#DEB887] rounded-full border-2 border-black" />
              <div className="w-6 h-6 bg-[#DEB887] rounded-full border-2 border-black" />
           </div>
        </div>
      </div>
    </div>
  );
};

const HeldDuck: React.FC<{ color: string; side: 'left' | 'right' }> = ({ color, side }) => (
  <div className={`flex flex-col items-center ${side === 'left' ? '-rotate-12' : 'rotate-12'}`}>
    <div className="w-8 h-10 rounded-full border-2 border-black relative shadow-md" style={{ backgroundColor: color }}>
       <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border border-black" style={{ backgroundColor: color }} />
       <div className="absolute top-2 left-1 w-4 h-2 bg-white/40 rounded-full" />
       {/* Dead eyes */}
       <div className="absolute top-0 left-1 text-[6px] text-black">X</div>
       <div className="absolute top-0 right-1 text-[6px] text-black">X</div>
    </div>
  </div>
);

export default DogSprite;
