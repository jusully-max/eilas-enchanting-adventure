export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  create() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Ground tile (32x70 green)
    g.fillStyle(0x4CAF50);
    g.fillRect(0, 0, 32, 70);
    g.generateTexture('groundRect', 32, 70);

    // Eila placeholder: light brown head, purple body, gold crown
    g.clear();
    g.fillStyle(0x9B59B6);
    g.fillRect(5, 15, 20, 35);   // body (purple dress)
    g.fillStyle(0xC8A97C);
    g.fillCircle(15, 10, 12);    // head (light brown)
    g.fillStyle(0x222222);
    g.fillCircle(11, 7, 3);      // hair curl left
    g.fillCircle(15, 5, 3.5);    // hair curl top
    g.fillCircle(19, 7, 3);      // hair curl right
    g.fillStyle(0xFFD700);
    g.fillRect(8, 0, 14, 6);     // crown
    g.generateTexture('eilaSprite', 30, 55);

    g.destroy();
    this.scene.start('MenuScene');
  }
}
