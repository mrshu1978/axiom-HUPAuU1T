import { STATES, EVENTS, GRAVITY, MARIO_SPEED, MARIO_RUN_SPEED, MARIO_JUMP_VELOCITY } from '../constants.js';
import EventBus from '../EventBus.js';

export default class Mario extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'mario', 0);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // State machine
    this._state = STATES.SMALL;
    this._isGrounded = false;
    this._isRunning = false;
    this._isDead = false;
    this._isInvincible = false;
    this._invincibleTimer = null;
    this._facingRight = true;

    // Physics config
    this.body.setGravityY(GRAVITY);
    this.setMaxVelocity(MARIO_RUN_SPEED, 1000);
    this.setDragX(800);
    this.setSize(16, 16);
    this.setOffset(0, 0);

    // Create animations
    this.createAnimations(scene);

    // Start with idle animation
    this.play('mario-idle-small');
  }

  createAnimations(scene) {
    // Small Mario animations (row 0)
    scene.anims.create({
      key: 'mario-idle-small',
      frames: [{ key: 'mario', frame: 0 }],
      frameRate: 1
    });

    scene.anims.create({
      key: 'mario-walk-small',
      frames: [
        { key: 'mario', frame: 1 },
        { key: 'mario', frame: 2 },
        { key: 'mario', frame: 3 }
      ],
      frameRate: 12,
      repeat: -1
    });

    scene.anims.create({
      key: 'mario-jump-small',
      frames: [{ key: 'mario', frame: 4 }],
      frameRate: 1
    });

    scene.anims.create({
      key: 'mario-skid-small',
      frames: [{ key: 'mario', frame: 5 }],
      frameRate: 1
    });

    // Super Mario animations (row 1, +8 offset)
    scene.anims.create({
      key: 'mario-idle-super',
      frames: [{ key: 'mario', frame: 8 }],
      frameRate: 1
    });

    scene.anims.create({
      key: 'mario-walk-super',
      frames: [
        { key: 'mario', frame: 9 },
        { key: 'mario', frame: 10 },
        { key: 'mario', frame: 11 }
      ],
      frameRate: 12,
      repeat: -1
    });

    scene.anims.create({
      key: 'mario-jump-super',
      frames: [{ key: 'mario', frame: 12 }],
      frameRate: 1
    });

    scene.anims.create({
      key: 'mario-skid-super',
      frames: [{ key: 'mario', frame: 13 }],
      frameRate: 1
    });

    // Fire Mario animations (row 2, +16 offset)
    scene.anims.create({
      key: 'mario-idle-fire',
      frames: [{ key: 'mario', frame: 16 }],
      frameRate: 1
    });

    scene.anims.create({
      key: 'mario-walk-fire',
      frames: [
        { key: 'mario', frame: 17 },
        { key: 'mario', frame: 18 },
        { key: 'mario', frame: 19 }
      ],
      frameRate: 12,
      repeat: -1
    });

    scene.anims.create({
      key: 'mario-jump-fire',
      frames: [{ key: 'mario', frame: 20 }],
      frameRate: 1
    });

    scene.anims.create({
      key: 'mario-skid-fire',
      frames: [{ key: 'mario', frame: 21 }],
      frameRate: 1
    });

    // Dead animation
    scene.anims.create({
      key: 'mario-dead',
      frames: [{ key: 'mario', frame: 6 }],
      frameRate: 1
    });

    // Grow transformation animation
    scene.anims.create({
      key: 'mario-grow',
      frames: [
        { key: 'mario', frame: 24 },
        { key: 'mario', frame: 25 },
        { key: 'mario', frame: 26 },
        { key: 'mario', frame: 27 },
        { key: 'mario', frame: 0 },
        { key: 'mario', frame: 24 },
        { key: 'mario', frame: 25 },
        { key: 'mario', frame: 26 },
        { key: 'mario', frame: 27 }
      ],
      frameRate: 8
    });
  }

  update(cursors, fireKey) {
    if (this._isDead) return;

    // Update grounded state
    this._isGrounded = this.body.blocked.down || this.body.touching.down;

    // Horizontal movement with acceleration
    let accelX = 0;
    if (cursors.left) {
      accelX = -800;
      this._facingRight = false;
    } else if (cursors.right) {
      accelX = 800;
      this._facingRight = true;
    }

    // Apply acceleration with different values for ground/air
    const acceleration = this._isGrounded ? 800 : 400;
    if (accelX !== 0) {
      this.setAccelerationX(accelX);
    } else {
      this.setAccelerationX(0);
      // Apply drag
      this.setDragX(this._isGrounded ? 800 : 200);
    }

    // Jump
    if (cursors.up && this._isGrounded) {
      this.setVelocityY(MARIO_JUMP_VELOCITY);
      this._isGrounded = false;
      EventBus.emit(EVENTS.SCORE_UPDATE, 0); // Jump event for potential scoring
    }

    // Flip sprite based on direction
    this.flipX = !this._facingRight;

    // Update animation
    this.updateAnimation();

    // Invincibility timer
    if (this._isInvincible && this._invincibleTimer) {
      this._invincibleTimer -= this.scene.game.loop.delta;
      if (this._invincibleTimer <= 0) {
        this.setInvincible(false);
      }
    }
  }

  updateAnimation() {
    if (this._isDead) {
      this.play('mario-dead', true);
      return;
    }

    const stateSuffix = this._state === STATES.SMALL ? 'small' :
                       this._state === STATES.SUPER ? 'super' : 'fire';

    if (!this._isGrounded) {
      this.play(`mario-jump-${stateSuffix}`, true);
    } else if (Math.abs(this.body.velocity.x) > 10) {
      // Check for skid (moving opposite to facing direction)
      const movingRight = this.body.velocity.x > 0;
      if ((movingRight && !this._facingRight) || (!movingRight && this._facingRight)) {
        this.play(`mario-skid-${stateSuffix}`, true);
      } else {
        this.play(`mario-walk-${stateSuffix}`, true);
      }
    } else {
      this.play(`mario-idle-${stateSuffix}`, true);
    }
  }

  grow(newState) {
    if (this._state === newState) return;

    this.play('mario-grow');
    this._state = newState;

    // Adjust body size based on state
    if (newState === STATES.SMALL) {
      this.setSize(16, 16);
      this.setOffset(0, 0);
    } else {
      this.setSize(16, 24);
      this.setOffset(0, -8);
    }

    EventBus.emit(EVENTS.MARIO_STATE, newState);
  }

  takeDamage() {
    if (this._isInvincible) return;

    if (this._state === STATES.FIRE) {
      this.grow(STATES.SUPER);
      this.setInvincible(2000);
    } else if (this._state === STATES.SUPER) {
      this.grow(STATES.SMALL);
      this.setInvincible(2000);
    } else {
      this.die();
    }
  }

  die() {
    this._isDead = true;
    this.setVelocityY(-400);
    this.body.enable = false;
    this.play('mario-dead', true);

    EventBus.emit(EVENTS.LIVES_UPDATE);
    EventBus.emit(EVENTS.GAME_OVER);
  }

  collectCoin() {
    EventBus.emit(EVENTS.COINS_UPDATE);
    EventBus.emit(EVENTS.SCORE_UPDATE, 200);
  }

  setInvincible(duration) {
    this._isInvincible = true;
    this._invincibleTimer = duration;

    // Flash effect
    this.scene.tweens.add({
      targets: this,
      alpha: { from: 0.5, to: 1 },
      duration: 100,
      yoyo: true,
      repeat: Math.floor(duration / 200),
      onComplete: () => {
        this.alpha = 1;
        this._isInvincible = false;
        this._invincibleTimer = null;
      }
    });
  }

  get isDead() {
    return this._isDead;
  }

  get state() {
    return this._state;
  }

  get isGrounded() {
    return this._isGrounded;
  }
}