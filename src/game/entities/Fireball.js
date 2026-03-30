import { EVENTS, AUDIO_KEYS } from '../constants.js';
import EventBus from '../EventBus.js';

export default class Fireball extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, direction = 1) {
        super(scene, x, y, 'items', 8); // frame 8 = fireball
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.direction = direction;
        this.scene = scene;

        // Configure physics
        this.setGravityY(600);
        this.setBounce(0.6);
        this.setVelocityX(direction * 400);
        this.setCollideWorldBounds(false);

        // Play fireball sound
        scene.sound.play(AUDIO_KEYS.FIREBALL);
    }

    update() {
        // Check if out of bounds
        if (this.x < -100 || this.x > this.scene.cameras.main.worldView.width + 100) {
            this.destroy();
            return;
        }

        // Check if hit wall
        const blocked = this.body.blocked;
        if (blocked.left || blocked.right) {
            this.destroy();
        }
    }

    hitEnemy(enemy) {
        // Apply damage to enemy
        if (enemy.squish) {
            enemy.squish();
        } else if (enemy.destroy) {
            enemy.destroy();
        }

        // Emit score update
        EventBus.emit(EVENTS.SCORE_UPDATE, 200);

        // Destroy fireball
        this.destroy();
    }
}