import { SCENES, COLORS, AUDIO_KEYS } from '../constants.js';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.TITLE });
    this.blinkTween = null;
    this.marioTween = null;
  }

  create() {
    // Background
    this.cameras.main.setBackgroundColor(COLORS.BG);

    // Ground tiles at bottom
    const groundY = 400;
    for (let x = 0; x < 768; x += 16) {
      this.add.image(x, groundY, 'tiles', 0).setOrigin(0, 0);
    }

    // Pixel-art clouds (simple white rectangles)
    this.createCloud(100, 80);
    this.createCloud(300, 120);
    this.createCloud(500, 90);

    // Axiom logo
    this.add.text(384, 40, 'AXIOM', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: COLORS.ACCENT,
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(384, 70, '★ PRESENTS ★', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#FFFFFF',
      align: 'center'
    }).setOrigin(0.5);

    // Title text with red shadow
    const title = this.add.text(384, 140, 'SUPER MARIO BROS', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#FFFFFF',
      align: 'center'
    }).setOrigin(0.5);

    title.setStroke(COLORS.ACCENT, 2);

    // Mario sprite animation
    const mario = this.add.sprite(120, 280, 'mario', 0);
    this.marioTween = this.tweens.add({
      targets: mario,
      x: { from: 100, to: 140 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Press Start blinking text
    const pressStart = this.add.text(384, 300, 'PRESS START', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#FFD700',
      align: 'center'
    }).setOrigin(0.5);

    this.blinkTween = this.tweens.add({
      targets: pressStart,
      alpha: { from: 0, to: 1 },
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Linear'
    });

    // Copyright text
    this.add.text(384, 410, '© 1985 NINTENDO  © 2024 AXIOM', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#888888',
      align: 'center'
    }).setOrigin(0.5);

    // Input handling
    this.input.keyboard.on('keydown-ENTER', this.startGame, this);
    this.input.keyboard.on('keydown-SPACE', this.startGame, this);
    this.input.on('pointerdown', this.startGame, this);

    // Background music
    this.sound.play(AUDIO_KEYS.THEME, { loop: true, volume: 0.5 });
  }

  createCloud(x, y) {
    // Simple cloud shape using rectangles
    this.add.rectangle(x, y, 40, 10, 0xFFFFFF).setOrigin(0.5);
    this.add.rectangle(x - 10, y - 5, 20, 10, 0xFFFFFF).setOrigin(0.5);
    this.add.rectangle(x + 10, y - 5, 20, 10, 0xFFFFFF).setOrigin(0.5);
  }

  startGame() {
    // Stop blink tween
    if (this.blinkTween) {
      this.blinkTween.stop();
    }

    // Play coin sound
    this.sound.play(AUDIO_KEYS.COIN, { volume: 0.7 });

    // Start GameScene and launch HUDScene
    this.scene.start(SCENES.GAME);
    this.scene.launch(SCENES.HUD);
  }
}