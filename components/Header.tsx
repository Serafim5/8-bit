
import React from 'react';

interface HeaderProps {
  walletAddress: string | null;
  onConnect: () => void;
  sessionAttempts: number;
}

const Header: React.FC<HeaderProps> = ({ walletAddress, onConnect, sessionAttempts }) => {
  return (
    <div className="absolute top-0 left-0 w-full h-16 bg-black border-b-4 border-white flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-4">
        <div className="text-yellow-400 text-[10px] tracking-tighter">
          STATUS: <span className={sessionAttempts > 0 ? "text-green-400" : "text-red-500"}>
            {sessionAttempts > 0 ? "READY" : "OUT OF ENERGY"}
          </span>
        </div>
        <div className="text-white text-[10px]">
          ATTEMPTS: <span className="text-yellow-400">{sessionAttempts}</span>
        </div>
      </div>
      
      <button 
        onClick={walletAddress ? undefined : onConnect}
        className="border-2 border-white px-4 py-2 hover:bg-white/10 transition-colors"
      >
        <span className="text-yellow-400 text-[10px] font-bold">
          {walletAddress 
            ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` 
            : "[CONNECT WALLET]"
          }
        </span>
      </button>
    </div>
  );
};

export default Header;
