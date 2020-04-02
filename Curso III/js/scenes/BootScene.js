class BootScene extends Phaser.Scene {
    constructor() {
        super('Boot');
    }
    preload(){
        // load images.
        this.loadImages();
        // load spritesheets
        this.loadSpitesheets();
        // load audio.
        this.loadAudio();
        // load Tiled Map
        this.loadTiledMap();
    }

    loadImages(){
        this.load.image("button1", "assets/images/ui/blue_button01.png");
        this.load.image("button2", "assets/images/ui/blue_button02.png");
        // load tield sets
        this.load.image("tileSet", "assets/level/background-extruded.png");
    }

    loadSpitesheets(){
        this.load.spritesheet("items", "assets/images/items.png", {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet("characters", "assets/images/characters.png", {frameWidth: 32, frameHeight: 32});
    }

    loadAudio(){
        this.load.audio("goldSound", ['assets/audio/Pickup.wav']);
    }

    loadTiledMap(){
        // map made with Tield in JASON format.
        this.load.tilemapTiledJSON('map','assets/level/large_level.json');
    }

    create() {
        console.log('starting game ...');
        this.scene.start('Title');  //Voy hacia TitleScene.
    }
}
