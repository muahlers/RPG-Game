import * as Phaser from 'phaser';

export default class Monster extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y, key, frame, id, health, maxHealth, xOrigin, yOrigin) {
    super(scene, x, y, key, frame);
    this.scene = scene;
    this.id = id;
    this.health = health;
    this.maxHealth = maxHealth;
    this.xOrigin = xOrigin;
    this.yOrigin = yOrigin;

    this.circle = new Phaser.Geom.Circle(this.xOrigin, this.yOrigin, 300);

    // enable physics
    this.scene.physics.world.enable(this);
    // set immovable if another object collides with our monster
    this.setImmovable(false);
    // scale our monster
    this.setScale(2);
    // collide with world bounds
    this.setCollideWorldBounds(true);
    // add the monster to our existing scene
    this.scene.add.existing(this);
    // update the origin
    this.setOrigin(0);

    this.createHealthBar();
  }

  createHealthBar() {
    this.healthBar = this.scene.add.graphics();
    this.updateHealthBar();
  }

  updateHealthBar() {
    this.healthBar.clear();
    this.healthBar.fillStyle(0xffffff, 1);
    this.healthBar.fillRect(this.x, this.y - 8, 64, 5);
    this.healthBar.fillGradientStyle(0xff0000, 0xffffff, 4);
    this.healthBar.fillRect(this.x, this.y - 8, 64 * (this.health / this.maxHealth), 5);
  }

  updateHealth(health) {
    this.health = health;
    this.updateHealthBar();
  }

  makeActive() {
    this.setActive(true);
    this.setVisible(true);
    this.body.checkCollision.none = false;
    this.updateHealthBar();
  }

  makeInactive() {
    this.setActive(false);
    this.setVisible(false);
    this.body.checkCollision.none = true;
    this.healthBar.clear();
  }

  update() {
    this.updateHealthBar();
  }

  drawOrigin(x, y) {
    if (!this.originCircle) {
      this.originCircle = this.scene.add.graphics();
      this.originCircle.clear();
      this.originCircle.lineStyle(4, '0xffffff', 0.5);
      this.originCircle.strokeCircleShape(this.circle);
      console.log('Circle Draw!');
    }
    if (!this.monPosition) {
      this.monPosition = this.scene.add.graphics();
    }
    this.monPosition.clear();
    const rect = new Phaser.Geom.Rectangle(x, y, 10, 10);
    this.monPosition.fillStyle('0xff00ff', 0.8);
    this.monPosition.fillRectShape(rect);
  }
}
