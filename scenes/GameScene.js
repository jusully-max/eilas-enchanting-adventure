import { LEVELS, GROUND_Y } from '../levels/levelConfig.js';

export class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  init(data) {
    this.levelIndex = data.levelIndex || 0;
    this.level = LEVELS[this.levelIndex] || LEVELS[0];
    this.hearts = 3;
    this.canDoubleJump = false;
    this.hasDoubleJumped = false;
    this.invincible = false;
    this.gameOver = false;
    this.obstacles = [];
    this.nextObstacleTime = 0;
    this.finishLineDistance = 4000;
    this.distanceTravelled = 0;
    this.finishSpawned = false;
    this.finishLine = null;
    this.crowns = [];
    this.nextCrownTime = 1500;
    this.score = 0;
  }

  create() {
    const { width, height } = this.scale;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height,
      Phaser.Display.Color.HexStringToColor(this.level.background).color);

    // Background decorations (level-specific)
    this.createBackgroundDecor();

    // Scrolling ground
    this.groundTiles = this.add.tileSprite(
      width / 2, GROUND_Y + 35, width, 70, 'groundRect'
    );

    // Ground physics body (static)
    this.ground = this.physics.add.staticGroup();
    const groundBlock = this.ground.create(width / 2, GROUND_Y + 35, 'groundRect');
    groundBlock.setScale(width / 32, 1).refreshBody();

    // Eila sprite — origin bottom-center so she sits exactly on GROUND_Y
    this.eila = this.physics.add.sprite(80, GROUND_Y, 'eilaSprite');
    this.eila.setOrigin(0.5, 1);
    this.eila.setCollideWorldBounds(true);

    this.physics.add.collider(this.eila, this.ground);

    // HUD
    this.createHUD();

    // Input
    this.input.on('pointerdown', this.handleTap, this);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Obstacle group — used for overlap detection with Eila
    this.obstacleGroup = this.physics.add.group();
    this.physics.add.overlap(this.eila, this.obstacleGroup, this.hitObstacle, null, this);
  }

  createBackgroundDecor() {
    const { width, height } = this.scale;
    const lvl = this.levelIndex;

    // Clouds (all levels)
    for (let i = 0; i < 4; i++) {
      const cx = Phaser.Math.Between(40, width - 40);
      const cy = Phaser.Math.Between(40, 180);
      const cloud = this.add.ellipse(cx, cy, Phaser.Math.Between(70, 120), 35, 0xffffff, 0.7);
      this.add.ellipse(cx - 22, cy + 8, 55, 28, 0xffffff, 0.6);
      this.add.ellipse(cx + 22, cy + 8, 55, 28, 0xffffff, 0.6);
      this.tweens.add({ targets: cloud, x: cx - width - 200, duration: Phaser.Math.Between(18000, 28000), repeat: -1, onRepeat: () => { cloud.x = width + 100; } });
    }

    if (lvl === 0) {
      // Royal Garden: sun, butterflies, flowers
      this.add.circle(340, 60, 28, 0xFFD700);
      // Sun rays
      for (let r = 0; r < 8; r++) {
        const angle = (r / 8) * Math.PI * 2;
        const rx = 340 + Math.cos(angle) * 42;
        const ry = 60 + Math.sin(angle) * 42;
        this.add.line(0, 0, 340, 60, rx, ry, 0xFFD700, 0.4).setOrigin(0);
      }
      // Flower bushes
      for (let i = 0; i < 10; i++) {
        const fx = 15 + i * 40;
        this.add.rectangle(fx, GROUND_Y + 2, 3, 16, 0x2ECC40); // stem
        const petalColor = [0xFF69B4, 0xFF1493, 0xFF6347, 0xFFD700, 0xDA70D6][i % 5];
        this.add.circle(fx, GROUND_Y - 10, 8, petalColor);
        this.add.circle(fx, GROUND_Y - 10, 4, 0xFFFF00); // center
      }
      // Butterflies
      for (let b = 0; b < 3; b++) {
        const bx = 60 + b * 120;
        const by = Phaser.Math.Between(200, 400);
        const bfly = this.add.triangle(bx, by, -8, 0, 0, -6, 8, 0, [0xFF69B4, 0x87CEEB, 0xFFD700][b]);
        this.tweens.add({ targets: bfly, y: by - 30, duration: 1200 + b * 300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      }

    } else if (lvl === 1) {
      // Enchanted Forest: layered trees, mushrooms, fireflies
      // Back trees (darker, larger)
      for (let i = 0; i < 7; i++) {
        const tx = 20 + i * 60;
        this.add.triangle(tx, GROUND_Y - 60, tx - 30, GROUND_Y - 10, tx + 30, GROUND_Y - 10, tx, GROUND_Y - 130, 0x1B6B1B, 0.6);
        this.add.rectangle(tx, GROUND_Y - 10, 12, 20, 0x4A2A0A, 0.6);
      }
      // Front trees (brighter, smaller)
      for (let i = 0; i < 5; i++) {
        const tx = 40 + i * 80;
        this.add.triangle(tx, GROUND_Y - 40, tx - 22, GROUND_Y, tx + 22, GROUND_Y, tx, GROUND_Y - 90, 0x27AE60);
        this.add.triangle(tx, GROUND_Y - 60, tx - 18, GROUND_Y - 30, tx + 18, GROUND_Y - 30, tx, GROUND_Y - 100, 0x2ECC40);
        this.add.rectangle(tx, GROUND_Y - 5, 10, 20, 0x7D5A3A);
      }
      // Mushrooms
      for (let m = 0; m < 4; m++) {
        const mx = 60 + m * 90;
        this.add.rectangle(mx, GROUND_Y - 2, 6, 12, 0xEEDDCC);
        this.add.ellipse(mx, GROUND_Y - 10, 18, 10, 0xFF3333);
        this.add.circle(mx - 4, GROUND_Y - 12, 2, 0xffffff);
        this.add.circle(mx + 3, GROUND_Y - 10, 2, 0xffffff);
      }
      // Fireflies
      for (let f = 0; f < 6; f++) {
        const fx = Phaser.Math.Between(30, width - 30);
        const fy = Phaser.Math.Between(200, GROUND_Y - 60);
        const firefly = this.add.circle(fx, fy, 3, 0xFFFF66);
        this.tweens.add({ targets: firefly, alpha: 0.2, duration: Phaser.Math.Between(600, 1200), yoyo: true, repeat: -1 });
        this.tweens.add({ targets: firefly, y: fy - 20, x: fx + Phaser.Math.Between(-15, 15), duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      }

    } else if (lvl === 2) {
      // Castle Courtyard: full castle with towers, windows, flags
      const castleX = width / 2;
      // Main wall
      this.add.rectangle(castleX, 220, 200, 180, 0x666666);
      // Left tower
      this.add.rectangle(castleX - 110, 180, 50, 260, 0x555555);
      this.add.triangle(castleX - 110, 45, castleX - 135, 60, castleX - 85, 60, castleX - 110, 20, 0x444444);
      // Right tower
      this.add.rectangle(castleX + 110, 180, 50, 260, 0x555555);
      this.add.triangle(castleX + 110, 45, castleX + 85, 60, castleX + 135, 60, castleX + 110, 20, 0x444444);
      // Battlements on main wall
      for (let i = 0; i < 6; i++) {
        this.add.rectangle(castleX - 75 + i * 30, 125, 20, 16, 0x777777);
      }
      // Gate
      this.add.rectangle(castleX, 280, 50, 60, 0x2A1500);
      this.add.ellipse(castleX, 250, 50, 30, 0x2A1500);
      // Windows
      for (let w = 0; w < 3; w++) {
        this.add.rectangle(castleX - 50 + w * 50, 200, 16, 24, 0x3A3A1A);
        this.add.ellipse(castleX - 50 + w * 50, 188, 16, 10, 0x3A3A1A);
      }
      // Flags on towers
      const flagL = this.add.triangle(castleX - 90, 30, 0, 0, 20, 5, 0, 10, 0xCC0000);
      const flagR = this.add.triangle(castleX + 130, 30, 0, 0, 20, 5, 0, 10, 0x0000CC);
      this.tweens.add({ targets: [flagL, flagR], scaleX: 0.8, duration: 500, yoyo: true, repeat: -1 });

    } else if (lvl === 3) {
      // Candy Kingdom: rainbow, unicorn, candy canes, lollipops
      // Rainbow arc
      const rainbowColors = [0xFF0000, 0xFF7700, 0xFFFF00, 0x00CC00, 0x0000FF, 0x8B00FF];
      for (let r = 0; r < 6; r++) {
        const radius = 180 - r * 12;
        const arc = this.add.circle(width / 2, 250, radius, rainbowColors[r], 0.3);
        // Mask top half only visible
        if (r > 0) {
          this.add.circle(width / 2, 250, radius - 12, Phaser.Display.Color.HexStringToColor(this.level.background).color, 0.3);
        }
      }
      // Lollipops
      for (let i = 0; i < 6; i++) {
        const lx = 25 + i * 65;
        this.add.rectangle(lx, GROUND_Y - 20, 5, 50, 0xffffff);
        const lolliColor = [0xFF1493, 0x00BFFF, 0xFFD700, 0xFF6347, 0x9B59B6, 0x2ECC40][i];
        this.add.circle(lx, GROUND_Y - 50, 16, lolliColor);
        this.add.circle(lx, GROUND_Y - 50, 8, 0xffffff, 0.5);
      }
      // Candy canes
      for (let c = 0; c < 3; c++) {
        const cx = 80 + c * 120;
        this.add.rectangle(cx, GROUND_Y - 30, 8, 60, 0xFF0000);
        this.add.rectangle(cx, GROUND_Y - 34, 8, 8, 0xffffff);
        this.add.rectangle(cx, GROUND_Y - 18, 8, 8, 0xffffff);
        this.add.rectangle(cx, GROUND_Y - 2, 8, 8, 0xffffff);
        this.add.ellipse(cx + 10, GROUND_Y - 60, 24, 16, 0xFF0000);
      }
      // Unicorn silhouette
      const ux = 300, uy = 160;
      this.add.ellipse(ux, uy, 50, 30, 0xffffff); // body
      this.add.ellipse(ux + 20, uy - 18, 20, 16, 0xffffff); // head
      this.add.triangle(ux + 24, uy - 38, ux + 20, uy - 26, ux + 28, uy - 26, ux + 24, uy - 44, 0xFFD700); // horn
      this.add.circle(ux + 26, uy - 22, 2, 0x000000); // eye
      // Mane
      this.add.ellipse(ux + 12, uy - 24, 12, 8, 0xFF69B4);
      this.add.ellipse(ux + 6, uy - 20, 10, 8, 0xDA70D6);
      // Legs
      this.add.rectangle(ux - 12, uy + 20, 5, 18, 0xffffff);
      this.add.rectangle(ux + 12, uy + 20, 5, 18, 0xffffff);
      // Tail
      this.add.ellipse(ux - 28, uy - 8, 16, 10, 0xFF69B4);

    } else if (lvl === 4) {
      // Dragon's Tower: dark tower, flying dragons, lava glow, fire
      // Tower
      const tw = width / 2;
      this.add.rectangle(tw, 200, 80, 320, 0x220011);
      this.add.triangle(tw, 25, tw - 50, 45, tw + 50, 45, tw, 5, 0x330022);
      // Tower windows with fire glow
      for (let w = 0; w < 4; w++) {
        const wy = 80 + w * 60;
        this.add.rectangle(tw, wy, 18, 24, 0xFF4400, 0.6);
        this.add.rectangle(tw, wy, 12, 18, 0xFFAA00, 0.3);
      }
      // Dark spires
      for (let i = 0; i < 3; i++) {
        const sx = 50 + i * 140;
        this.add.rectangle(sx, GROUND_Y - 60, 14, 100, 0x220011);
        this.add.triangle(sx, GROUND_Y - 110, sx - 10, GROUND_Y - 60, sx + 10, GROUND_Y - 60, sx, GROUND_Y - 130, 0x330022);
      }
      // Flying dragon silhouettes
      for (let d = 0; d < 2; d++) {
        const dx = 80 + d * 200;
        const dy = 100 + d * 40;
        // Dragon body
        const dragonBody = this.add.ellipse(dx, dy, 40, 18, 0xCC2200, 0.7);
        // Wings
        this.add.triangle(dx - 10, dy - 14, dx - 25, dy - 4, dx + 5, dy - 4, dx - 10, dy - 28, 0x990000, 0.6);
        this.add.triangle(dx + 10, dy - 14, dx - 5, dy - 4, dx + 25, dy - 4, dx + 10, dy - 28, 0x990000, 0.6);
        // Head
        this.add.ellipse(dx + 22, dy - 4, 12, 8, 0xFF3300, 0.7);
        // Fire breath
        this.add.ellipse(dx + 32, dy - 4, 10, 5, 0xFF6600, 0.5);
        // Animate flying
        this.tweens.add({ targets: dragonBody, y: dy - 15, duration: 2000 + d * 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      }
      // Lava glow at ground
      this.add.rectangle(width / 2, GROUND_Y + 10, width, 20, 0xFF4400, 0.3);
      this.add.rectangle(width / 2, GROUND_Y + 5, width, 10, 0xFF6600, 0.2);
    }
  }

  createHUD() {
    const { width } = this.scale;
    this.add.text(16, 16, this.level.name, {
      fontSize: '14px', fill: '#ffffff', stroke: '#000000', strokeThickness: 2,
    });
    this.heartText = this.add.text(width - 16, 16, '❤️❤️❤️', {
      fontSize: '18px',
    }).setOrigin(1, 0);
    this.scoreText = this.add.text(width / 2, 16, '👑 0', {
      fontSize: '18px', fill: '#FFD700', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5, 0);
  }

  updateHearts() {
    const full = '❤️'.repeat(this.hearts);
    const empty = '🖤'.repeat(3 - this.hearts);
    this.heartText.setText(full + empty);
  }

  handleTap() {
    if (this.gameOver) return;
    const onGround = this.eila.body.blocked.down;
    if (onGround) {
      this.eila.setVelocityY(-620);
      this.canDoubleJump = true;
      this.hasDoubleJumped = false;
    } else if (this.canDoubleJump && !this.hasDoubleJumped) {
      this.eila.setVelocityY(-540);
      this.hasDoubleJumped = true;
    }
  }

  spawnObstacle(time) {
    const { width } = this.scale;
    const key = this.level.obstacleTexture || 'obstFrog';
    // Use the same pattern as the original working code:
    // 1. Create a plain image (no physics yet)
    // 2. Add physics via physics.add.existing()
    // This avoids issues with physics.add.image() + group.add() interaction
    const obs = this.add.image(width + 40, GROUND_Y - 30, key);
    this.physics.add.existing(obs);
    obs.body.setVelocityX(-this.level.scrollSpeed);
    obs.body.setAllowGravity(false);
    this.obstacleGroup.add(obs);
    this.obstacles.push(obs);
    this.nextObstacleTime = time + this.level.obstacleInterval;
  }

  spawnCrown(time) {
    const { width } = this.scale;
    const heights = [GROUND_Y - 80, GROUND_Y - 130, GROUND_Y - 180];
    const y = heights[Phaser.Math.Between(0, 2)];
    const crown = this.physics.add.image(width + 20, y, 'crownCollect');
    crown.body.setVelocityX(-this.level.scrollSpeed);
    crown.body.setAllowGravity(false);
    this.physics.add.overlap(this.eila, crown, this.collectCrown, null, this);
    this.crowns.push(crown);
    this.nextCrownTime = time + Phaser.Math.Between(800, 1800);
  }

  collectCrown(eila, crown) {
    crown.destroy();
    this.crowns = this.crowns.filter(c => c !== crown);
    this.score += 10;
    this.scoreText.setText('👑 ' + this.score);
    this.tweens.add({
      targets: this.scoreText, scaleX: 1.4, scaleY: 1.4,
      duration: 120, yoyo: true,
    });
  }

  hitObstacle(eila, obs) {
    if (this.invincible || this.gameOver) return;
    this.hearts -= 1;
    this.updateHearts();
    this.invincible = true;

    this.tweens.add({
      targets: eila, alpha: 0.3, duration: 100, yoyo: true, repeat: 5,
      onComplete: () => {
        eila.setAlpha(1);
        this.invincible = false;
      },
    });

    obs.destroy();
    this.obstacles = this.obstacles.filter(o => o !== obs);

    if (this.hearts <= 0) {
      this.triggerGameOver();
    }
  }

  triggerGameOver() {
    this.gameOver = true;
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);
    this.add.text(width / 2, height / 2 - 40, 'Try Again!', {
      fontSize: '40px', fill: '#FFD700', stroke: '#aa00ff', strokeThickness: 4,
    }).setOrigin(0.5);
    const retry = this.add.text(width / 2, height / 2 + 30, 'Tap to Retry', {
      fontSize: '22px', fill: '#ffffff',
    }).setOrigin(0.5);
    this.tweens.add({
      targets: retry, alpha: 0.2, duration: 600, yoyo: true, repeat: -1,
    });
    this.time.delayedCall(500, () => {
      this.input.once('pointerdown', () => {
        this.scene.restart({ levelIndex: this.levelIndex });
      });
    });
  }

  triggerWin() {
    this.gameOver = true;
    const stars = this.hearts;
    const progress = JSON.parse(localStorage.getItem('eila_progress') || '{}');
    progress[`level_${this.levelIndex}`] = 'complete';
    const existing = progress[`stars_${this.level.id}`] || 0;
    progress[`stars_${this.level.id}`] = Math.max(existing, stars);
    localStorage.setItem('eila_progress', JSON.stringify(progress));

    this.time.delayedCall(300, () => {
      this.scene.start('WinScene', {
        levelIndex: this.levelIndex,
        stars,
        isLastLevel: this.levelIndex === LEVELS.length - 1,
        score: this.score,
      });
    });
  }

  update(time, delta) {
    if (this.gameOver) return;

    // Scroll ground visually
    this.groundTiles.tilePositionX += this.level.scrollSpeed * (delta / 1000);

    // Clean up off-screen obstacles
    this.obstacles = this.obstacles.filter(obs => {
      if (obs.x < -60) { obs.destroy(); return false; }
      return true;
    });

    // Track distance travelled
    this.distanceTravelled += this.level.scrollSpeed * (delta / 1000);

    // Spawn finish line trophy near end
    if (!this.finishSpawned && this.distanceTravelled > this.finishLineDistance - 400) {
      this.finishSpawned = true;
      this.finishLine = this.add.text(
        this.scale.width + 30, GROUND_Y - 80, '🏆', { fontSize: '64px' }
      );
      this.physics.add.existing(this.finishLine);
      this.finishLine.body.setVelocityX(-this.level.scrollSpeed);
      this.finishLine.body.setAllowGravity(false);
    }

    // Check if Eila reached the finish line
    if (this.finishLine && this.finishLine.x < 120 && !this.gameOver) {
      this.triggerWin();
    }

    // Spawn obstacles
    if (time > this.nextObstacleTime) {
      this.spawnObstacle(time);
    }

    // Spawn crowns
    if (time > this.nextCrownTime && !this.gameOver) {
      this.spawnCrown(time);
    }

    // Clean up off-screen crowns
    this.crowns = this.crowns.filter(c => {
      if (c.x < -50) { c.destroy(); return false; }
      return true;
    });

    // Spacebar fallback
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.handleTap();
    }
  }
}
