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
  }

  create() {
    const { width, height } = this.scale;

    // level.background is always a CSS hex string (e.g. '#87CEEB') per levelConfig.js
    // Background
    this.add.rectangle(width / 2, height / 2, width, height,
      Phaser.Display.Color.HexStringToColor(this.level.background).color);

    // Scrolling ground
    this.groundTiles = this.add.tileSprite(
      width / 2, GROUND_Y + 35, width, 70, 'groundRect'
    );

    // Ground physics body (static)
    this.ground = this.physics.add.staticGroup();
    const groundBlock = this.ground.create(width / 2, GROUND_Y + 35, 'groundRect');
    groundBlock.setScale(width / 32, 1).refreshBody();

    // Eila sprite
    this.eila = this.physics.add.sprite(80, GROUND_Y - 30, 'eilaSprite');
    this.eila.setCollideWorldBounds(false);

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

  createHUD() {
    const { width } = this.scale;
    this.add.text(16, 16, this.level.name, {
      fontSize: '14px', fill: '#ffffff', stroke: '#000000', strokeThickness: 2,
    });
    this.heartText = this.add.text(width - 16, 16, '❤️❤️❤️', {
      fontSize: '18px',
    }).setOrigin(1, 0);
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
    const obs = this.add.rectangle(
      width + 30, GROUND_Y - 25, 40, 50, this.level.obstacleColor
    );
    this.physics.add.existing(obs);
    obs.body.setVelocityX(-this.level.scrollSpeed);
    obs.body.setAllowGravity(false);
    this.obstacleGroup.add(obs);
    this.obstacles.push(obs);
    this.nextObstacleTime = time + this.level.obstacleInterval;
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

  update(time, delta) {
    if (this.gameOver) return;

    // Scroll ground visually
    this.groundTiles.tilePositionX += this.level.scrollSpeed * (delta / 1000);

    // Clean up off-screen obstacles
    this.obstacles = this.obstacles.filter(obs => {
      if (obs.x < -50) { obs.destroy(); return false; }
      return true;
    });

    // Spawn obstacles
    if (time > this.nextObstacleTime) {
      this.spawnObstacle(time);
    }

    // Spacebar fallback
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.handleTap();
    }
  }
}
