import { GAME_WIDTH, GAME_HEIGHT, SCENES, EVENTS, DEPTHS } from '../constants.js';
import EventBus from '../EventBus.js';
import InputManager from '../input/InputManager.js';
import Mario from '../entities/Mario.js';
import Goomba from '../entities/Goomba.js';
import Koopa from '../entities/Koopa.js';
import QuestionBlock from '../entities/QuestionBlock.js';
import PowerupItem from '../entities/PowerupItem.js';
import Fireball from '../entities/Fireball.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.GAME });
        this.timer = 400; // 400 seconds countdown
        this.timerEvent = null;
        this.lives = 3;
        this.score = 0;
        this.coins = 0;
        this.inputManager = null;
    }

    create() {
        // 1. Load tilemap
        const map = this.make.tilemap({ key: 'world1-1' });
        const tileset = map.addTilesetImage('tiles', 'tiles');

        // Create layers
        const groundLayer = map.createLayer('ground', tileset, 0, 0);
        const platformLayer = map.createLayer('platforms', tileset, 0, 0);

        // Set collision
        groundLayer.setCollisionByExclusion([-1]);
        platformLayer.setCollisionByExclusion([-1]);

        // Set depths
        groundLayer.setDepth(DEPTHS.TILES);
        platformLayer.setDepth(DEPTHS.TILES);

        // 2. Set world bounds
        this.physics.world.setBounds(0, 0, map.widthInPixels, GAME_HEIGHT);

        // 3. Spawn Mario at spawn point
        const marioSpawn = map.findObject('objects', obj => obj.name === 'mario_spawn');
        this.mario = new Mario(this, marioSpawn.x, marioSpawn.y);
        this.add.existing(this.mario);
        this.physics.add.existing(this.mario);

        // Mario colliders
        this.physics.add.collider(this.mario, groundLayer);
        this.physics.add.collider(this.mario, platformLayer);

        // 4. Camera setup
        this.cameras.main.setBounds(0, 0, map.widthInPixels, GAME_HEIGHT);
        this.cameras.main.startFollow(this.mario, true, 0.1, 1);

        // 5. Create enemy groups
        this.enemies = this.physics.add.group();
        this.spawnEnemies(map);

        // Enemy colliders
        this.physics.add.collider(this.enemies, groundLayer);
        this.physics.add.collider(this.enemies, platformLayer);

        // 6. Create question blocks group
        this.questionBlocks = this.physics.add.staticGroup();
        this.spawnQuestionBlocks(map, platformLayer);

        // 7. Create items group
        this.items = this.physics.add.group();

        // 8. Fireballs group
        this.fireballs = this.physics.add.group();

        // 9. Set up overlaps
        this.setupOverlaps();

        // 10. Start timer
        this.startTimer();

        // 11. Initialize input manager
        this.inputManager = new InputManager(this);

        // 12. Listen for lives updates
        EventBus.on(EVENTS.LIVES_UPDATE, this.onLivesUpdate, this);
        EventBus.on(EVENTS.SCORE_UPDATE, this.onScoreUpdate, this);
        EventBus.on(EVENTS.COINS_UPDATE, this.onCoinsUpdate, this);
    }

    spawnEnemies(map) {
        const enemyObjects = map.getObjectLayer('objects').objects;

        enemyObjects.forEach(obj => {
            if (obj.name === 'goomba') {
                const goomba = new Goomba(this, obj.x, obj.y);
                this.enemies.add(goomba);
            } else if (obj.name === 'koopa') {
                const koopa = new Koopa(this, obj.x, obj.y);
                this.enemies.add(koopa);
            }
        });
    }

    spawnQuestionBlocks(map, platformLayer) {
        // Get tile positions for question blocks (tile ID 3)
        platformLayer.forEachTile(tile => {
            if (tile.index === 3) {
                const block = new QuestionBlock(this, tile.getCenterX(), tile.getCenterY(), 'coin');
                this.questionBlocks.add(block);
            }
        });
    }

    setupOverlaps() {
        // Mario vs enemies
        this.physics.add.overlap(this.mario, this.enemies, (mario, enemy) => {
            if (mario.body.velocity.y > 0 && mario.y < enemy.y) {
                // Mario stomps enemy from above
                if (enemy.squish) enemy.squish();
                if (enemy.stomp) enemy.stomp();

                // Mario bounces
                mario.setVelocityY(-350);
                this.sound.play('stomp');
            } else {
                // Mario takes damage
                mario.takeDamage();
            }
        });

        // Mario vs question blocks (from below)
        this.physics.add.overlap(this.mario, this.questionBlocks, (mario, block) => {
            if (mario.body.velocity.y < 0) {
                block.hit(mario, this);
            }
        });

        // Mario vs items
        this.physics.add.overlap(this.mario, this.items, (mario, item) => {
            if (item.collect) {
                item.collect(mario);
            }
        });

        // Fireballs vs enemies
        this.physics.add.overlap(this.fireballs, this.enemies, (fireball, enemy) => {
            fireball.hitEnemy(enemy);
        });

        // Fireballs vs world bounds
        this.physics.world.on('worldbounds', (body) => {
            if (body.gameObject instanceof Fireball) {
                body.gameObject.destroy();
            }
        });
    }

    startTimer() {
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timer--;
                EventBus.emit(EVENTS.TIMER_UPDATE, this.timer);

                if (this.timer <= 0) {
                    this.mario.die();
                }
            },
            loop: true
        });
    }

    onLivesUpdate() {
        this.lives--;
        if (this.lives <= 0) {
            EventBus.emit(EVENTS.GAME_OVER, this.score);
            this.scene.start(SCENES.GAMEOVER, { score: this.score });
        }
    }

    onScoreUpdate(points) {
        this.score += points;
    }

    onCoinsUpdate() {
        this.coins++;
    }

    update() {
        // Update input manager
        if (this.inputManager) {
            this.inputManager.update();
        }

        // Update Mario
        if (this.mario && !this.mario._isDead) {
            this.mario.update(this.inputManager ? this.inputManager.state : this.input.keyboard.createCursorKeys());
        }

        // Update enemies
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.update) enemy.update();
        });

        // Update items
        this.items.getChildren().forEach(item => {
            if (item.update) item.update();
        });

        // Update fireballs
        this.fireballs.getChildren().forEach(fireball => {
            if (fireball.update) fireball.update();
        });

        // Check for pit death
        if (this.mario && this.mario.y > GAME_HEIGHT + 100) {
            this.mario.die();
        }

        // Check for fire key press (from InputManager or keyboard)
        const firePressed = this.inputManager ? this.inputManager.state.fire :
                           Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('Z'));

        if (firePressed) {
            if (this.mario && this.mario._state === 'fire' && !this.mario._isDead) {
                const direction = this.mario.flipX ? -1 : 1;
                const fireball = new Fireball(this, this.mario.x + (direction * 16), this.mario.y, direction);
                this.fireballs.add(fireball);
            }
        }
    }

    playFlagpoleSequence() {
        // Stop timer
        if (this.timerEvent) {
            this.timerEvent.remove();
        }

        // Play flagpole sound
        this.sound.play('flagpole');

        // Slide Mario down flag
        this.tweens.add({
            targets: this.mario,
            y: GAME_HEIGHT - 32,
            duration: 2000,
            onComplete: () => {
                // Wait 2 seconds
                this.time.delayedCall(2000, () => {
                    EventBus.emit(EVENTS.LEVEL_COMPLETE, {
                        score: this.score,
                        timeBonus: this.timer * 50
                    });
                    this.scene.start(SCENES.LEVEL_COMPLETE, {
                        score: this.score,
                        timeBonus: this.timer * 50
                    });
                });
            }
        });
    }

    shutdown() {
        // Clean up event listeners
        EventBus.off(EVENTS.LIVES_UPDATE, this.onLivesUpdate, this);
        EventBus.off(EVENTS.SCORE_UPDATE, this.onScoreUpdate, this);
        EventBus.off(EVENTS.COINS_UPDATE, this.onCoinsUpdate, this);

        // Clean up input manager
        if (this.inputManager) {
            this.inputManager.destroy();
            this.inputManager = null;
        }
    }
}