import { LEVELS } from '../levels/levelConfig.js';

export class WinScene extends Phaser.Scene {
  constructor() { super('WinScene'); }

  init(data) {
    this.levelIndex = data.levelIndex;
    this.stars = data.stars;
    this.isLastLevel = data.isLastLevel;
    this.score = data.score || 0;
  }

  create() {
    const { width, height } = this.scale;
    const level = LEVELS[this.levelIndex];

    this.add.rectangle(width / 2, height / 2, width, height, 0x2d0050);

    this.add.text(width / 2, 120, '✨ Level Complete! ✨', {
      fontSize: '28px', fill: '#FFD700', stroke: '#6600aa', strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(width / 2, 180, level.name, {
      fontSize: '20px', fill: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(width / 2, 215, '👑 Crowns collected: ' + this.score, {
      fontSize: '16px', fill: '#FFD700',
    }).setOrigin(0.5);

    // Animate stars appearing one by one
    for (let i = 0; i < 3; i++) {
      const x = width / 2 + (i - 1) * 70;
      const t = this.add.text(x, 280, i < this.stars ? '⭐' : '☆', {
        fontSize: '52px',
      }).setOrigin(0.5).setScale(0);
      this.tweens.add({
        targets: t, scaleX: 1, scaleY: 1, duration: 300,
        delay: 400 + i * 300, ease: 'Back.Out',
      });
    }

    // Sparkle effect
    for (let i = 0; i < 15; i++) {
      const sp = this.add.text(
        Phaser.Math.Between(20, width - 20),
        Phaser.Math.Between(60, height - 60),
        '✨', { fontSize: '20px' }
      ).setAlpha(0);
      this.tweens.add({
        targets: sp, alpha: 1, duration: 300,
        delay: Phaser.Math.Between(200, 1200), yoyo: true,
      });
    }

    // Buttons
    if (!this.isLastLevel) {
      const next = this.add.text(width / 2, 440, 'Next Level ➡️', {
        fontSize: '26px', fill: '#ffffff',
        backgroundColor: '#6600aa', padding: { x: 20, y: 10 },
      }).setOrigin(0.5).setInteractive();
      next.on('pointerdown', () => {
        this.scene.start('GameScene', { levelIndex: this.levelIndex + 1 });
      });
    } else {
      const victory = this.add.text(width / 2, 440, '👑 Final Victory! 👑', {
        fontSize: '24px', fill: '#FFD700',
        backgroundColor: '#6600aa', padding: { x: 20, y: 10 },
      }).setOrigin(0.5).setInteractive();
      victory.on('pointerdown', () => {
        this.scene.start('VictoryScene');
      });
    }

    const menu = this.add.text(width / 2, 530, 'Level Select', {
      fontSize: '18px', fill: '#aaaaaa',
    }).setOrigin(0.5).setInteractive();
    menu.on('pointerdown', () => this.scene.start('LevelSelectScene'));
  }
}
