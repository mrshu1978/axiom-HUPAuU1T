import { EVENTS } from '../constants.js';
import EventBus from '../EventBus.js';

export default class QuestionBlock extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, content = 'coin') {
        super(scene, x, y, 'tiles', 2); // frame 2 = question block
        scene.add.existing(this);
        scene.physics.add.existing(this, true); // static body

        this.setImmovable(true);
        this.content = content;
        this.used = false;

        // Create animation for question block
        if (!scene.anims.exists('question-block-anim')) {
            scene.anims.create({
                key: 'question-block-anim',
                frames: scene.anims.generateFrameNumbers('tiles', { start: 2, end: 4 }),
                frameRate: 8,
                repeat: -1
            });
        }

        this.play('question-block-anim');
    }

    hit(mario, scene) {
        if (this.used) return;

        this.used = true;
        this.stop(); // stop animation
        this.setFrame(4); // used block frame

        // Bump tween
        scene.tweens.add({
            targets: this,
            y: this.y - 8,
            duration: 100,
            yoyo: true,
            onComplete: () => {
                this.spawnContent(mario, scene);
            }
        });

        // Emit score update for block hit
        EventBus.emit(EVENTS.SCORE_UPDATE, 0);
    }

    spawnContent(mario, scene) {
        const spawnX = this.x;
        const spawnY = this.y - 16;

        switch (this.content) {
            case 'coin':
                this.spawnCoin(spawnX, spawnY, scene);
                break;
            case 'mushroom':
                this.spawnPowerup('mushroom', spawnX, spawnY, scene);
                break;
            case 'fire_flower':
                this.spawnPowerup('fire_flower', spawnX, spawnY, scene);
                break;
            case 'star':
                this.spawnPowerup('star', spawnX, spawnY, scene);
                break;
        }
    }

    spawnCoin(x, y, scene) {
        // Create floating coin text
        const coinText = scene.add.text(x, y, '+200', {
            fontSize: '10px',
            fill: '#FFD700',
            fontFamily: 'monospace'
        });

        scene.tweens.add({
            targets: coinText,
            y: y - 40,
            alpha: 0,
            duration: 800,
            onComplete: () => coinText.destroy()
        });

        // Emit coin and score events
        EventBus.emit(EVENTS.COINS_UPDATE);
        EventBus.emit(EVENTS.SCORE_UPDATE, 200);

        // Play coin sound
        scene.sound.play('coin');
    }

    spawnPowerup(type, x, y, scene) {
        const powerup = new PowerupItem(scene, x, y, type);
        scene.items.add(powerup);
    }
}

// Import PowerupItem for spawnPowerup method
import PowerupItem from './PowerupItem.js';