class Chest extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y, key, frame, coins, id) {
        super(scene, x, y, key, frame);
        this.scene = scene; // Scene this Gamr Objrct will be added to
        this.coins = coins;  // amounts of coins this chest contains.
        this.id = id;

        // enable Physics
        this.scene.physics.world.enable(this);
        // add player to existing scene
        this.scene.add.existing(this);
        //scale out chest objectType
        this.setScale(2);
    }

    makeActive(){
        this.setActive(true);
        this.setVisible(true);
        this.body.checkCollision.none = false;
    }

    makeInactive(){
      this.setActive(false);
      this.setVisible(false);
      this.body.checkCollision.none = true;
    }
  }
