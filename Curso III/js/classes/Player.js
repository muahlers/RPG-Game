class Player extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y, key, frame) {
        super(scene, x, y, key, frame);
        this.scene = scene;  // Scene this Gamr Objrct will be added to
        this.velocity = 160; // the velocity this player moves.

        // enable Physics
        this.scene.physics.world.enable(this);
        // set immovable if another object collides with our player.
        this.setImmovable(false);
        // scale our player
        this.setScale(2); //Escalo mi Sprite en 2x, tanto en x como en y,
        // Collide with world bounds.
        this.setCollideWorldBounds(true); // No permito que mi player salga de la camara.
        // add player to existing scene
        this.scene.add.existing(this);
        // make camera follow the Player
        this.scene.cameras.main.startFollow(this);
    }

    update(cursor){

        this.body.setVelocity(0);

        if(cursor.left.isDown) {
            this.body.setVelocityX(-this.velocity);
        } else if (cursor.right.isDown) {
            this.body.setVelocityX(this.velocity);
        }

        if(cursor.down.isDown) {
            this.body.setVelocityY(this.velocity);
        } else if (cursor.up.isDown) {
            this.body.setVelocityY(-this.velocity);
        }
    }
}
