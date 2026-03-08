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

    // level.background is always a CSS hex string (e.g. '#87CEEB') per levelConfig.js
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

    // Obstacle group
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

    // Level-specific decor
    if (lvl === 0) {
      // Royal Garden: flowers and sun
      this.add.circle(340, 60, 28, 0xFFD700);  // sun
      for (let i = 0; i < 8; i++) {
        const fx = 20 + i * 50;
        this.add.circle(fx, GROUND_Y - 5, 6, [0xFF69B4, 0xFF1493, 0xFF6347, 0xFFD700][i % 4]);
        this.add.rectangle(fx, GROUND_Y + 5, 3, 12, 0x2ECC40);
      }
    } else if (lvl === 1) {
      // Enchanted Forest: trees — use bright green so they contrast against the dark #2d5016 background
      for (let i = 0; i < 5; i++) {
        const tx = 30 + i * 80;
        this.add.triangle(tx, GROUND_Y - 40, tx - 22, GROUND_Y, tx + 22, GROUND_Y, tx, GROUND_Y - 80, 0x27AE60);
        this.add.rectangle(tx, GROUND_Y - 5, 10, 20, 0x7D5A3A);
      }
    } else if (lvl === 2) {
      // Castle Courtyard: battlements
      for (let i = 0; i < 8; i++) {
        this.add.rectangle(30 + i * 50, 30, 24, 40, 0x888888);
      }
      this.add.rectangle(width / 2, 55, width, 20, 0x999999);
    } else if (lvl === 3) {
      // Candy Kingdom: lollipops and candy cane stripes
      for (let i = 0; i < 6; i++) {
        const lx = 25 + i * 65;
        this.add.circle(lx, GROUND_Y - 60, 18, [0xFF1493, 0xFF6347, 0x9B59B6][i % 3]);
        this.add.rectangle(lx, GROUND_Y - 20, 5, 50, 0xffffff);
      }
    } else if (lvl === 4) {
      // Dragon's Tower: dark spires and fire
      for (let i = 0; i < 4; i++) {
        const sx = 40 + i * 100;
        this.add.rectangle(sx, GROUND_Y - 80, 18, 120, 0x330022);
        this.add.triangle(sx, GROUND_Y - 140, sx - 12, GROUND_Y - 80, sx + 12, GROUND_Y - 80, sx, GROUND_Y - 160, 0x550033);
      }
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
    // Spawn with center-bottom origin so obstacle sits on ground level
    const spawnY = GROUND_Y - 20;
    const obs = this.physics.add.image(width + 40, spawnY, key);
    obs.setOrigin(0.5, 1);
    // After setOrigin, re-sync the body position so it matches the new origin
    obs.body.reset(width + 40 - obs.body.halfWidth, spawnY - obs.body.height);
    obs.body.setVelocityX(-this.level.scrollSpeed);
    obs.body.setAllowGravity(false);
    obs.body.setImmovable(true);
    obs.setDepth(2);
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
    // Pop animation on score text
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
    const stars = this.hearts; // 1-3 stars based on hearts remaining
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
      if (obs.x < -50) { obs.destroy(); return false; }
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
