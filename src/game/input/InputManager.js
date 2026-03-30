// Input Manager - unified keyboard and touch controls
import { EVENTS } from '../constants.js';

export class InputManager {
  constructor(scene) {
    this.scene = scene;
    this.state = {
      left: false,
      right: false,
      jump: false,
      run: false,
      fire: false
    };

    this.setupKeyboard();
    this.setupTouchEvents();
  }

  setupKeyboard() {
    // Cursor keys
    this.cursors = this.scene.input.keyboard.createCursorKeys();

    // WASD keys
    this.wasd = this.scene.input.keyboard.addKeys({
      up: 'W',
      left: 'A',
      right: 'D',
      down: 'S'
    });

    // Space for jump
    this.spaceKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Shift for run
    this.shiftKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    // Z for fire
    this.zKey = this.scene.input.keyboard.addKey('Z');
  }

  setupTouchEvents() {
    this._touch = { left: false, right: false, jump: false, run: false, fire: false };

    window.addEventListener('mario-input', (event) => {
      const { action, pressed } = event.detail;
      if (action in this._touch) this._touch[action] = pressed;
    });
  }

  update() {
    this.state.left = this.cursors.left.isDown || this.wasd.left.isDown || this._touch.left;
    this.state.right = this.cursors.right.isDown || this.wasd.right.isDown || this._touch.right;
    this.state.jump = this.cursors.up.isDown || this.wasd.up.isDown || this.spaceKey.isDown || this._touch.jump;
    this.state.run = this.shiftKey.isDown || this._touch.run;
    this.state.fire = Phaser.Input.Keyboard.JustDown(this.zKey) || this._touch.fire;

    return this.state;
  }

  destroy() {
    window.removeEventListener('mario-input', this.handleTouchEvent);
  }
}

export default InputManager;