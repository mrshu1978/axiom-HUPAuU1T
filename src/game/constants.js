// Game constants and type definitions

// Game dimensions
export const GAME_WIDTH = 768;
export const GAME_HEIGHT = 432; // 16:9 NES-ish

// Tile size
export const TILE_SIZE = 16;

// Physics constants
export const GRAVITY = 1200; // px/s²
export const MARIO_SPEED = 160;
export const MARIO_RUN_SPEED = 250;
export const MARIO_JUMP_VELOCITY = -520;

// Game states
export const STATES = {
  SMALL: 'small',
  SUPER: 'super',
  FIRE: 'fire'
};

// Scene keys
export const SCENES = {
  BOOT: 'BootScene',
  TITLE: 'TitleScene',
  GAME: 'GameScene',
  HUD: 'HUDScene',
  GAMEOVER: 'GameOverScene',
  LEVEL_COMPLETE: 'LevelCompleteScene'
};

// Event bus event names
export const EVENTS = {
  SCORE_UPDATE: 'score-update',
  COINS_UPDATE: 'coins-update',
  LIVES_UPDATE: 'lives-update',
  MARIO_STATE: 'mario-state',
  GAME_OVER: 'game-over',
  LEVEL_COMPLETE: 'level-complete',
  TIMER_UPDATE: 'timer-update'
};

// Color palette
export const COLORS = {
  BG: '#0D0D1A',
  ACCENT: '#7B61FF',
  TEXT: '#FFFFFF',
  GOLD: '#FFD700'
};

// Render depths
export const DEPTHS = {
  BG: 0,
  TILES: 1,
  ITEMS: 2,
  ENEMIES: 3,
  MARIO: 4,
  HUD: 10
};

// Audio keys (must match file names in public/audio/)
export const AUDIO_KEYS = {
  THEME: 'theme',
  INVINCIBLE: 'invincible',
  UNDERGROUND: 'underground',
  COIN: 'coin',
  JUMP: 'jump',
  POWERUP: 'powerup',
  STOMP: 'stomp',
  PIPE: 'pipe',
  FLAGPOLE: 'flagpole',
  GAMEOVER: 'gameover',
  LEVELCOMPLETE: 'levelcomplete',
  FIREBALL: 'fireball'
};