import { SCENES, COLORS, AUDIO_KEYS } from '../constants.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.GAMEOVER });
  }

  create(data) {
    // Background
    this.cameras.main.setBackgroundColor(COLORS.BG);

    // GAME OVER text
    this.add.text(384, 180, 'GAME OVER', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#FFFFFF',
      align: 'center',
      letterSpacing: '4px'
    }).setOrigin(0.5);

    // Score display
    const scoreStr = data?.score?.toString().padStart(6, '0') || '000000';
    this.add.text(384, 220, `SCORE: ${scoreStr}`, {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#FFD700',
      align: 'center'
    }).setOrigin(0.5);

    // Axiom branding
    this.add.text(384, 260, 'AXIOM', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: COLORS.ACCENT,
      align: 'center'
    }).setOrigin(0.5);

    // Play gameover audio
    this.sound.play(AUDIO_KEYS.GAMEOVER, { volume: 0.7 });

    // Auto-transition to TitleScene after 3 seconds
    this.time.delayedCall(3000, () => {
      this.scene.start(SCENES.TITLE);
    });
  }
}