import { PLAYER_NAME } from '../levels/levelConfig.js';

export class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const { width, height } = this.scale;

    // Background gradient rectangle
    this.add.rectangle(width / 2, height / 2, width, height, 0x2d0050);

    // Sparkle particles (simple circles)
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(20, width - 20);
      const y = Phaser.Math.Between(20, height - 20);
      const star = this.add.circle(x, y, Phaser.Math.Between(2, 5), 0xFFD700, 0.8);
      this.tweens.add({
        targets: star, alpha: 0, duration: Phaser.Math.Between(800, 2000),
        yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 1000),
      });
    }

    // Crown icon (placeholder circle)
    this.add.circle(width / 2, 140, 50, 0xFFD700);
    this.add.text(width / 2, 133, '👑', { fontSize: '48px' }).setOrigin(0.5);

    // Title
    this.add.text(width / 2, 230, "Eila's", {
      fontSize: '36px', fill: '#FFD700', fontStyle: 'bold',
      stroke: '#6600aa', strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(width / 2, 275, 'Enchanting Adventure', {
      fontSize: '24px', fill: '#ffffff',
      stroke: '#6600aa', strokeThickness: 3,
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, 340, `Made just for ${PLAYER_NAME} 👑`, {
      fontSize: '16px', fill: '#FFB6C1',
    }).setOrigin(0.5);

    // Tap to start
    const tapText = this.add.text(width / 2, 450, 'Tap to Begin!', {
      fontSize: '26px', fill: '#ffffff',
      stroke: '#aa00ff', strokeThickness: 3,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: tapText, alpha: 0.2, duration: 700, yoyo: true, repeat: -1,
    });

    this.input.once('pointerdown', () => {
      this.scene.start('LevelSelectScene');
    });
  }
}
