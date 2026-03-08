export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  create() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Eila — detailed princess character (60x85 texture)
    g.clear();

    // Dress (purple trapezoid shape)
    g.fillStyle(0x9B59B6);
    g.fillTriangle(10, 35, 50, 35, 55, 80);
    g.fillTriangle(10, 35, 5, 80, 55, 80);
    g.fillRect(15, 25, 30, 15); // bodice

    // Skin — arms
    g.fillStyle(0xC8A97C);
    g.fillRect(5, 28, 10, 18);   // left arm
    g.fillRect(45, 28, 10, 18);  // right arm

    // Head
    g.fillStyle(0xC8A97C);
    g.fillCircle(30, 18, 16);

    // Dark curly hair (multiple dark brown circles)
    g.fillStyle(0x3B1F0A);
    g.fillCircle(16, 12, 9);   // left side
    g.fillCircle(30, 6, 9);    // top
    g.fillCircle(44, 12, 9);   // right side
    g.fillCircle(14, 22, 7);   // lower left curl
    g.fillCircle(46, 22, 7);   // lower right curl

    // Face — re-draw skin over hair overlap on face center
    g.fillStyle(0xC8A97C);
    g.fillCircle(30, 18, 13);

    // Eyes
    g.fillStyle(0x2C1810);
    g.fillCircle(25, 16, 2.5);
    g.fillCircle(35, 16, 2.5);

    // Smile
    g.fillStyle(0xE07050);
    g.fillRect(26, 22, 8, 2);

    // Crown (gold)
    g.fillStyle(0xFFD700);
    g.fillRect(18, 1, 24, 7);
    // Crown points
    g.fillTriangle(18, 8, 22, 1, 26, 8);
    g.fillTriangle(26, 8, 30, 1, 34, 8);
    g.fillTriangle(34, 8, 38, 1, 42, 8);
    // Crown gems
    g.fillStyle(0xFF1493);
    g.fillCircle(22, 5, 2);
    g.fillCircle(30, 3, 2);
    g.fillCircle(38, 5, 2);

    g.generateTexture('eilaSprite', 60, 85);

    // FROG obstacle (40x36)
    g.clear();
    g.fillStyle(0x2ECC40);
    g.fillEllipse(20, 22, 38, 28);        // body
    g.fillStyle(0x27AE60);
    g.fillCircle(8, 10, 10);              // left eye bump
    g.fillCircle(32, 10, 10);             // right eye bump
    g.fillStyle(0xffffff);
    g.fillCircle(8, 10, 6);
    g.fillCircle(32, 10, 6);
    g.fillStyle(0x000000);
    g.fillCircle(8, 10, 3);
    g.fillCircle(32, 10, 3);
    // Legs
    g.fillStyle(0x2ECC40);
    g.fillRect(0, 28, 12, 8);
    g.fillRect(28, 28, 12, 8);
    g.generateTexture('obstFrog', 40, 36);

    // HEDGEHOG obstacle (44x30)
    g.clear();
    g.fillStyle(0x8B4513);
    g.fillEllipse(22, 20, 40, 24);        // body
    // Spikes
    g.fillStyle(0x5D2E0C);
    for (let si = 0; si < 7; si++) {
      const sx = 6 + si * 5;
      g.fillTriangle(sx, 14, sx + 4, 14, sx + 2, 4);
    }
    // Face
    g.fillStyle(0xC8A97C);
    g.fillCircle(34, 20, 10);
    g.fillStyle(0x000000);
    g.fillCircle(37, 18, 2);
    g.fillStyle(0xFF6B6B);
    g.fillEllipse(36, 23, 8, 5);
    g.generateTexture('obstHedgehog', 44, 30);

    // KNIGHT obstacle (38x54)
    g.clear();
    g.fillStyle(0x808080);
    g.fillRect(8, 18, 20, 28);            // body armour
    g.fillRect(4, 22, 8, 20);             // left arm
    g.fillRect(24, 22, 8, 20);            // right arm
    g.fillRect(10, 44, 6, 10);            // left leg
    g.fillRect(20, 44, 6, 10);            // right leg
    // Helmet
    g.fillStyle(0x696969);
    g.fillRect(8, 6, 20, 16);
    g.fillStyle(0xFFD700);
    g.fillRect(10, 12, 16, 4);            // visor slot
    // Shield
    g.fillStyle(0xB22222);
    g.fillRect(26, 20, 10, 16);
    g.fillStyle(0xFFD700);
    g.fillRect(28, 24, 6, 8);
    g.generateTexture('obstKnight', 38, 54);

    // GUMDROP obstacle (34x44)
    g.clear();
    g.fillStyle(0xFF1493);
    g.fillCircle(17, 17, 17);             // round top
    g.fillStyle(0xFF69B4);
    g.fillRect(10, 17, 14, 22);           // stick
    g.fillStyle(0xffffff);
    g.fillCircle(11, 11, 4);              // shine
    g.generateTexture('obstGumdrop', 34, 44);

    // DRAGON obstacle (58x50)
    g.clear();
    g.fillStyle(0xCC2200);
    g.fillEllipse(27, 30, 46, 36);        // body
    // Head
    g.fillStyle(0xFF3300);
    g.fillEllipse(42, 16, 24, 18);
    // Eye
    g.fillStyle(0xFFFF00);
    g.fillCircle(48, 13, 4);
    g.fillStyle(0x000000);
    g.fillCircle(49, 13, 2);
    // Horn
    g.fillStyle(0xFFD700);
    g.fillTriangle(44, 6, 48, 6, 46, 0);
    // Wing
    g.fillStyle(0x990000);
    g.fillTriangle(10, 10, 30, 28, 5, 34);
    // Fire breath
    g.fillStyle(0xFF6600);
    g.fillEllipse(54, 16, 14, 8);
    g.fillStyle(0xFFCC00);
    g.fillEllipse(56, 16, 8, 5);
    g.generateTexture('obstDragon', 58, 50);

    // CROWN collectible (28x22)
    g.clear();
    g.fillStyle(0xFFD700);
    g.fillRect(2, 8, 24, 12);             // base
    g.fillTriangle(2, 20, 6, 8, 10, 20);  // left point
    g.fillTriangle(10, 20, 14, 6, 18, 20); // center point
    g.fillTriangle(18, 20, 22, 8, 26, 20); // right point
    g.fillStyle(0xFF1493);
    g.fillCircle(6, 12, 2);
    g.fillCircle(14, 9, 2);
    g.fillCircle(22, 12, 2);
    g.generateTexture('crownCollect', 28, 22);

    // Ground tile — grass strip
    g.clear();
    g.fillStyle(0x5D8A3C);
    g.fillRect(0, 0, 32, 12);             // grass top
    g.fillStyle(0x8B6914);
    g.fillRect(0, 12, 32, 58);            // dirt
    g.generateTexture('groundRect', 32, 70);

    g.destroy();
    this.scene.start('MenuScene');
  }
}
