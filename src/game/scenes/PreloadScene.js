import Phaser from 'phaser';
import { SCENES, AUDIO_KEYS } from '../constants.js';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // Create progress bar
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Progress bar background
    const progressBarBg = this.add.rectangle(centerX, centerY, 400, 20, 0x333333)
      .setStrokeStyle(2, 0xFFFFFF);

    // Progress bar fill
    const progressBar = this.add.rectangle(centerX - 200, centerY, 0, 16, 0x7B61FF)
      .setOrigin(0, 0.5);

    // Loading text
    const loadingText = this.add.text(centerX, centerY - 30, 'LOADING...', {
      fontFamily: '"Press Start 2P"',
      fontSize: '12px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // Update progress bar as assets load
    this.load.on('progress', (value) => {
      progressBar.width = 400 * value;
    });

    // Load spritesheets
    this.load.spritesheet('mario', 'assets/sprites/mario-sprites.png', {
      frameWidth: 16,
      frameHeight: 16
    });

    this.load.spritesheet('enemies', 'assets/sprites/enemies-sprites.png', {
      frameWidth: 16,
      frameHeight: 16
    });

    this.load.spritesheet('tiles', 'assets/sprites/tiles-spritesheet.png', {
      frameWidth: 16,
      frameHeight: 16
    });

    this.load.spritesheet('items', 'assets/sprites/items-sprites.png', {
      frameWidth: 16,
      frameHeight: 16
    });

    this.load.spritesheet('hud-icons', 'assets/sprites/hud-sprites.png', {
      frameWidth: 8,
      frameHeight: 8
    });

    // Load tilemap
    this.load.tilemapTiledJSON('world1-1', 'assets/tilemaps/world1-1.json');

    // Load audio files (both .ogg and .mp3 for compatibility)
    const audioKeys = Object.values(AUDIO_KEYS);
    audioKeys.forEach(key => {
      this.load.audio(key, [
        `audio/${key}.ogg`,
        `audio/${key}.mp3`
      ]);
    });
  }

  create() {
    // All assets loaded, start TitleScene
    this.scene.start(SCENES.TITLE);
  }
}