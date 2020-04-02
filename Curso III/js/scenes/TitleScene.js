class TitleScene extends Phaser.Scene {
    constructor() {
        super('Title');
    }

    create() {
          // Create Game Title
          this.titleText = this.add.text(this.scale.width/2, this.scale.height/2,"MMORPG Last Frontier", {fontSize: '48px', fill: '#fff'} );
          this.titleText.setOrigin(0.5);

          // Creat Start button
          this.startGameButton = new UiButton(this, this.scale.width/2, this.scale.height * 0.7, 'button1', 'button2', 'Start', this.startScene.bind(this, 'Game'));
    }

    startScene(targetScene){
          this.scene.start(targetScene);
    }
}
