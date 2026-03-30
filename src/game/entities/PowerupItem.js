import { STATES, EVENTS, AUDIO_KEYS } from '../constants.js';
import EventBus from '../EventBus.js';

export default class PowerupItem extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type = 'mushroom') {
        let frame = 3; // default mushroom
        if (type === 'fire_flower') frame = 4;
        if (type === 'star') frame = 6;

        super(scene, x, y, 'items', frame);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.type = type;
        this.scene = scene;

        // Configure physics based on type
        if (type === 'mushroom') {
            this.setGravityY(800);
            this.setVelocityX(80);
            this.setBounce(0.5);
            this.setCollideWorldBounds(true);
        } else if (type === 'fire_flower') {
            this.setImmovable(true);
            // Bounce in place tween
            scene.tweens.add({
                targets: this,
                y: this.y - 2,
                duration: 500,
                yoyo: true,
                repeat: -1
            });
        } else if (type === 'star') {
            this.setGravityY(800);
            this.setVelocity(100, -300);
            this.setBounce(0.8);
            this.setCollideWorldBounds(true);
        }
    }

    collect(mario) {
        // Play powerup sound
        this.scene.sound.play(AUDIO_KEYS.POWERUP);

        // Apply powerup effect based on type
        switch (this.type) {
            case 'mushroom':
                if (mario._state === STATES.SMALL) {
                    mario.grow(STATES.SUPER);
                }
                break;
            case 'fire_flower':
                mario.grow(STATES.FIRE);
                break;
            case 'star':
                mario.setInvincible(10000);
                // Play invincible music (stop theme)
                this.scene.sound.stopByKey(AUDIO_KEYS.THEME);
                this.scene.sound.play(AUDIO_KEYS.INVINCIBLE, { loop: true });
                break;
        }

        // Emit score update
        EventBus.emit(EVENTS.SCORE_UPDATE, 1000);

        // Destroy self
        this.destroy();
    }

    update() {
        // Mushroom wall bounce logic
        if (this.type === 'mushroom') {
            const blocked = this.body.blocked;
            if (blocked.left || blocked.right) {
                this.setVelocityX(this.body.velocity.x * -1);
            }
        }
    }
}