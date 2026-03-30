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
    // Listen for custom events from React touch controls
    window.addEventListener('mario-input', (event) => {
      const { action, pressed } = event.detail;

      switch (action) {
        case 'left':
          this.state.left = pressed;
          break;
        case 'right':
          this.state.right = pressed;
          break;
        case 'jump':
          this.state.jump = pressed;
          break;
        case 'run':
          this.state.run = pressed;
          break;
        case 'fire':
          this.state.fire = pressed;
          break;
      }
    });
  }

  update() {
    // Keyboard state
    this.state.left = this.cursors.left.isDown || this.wasd.left.isDown;
    this.state.right = this.cursors.right.isDown || this.wasd.right.isDown;
    this.state.jump = this.cursors.up.isDown || this.wasd.up.isDown || this.spaceKey.isDown;
    this.state.run = this.shiftKey.isDown;

    // Fire button (just pressed, not held)
    if (Phaser.Input.Keyboard.JustDown(this.zKey)) {
      this.state.fire = true;
    } else {
      this.state.fire = false;
    }

    // Touch events are already handled via custom events
    return this.state;
  }

  destroy() {
    window.removeEventListener('mario-input', this.handleTouchEvent);
  }
}

export default InputManager;