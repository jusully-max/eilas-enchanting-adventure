import { LEVELS } from '../levels/levelConfig.js';

export class LevelSelectScene extends Phaser.Scene {
  constructor() { super('LevelSelectScene'); }

  create() {
    const { width, height } = this.scale;
    const progress = JSON.parse(localStorage.getItem('eila_progress') || '{}');

    this.add.rectangle(width / 2, height / 2, width, height, 0x2d0050);

    this.add.text(width / 2, 50, 'Choose Your Adventure!', {
      fontSize: '22px', fill: '#FFD700', stroke: '#6600aa', strokeThickness: 3,
    }).setOrigin(0.5);

    LEVELS.forEach((level, i) => {
      const row = Math.floor(i / 2);
      const col = i % 2;
      const x = col === 0 ? width * 0.28 : width * 0.72;
      const y = 160 + row * 140;
      const unlocked = i === 0 || progress[`level_${i}`] === 'complete';

      // Door background
      const door = this.add.rectangle(x, y, 130, 110,
        unlocked ? 0x8B4513 : 0x444444).setInteractive();

      // Door frame
      this.add.rectangle(x, y, 130, 110, 0x000000, 0).setStrokeStyle(3,
        unlocked ? 0xFFD700 : 0x666666);

      // Level number
      this.add.text(x, y - 20, `${level.id}`, {
        fontSize: '32px', fill: unlocked ? '#FFD700' : '#888888', fontStyle: 'bold',
      }).setOrigin(0.5);

      // Level name
      this.add.text(x, y + 18, level.name, {
        fontSize: '10px', fill: unlocked ? '#ffffff' : '#666666', wordWrap: { width: 120 },
      }).setOrigin(0.5);

      // Stars
      const stars = progress[`stars_${level.id}`] || 0;
      this.add.text(x, y + 42, '⭐'.repeat(stars) + '☆'.repeat(3 - stars), {
        fontSize: '14px',
      }).setOrigin(0.5);

      if (unlocked) {
        door.on('pointerdown', () => {
          this.scene.start('GameScene', { levelIndex: i });
        });
        this.tweens.add({
          targets: door, scaleX: 1.05, scaleY: 1.05,
          duration: 600, yoyo: true, repeat: -1,
        });
      }
    });

    // Back button
    const back = this.add.text(width / 2, height - 40, '← Back', {
      fontSize: '18px', fill: '#aaaaaa',
    }).setOrigin(0.5).setInteractive();
    back.on('pointerdown', () => this.scene.start('MenuScene'));
  }
}
