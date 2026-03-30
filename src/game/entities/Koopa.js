import { GAME_HEIGHT, EVENTS } from '../constants.js';
import EventBus from '../EventBus.js';

export default class Koopa extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemies', 4); // Row 1, frame 4

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // FSM states: WALKING, SHELL_IDLE, SHELL_SLIDING, DEAD
    this._state = 'WALKING';
    this._direction = -1; // -1 = left, 1 = right
    this._shellTimer = null;

    // Physics config
    this.setGravityY(800);
    this.setImmovable(false);
    this.setVelocityX(-80);
    this.setSize(16, 16);
    this.setOffset(0, 0);

    // Create animations
    scene.anims.create({
      key: 'koopa-walk',
      frames: [
        { key: 'enemies', frame: 4 },
        { key: 'enemies', frame: 5 }
      ],
      frameRate: 4,
      repeat: -1
    });

    // Start walking animation
    this.play('koopa-walk');
  }

  update() {
    if (this._state === 'DEAD') return;

    // Check if fell off screen
    if (this.y > GAME_HEIGHT + 100) {
      this.destroy();
      return;
    }

    if (this._state === 'WALKING') {
      // Reverse direction on wall collision
      if (this.body.blocked.left || this.body.blocked.right) {
        this._direction *= -1;
        this.setVelocityX(80 * this._direction);
      }
    } else if (this._state === 'SHELL_IDLE') {
      // Countdown timer to return to walking
      if (this._shellTimer) {
        this._shellTimer -= this.scene.game.loop.delta;
        if (this._shellTimer <= 0) {
          this.returnToWalking();
        }
      }
    } else if (this._state === 'SHELL_SLIDING') {
      // Destroy on wall collision
      if (this.body.blocked.left || this.body.blocked.right) {
        this.destroy();
      }
    }
  }

  stomp() {
    if (this._state !== 'WALKING') return;

    this._state = 'SHELL_IDLE';
    this.setVelocityX(0);
    this.setFrame(6); // Shell idle frame
    this.anims.stop();

    // Start 5-second timer to return to walking
    this._shellTimer = 5000;

    // Emit score for stomp
    EventBus.emit(EVENTS.SCORE_UPDATE, 100);
  }

  slide(marioX) {
    if (this._state !== 'SHELL_IDLE') return;

    this._state = 'SHELL_SLIDING';
    this.setFrame(7); // Shell sliding frame

    // Determine slide direction based on Mario's position
    const slideDirection = marioX < this.x ? 1 : -1;
    this.setVelocityX(300 * slideDirection);

    // Clear timer
    this._shellTimer = null;
  }

  returnToWalking() {
    this._state = 'WALKING';
    this.setFrame(4);
    this.play('koopa-walk');
    this.setVelocityX(-80);
    this._shellTimer = null;
  }

  destroyEnemy() {
    // Called when shell hits another enemy
    EventBus.emit(EVENTS.SCORE_UPDATE, 200);
    this.destroy();
  }

  get enemyState() {
    return this._state;
  }

  get isShellIdle() {
    return this._state === 'SHELL_IDLE';
  }

  get isShellSliding() {
    return this._state === 'SHELL_SLIDING';
  }
}