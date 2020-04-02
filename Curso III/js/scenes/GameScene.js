class GameScene extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    init(){
        this.scene.launch('Ui');
        this.score = 0;
    }

    create(){
        this.createAudios();
        this.createMap();
        this.createGroup();
        this.createInput();
        this.createGameManager();
    }

    update(){
      if (this.player)  this.player.update(this.cursor);
    }

    createAudios(){
        this.goldPickUpAudio = this.sound.add('goldSound',  { loop: false, volume: 0.5});
    }

    createMap(){
        // Create Map
        this.map = new Map(this, 'map', 'tileSet', 'background', 'blocked' );
    }

    createGroup(){
        // Create a group of createChest
        this.chests = this.physics.add.group();
    }

    spawnChest(chestObject) {


        let chest = this.chests.getFirstDead(); // returns false if there no Death Object
        //console.log(chest);
        if(!chest){
            const chest = new Chest(this, chestObject.x *2, chestObject.y *2, "items", 0, chestObject.gold, chestObject.id);
            this.chests.add(chest);
        }else {
            chest.coins = chestObject.gold;
            chest.id = chestObject.id;
            chest.setPosition(chestObject.x *2, chestObject.y *2);
            chest.makeActive();
        }
    }

    collectChest(player, chest){
        this.goldPickUpAudio.play();
        this.score += chest.coins;
        // update coins score
        this.events.emit('updateScore', this.score);
        // make chest inactive
        chest.makeInactive();
        // Tell Game Manager to delete CHEST
        this.events.emit('pickUpChest', chest.id);
    }

    createInput(){
        this.cursor = this.input.keyboard.createCursorKeys(); // Creo un objeto que escucha el teclado!!
    }

    createPlayers(location){
        this.player = new Player(this, location[0] *2, location[1] *2, "characters", 0); //Agrego propiedades Fisicas a personaje.
    }

    addCollision(){
      this.physics.add.overlap(this.player, this.chests, this.collectChest, null, this);
      // check for collisons between player and blocked Layer
      this.physics.add.collider(this.player, this.map.blockedLayer);
    }

    createGameManager() {

      this.events.on('spawnPlayer', (location) => {
            this.createPlayers(location);
            this.addCollision();
      });

      this.events.on('spawnedChest', (chest) => {
            this.spawnChest(chest);
      });

        this.GameManager = new GameManager(this, this.map.map.objects);
        this.GameManager.setup();
    }
}
