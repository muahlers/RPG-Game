class UiScene extends Phaser.Scene {
    constructor() {
        super('Ui');
    }

    init() {
      // grab a reference of the Game Scene
      this.gameScene = this.scene.get('Game');
    }

    create() {
      this.setupUiElements();
      this.setupEvents();
    }

    setupUiElements(){
        // Create Coins Text Score
        this.scoreText = this.add.text(35, 0 , 'Coins: 0', {fontSize: '16px'});
        // Create Coin Icon
        this.coinIcon = this.add.image(150, 10, "items", 3);
    }

    setupEvents(){
        //grab events form GameScene
        this.gameScene.events.on('updateScore', (score) => {
            this.scoreText.setText('Coins ' + score);
        });
    }
}
