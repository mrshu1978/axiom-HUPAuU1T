import { SCENES, COLORS, AUDIO_KEYS } from '../constants.js';

export default class LevelCompleteScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelCompleteScene' });
  }

  create(data) {
    // Background
    this.cameras.main.setBackgroundColor(COLORS.BG);

    // COURSE CLEAR! text with drop shadow
    const courseClear = this.add.text(384, 140, 'COURSE CLEAR!', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#FFFFFF',
      align: 'center'
    }).setOrigin(0.5);

    courseClear.setStroke('#FFD700', 2);

    // Tally animation
    const timeBonus = data?.timeRemaining ? data.timeRemaining * 50 : 0;
    const totalScore = data?.score ? data.score + timeBonus : timeBonus;

    // Time bonus line
    const timeBonusText = this.add.text(384, 200, `TIME BONUS: ${timeBonus}`, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#FFFFFF',
      align: 'center'
    }).setOrigin(0.5);
    timeBonusText.setAlpha(0);

    // Score total line
    const scoreText = this.add.text(384, 230, `SCORE: ${totalScore}`, {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#FFD700',
      align: 'center'
    }).setOrigin(0.5);
    scoreText.setAlpha(0);

    // Axiom branding at bottom
    this.add.text(384, 320, 'AXIOM', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: COLORS.ACCENT,
      align: 'center'
    }).setOrigin(0.5);

    // Play level complete audio
    this.sound.play(AUDIO_KEYS.LEVELCOMPLETE, { volume: 0.7 });

    // Tally animation sequence
    this.tweens.add({
      targets: timeBonusText,
      alpha: 1,
      duration: 500,
      delay: 500,
      ease: 'Linear'
    });

    this.tweens.add({
      targets: scoreText,
      alpha: 1,
      duration: 500,
      delay: 1000,
      ease: 'Linear'
    });

    // Auto-transition to TitleScene after 5 seconds
    this.time.delayedCall(5000, () => {
      this.scene.start(SCENES.TITLE);
    });
  }
}