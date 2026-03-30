import { GAME_WIDTH, SCENES, EVENTS, COLORS } from '../constants.js';
import EventBus from '../EventBus.js';

export default class HUDScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.HUD });
        this.score = 0;
        this.coins = 0;
        this.lives = 3;
        this.timer = 400;
    }

    create() {
        // Create dark overlay bar at top
        const graphics = this.add.graphics();
        graphics.fillStyle(parseInt(COLORS.BG.slice(1), 16), 0.9);
        graphics.fillRect(0, 0, GAME_WIDTH, 28);
        graphics.setScrollFactor(0);

        // Axiom logo
        this.add.text(8, 8, 'AXIOM', {
            fontSize: '10px',
            fill: COLORS.ACCENT,
            fontFamily: 'monospace',
            fontWeight: 'bold'
        }).setScrollFactor(0);

        // MARIO label
        this.add.text(8, 20, 'MARIO', {
            fontSize: '8px',
            fill: COLORS.TEXT,
            fontFamily: 'monospace'
        }).setScrollFactor(0);

        // Score label
        this.add.text(180, 2, 'SCORE', {
            fontSize: '8px',
            fill: COLORS.TEXT,
            fontFamily: 'monospace'
        }).setScrollFactor(0);

        // Score text (right-aligned)
        this.scoreText = this.add.text(180, 8, '000000', {
            fontSize: '10px',
            fill: COLORS.TEXT,
            fontFamily: 'monospace'
        }).setScrollFactor(0);
        this.scoreText.setOrigin(1, 0); // right align

        // Coin icon and text
        this.add.image(GAME_WIDTH / 2 - 20, 14, 'hud-icons', 0).setScrollFactor(0);
        this.coinsText = this.add.text(GAME_WIDTH / 2 - 8, 8, '×00', {
            fontSize: '10px',
            fill: COLORS.TEXT,
            fontFamily: 'monospace'
        }).setScrollFactor(0);

        // WORLD label
        this.add.text(GAME_WIDTH / 2 + 60, 2, 'WORLD', {
            fontSize: '8px',
            fill: COLORS.TEXT,
            fontFamily: 'monospace'
        }).setScrollFactor(0);
        this.add.text(GAME_WIDTH / 2 + 60, 8, '1-1', {
            fontSize: '10px',
            fill: COLORS.TEXT,
            fontFamily: 'monospace'
        }).setScrollFactor(0);

        // TIME label
        this.add.text(GAME_WIDTH - 80, 2, 'TIME', {
            fontSize: '8px',
            fill: COLORS.TEXT,
            fontFamily: 'monospace'
        }).setScrollFactor(0);
        this.timerText = this.add.text(GAME_WIDTH - 80, 8, '400', {
            fontSize: '10px',
            fill: COLORS.TEXT,
            fontFamily: 'monospace'
        }).setScrollFactor(0);

        // Lives display
        this.add.image(8, 22, 'hud-icons', 1).setScrollFactor(0);
        this.livesText = this.add.text(20, 18, '×3', {
            fontSize: '10px',
            fill: COLORS.TEXT,
            fontFamily: 'monospace'
        }).setScrollFactor(0);

        // Subscribe to EventBus events
        EventBus.on(EVENTS.SCORE_UPDATE, this.onScoreUpdate, this);
        EventBus.on(EVENTS.COINS_UPDATE, this.onCoinsUpdate, this);
        EventBus.on(EVENTS.LIVES_UPDATE, this.onLivesUpdate, this);
        EventBus.on(EVENTS.TIMER_UPDATE, this.onTimerUpdate, this);
    }

    onScoreUpdate(points) {
        this.score += points;
        const scoreStr = this.score.toString().padStart(6, '0');
        this.scoreText.setText(scoreStr);

        // Score pop animation
        this.tweens.add({
            targets: this.scoreText,
            scale: 1.2,
            duration: 100,
            yoyo: true
        });
    }

    onCoinsUpdate() {
        this.coins++;
        const coinsStr = this.coins.toString().padStart(2, '0');
        this.coinsText.setText(`×${coinsStr}`);
    }

    onLivesUpdate() {
        this.lives--;
        this.livesText.setText(`×${this.lives}`);
    }

    onTimerUpdate(timer) {
        this.timer = timer;
        this.timerText.setText(timer.toString());

        // Red warning when timer <= 100
        if (timer <= 100) {
            this.timerText.setFill('#E52222');
        } else {
            this.timerText.setFill(COLORS.TEXT);
        }
    }

    shutdown() {
        // Remove all EventBus listeners
        EventBus.off(EVENTS.SCORE_UPDATE, this.onScoreUpdate, this);
        EventBus.off(EVENTS.COINS_UPDATE, this.onCoinsUpdate, this);
        EventBus.off(EVENTS.LIVES_UPDATE, this.onLivesUpdate, this);
        EventBus.off(EVENTS.TIMER_UPDATE, this.onTimerUpdate, this);
    }
}