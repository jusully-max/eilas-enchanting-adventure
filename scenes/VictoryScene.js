import { PLAYER_NAME } from '../levels/levelConfig.js';

export class VictoryScene extends Phaser.Scene {
  constructor() { super('VictoryScene'); }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x1a0030);

    // Confetti rain
    for (let i = 0; i < 40; i++) {
      const colors = ['#FFD700', '#FF69B4', '#9B59B6', '#00BFFF', '#FF4500'];
      const color = colors[i % colors.length];
      const piece = this.add.rectangle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(-height, 0),
        8, 14,
        Phaser.Display.Color.HexStringToColor(color).color
      );
      this.tweens.add({
        targets: piece,
        y: height + 20,
        x: piece.x + Phaser.Math.Between(-60, 60),
        duration: Phaser.Math.Between(2000, 4000),
        delay: Phaser.Math.Between(0, 2000),
        repeat: -1,
      });
    }

    // Crown builds up piece by piece
    const crownParts = ['👑', '💎', '⭐', '✨', '🌟'];
    crownParts.forEach((part, i) => {
      const t = this.add.text(
        width / 2 + (i - 2) * 44, 100, part, { fontSize: '40px' }
      ).setOrigin(0.5).setAlpha(0);
      this.tweens.add({
        targets: t, alpha: 1, scaleX: 1.4, scaleY: 1.4,
        duration: 400, delay: 300 + i * 250, ease: 'Back.Out',
        onComplete: () => {
          this.tweens.add({ targets: t, scaleX: 1, scaleY: 1, duration: 200 });
        },
      });
    });

    // "You did it," line
    this.time.delayedCall(1800, () => {
      const didIt = this.add.text(width / 2, 210, 'You did it,', {
        fontSize: '28px', fill: '#FFB6C1',
      }).setOrigin(0.5).setAlpha(0);
      this.tweens.add({ targets: didIt, alpha: 1, duration: 400 });
    });

    // Player name with crown
    this.time.delayedCall(2200, () => {
      const nameText = this.add.text(width / 2, 265, PLAYER_NAME + '! 👑', {
        fontSize: '52px', fill: '#FFD700',
        stroke: '#aa00ff', strokeThickness: 5, fontStyle: 'bold',
      }).setOrigin(0.5).setScale(0);
      this.tweens.add({
        targets: nameText, scaleX: 1, scaleY: 1, duration: 500, ease: 'Back.Out',
      });
    });

    // Champion message
    this.time.delayedCall(2900, () => {
      const line1 = this.add.text(width / 2, 345, "You're the Champion of", {
        fontSize: '18px', fill: '#ffffff',
      }).setOrigin(0.5).setAlpha(0);

      const line2 = this.add.text(width / 2, 375, 'the Enchanted Kingdom!', {
        fontSize: '18px', fill: '#ffffff',
      }).setOrigin(0.5).setAlpha(0);

      this.tweens.add({ targets: [line1, line2], alpha: 1, duration: 500 });
    });

    // Birthday message — big, festive, final reveal
    this.time.delayedCall(3600, () => {
      const bday = this.add.text(width / 2, 440, '🎂 Happy 6th Birthday Eila!!! 🎂', {
        fontSize: '22px', fill: '#FFD700',
        stroke: '#aa00ff', strokeThickness: 4,
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: width - 40 },
      }).setOrigin(0.5).setScale(0);
      this.tweens.add({
        targets: bday, scaleX: 1, scaleY: 1, duration: 600, ease: 'Back.Out',
      });

      // Pulse the birthday text
      this.time.delayedCall(700, () => {
        this.tweens.add({
          targets: bday, scaleX: 1.08, scaleY: 1.08,
          duration: 500, yoyo: true, repeat: -1,
        });
      });
    });

    // Play Again button
    this.time.delayedCall(4500, () => {
      const btn = this.add.text(width / 2, 540, '🎮 Play Again', {
        fontSize: '22px', fill: '#ffffff',
        backgroundColor: '#6600aa', padding: { x: 20, y: 10 },
      }).setOrigin(0.5).setInteractive().setAlpha(0);
      this.tweens.add({ targets: btn, alpha: 1, duration: 400 });
      btn.on('pointerdown', () => {
        localStorage.removeItem('eila_progress');
        this.scene.start('MenuScene');
      });
    });
  }
}
