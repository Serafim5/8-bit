
import React from 'react';
import { GRASS_HEIGHT } from '../constants';

const Background: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Sky */}
      <div className="absolute inset-0 bg-[#63adff]" />
      
      {/* Clouds (simple shapes) */}
      <div className="absolute top-20 left-10 w-24 h-12 bg-white rounded-full opacity-80" />
      <div className="absolute top-32 left-40 w-32 h-16 bg-white rounded-full opacity-80" />
      <div className="absolute top-16 right-20 w-40 h-20 bg-white rounded-full opacity-80" />

      {/* Distant Hills */}
      <div className="absolute bottom-[120px] left-0 w-full h-20 bg-[#2d5a27]" style={{ clipPath: 'polygon(0% 100%, 15% 40%, 30% 80%, 45% 30%, 60% 70%, 75% 40%, 100% 100%)' }} />

      {/* Grass/Foreground */}
      <div 
        className="absolute bottom-0 w-full bg-[#40a02b] border-t-8 border-[#2e7d1f] z-20"
        style={{ height: GRASS_HEIGHT }}
      >
        {/* Bush Decorations */}
        <div className="absolute -top-12 left-[10%] w-24 h-16 bg-[#2d5a27] rounded-full" />
        <div className="absolute -top-16 left-[45%] w-32 h-24 bg-[#2d5a27] rounded-full" />
        <div className="absolute -top-10 right-[15%] w-20 h-14 bg-[#2d5a27] rounded-full" />
      </div>
    </div>
  );
};

export default Background;
