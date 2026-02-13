
export enum GameStatus {
  START = 'START',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export enum DuckStatus {
  ALIVE = 'ALIVE',
  HIT = 'HIT',
  FALLING = 'FALLING',
  FLYING_AWAY = 'FLYING_AWAY'
}

export enum DogType {
  NONE = 'NONE',
  HAPPY = 'HAPPY',
  LAUGHING = 'LAUGHING'
}

export interface Duck {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  status: DuckStatus;
  color: string;
}

export interface GameState {
  status: GameStatus;
  score: number;
  lives: number; // Health in-game
  ammo: number;
  level: number;
  ducksHitThisLevel: number;
  dogType: DogType;
  sessionAttempts: number; // Global attempts (Energy)
  walletAddress: string | null;
  isMinting: boolean;
  aiMessage: string | null;
  lastLivesDepletedTime: number | null; // Timestamp when energy hit 0
}
