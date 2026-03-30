import Phaser from 'phaser';
import { SCENES, COLORS } from '../constants.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.BOOT });
  }

  preload() {
    // Nothing to preload in boot scene
  }

  create() {
    // Set background color
    this.cameras.main.setBackgroundColor(COLORS.BG);

    // Create loading bar
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Loading bar background
    this.add.rectangle(centerX, centerY, 400, 20, 0x333333)
      .setStrokeStyle(2, 0xFFFFFF);

    // Loading bar fill
    const loadingBar = this.add.rectangle(centerX - 200, centerY, 0, 16, 0x7B61FF)
      .setOrigin(0, 0.5);

    // Loading text
    this.add.text(centerX, centerY - 30, 'LOADING...', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // Animate loading bar
    this.tweens.add({
      targets: loadingBar,
      width: 400,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        // Start preload scene
        this.scene.start('PreloadScene');
      }
    });
  }
}