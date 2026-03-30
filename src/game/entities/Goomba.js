import { GAME_HEIGHT, EVENTS } from '../constants.js';
import EventBus from '../EventBus.js';

export default class Goomba extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemies', 0);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // FSM states
    this._state = 'WALKING';
    this._direction = -1; // -1 = left, 1 = right

    // Physics config
    this.setGravityY(800);
    this.setImmovable(false);
    this.setVelocityX(-80);
    this.setSize(16, 16);
    this.setOffset(0, 0);

    // Create animation
    scene.anims.create({
      key: 'goomba-walk',
      frames: [
        { key: 'enemies', frame: 0 },
        { key: 'enemies', frame: 1 }
      ],
      frameRate: 4,
      repeat: -1
    });

    // Start walking animation
    this.play('goomba-walk');
  }

  update() {
    if (this._state !== 'WALKING') return;

    // Check if fell off screen
    if (this.y > GAME_HEIGHT + 100) {
      this.destroy();
      return;
    }

    // Reverse direction on wall collision
    if (this.body.blocked.left || this.body.blocked.right) {
      this._direction *= -1;
      this.setVelocityX(80 * this._direction);
    }
  }

  squish() {
    if (this._state !== 'WALKING') return;

    this._state = 'SQUISHED';
    this.setVelocityX(0);
    this.setVelocityY(0);
    this.setFrame(2); // Squished frame

    // Emit score
    EventBus.emit(EVENTS.SCORE_UPDATE, 100);

    // Fade out and destroy
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        this.destroy();
      }
    });
  }

  get enemyState() {
    return this._state;
  }
}