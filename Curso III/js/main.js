var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 500,
  scene: [
      BootScene, // Default Scene pick by Phaser, the 1st one always!
      TitleScene,
      GameScene,
      UiScene,
  ],
  physics: {
      default: "arcade",
      arcade: {
          debug: false,
          gravity: {
              y: 0,
          },
      },
  },
  pixelArt: true,
  roundPixels: true,
};

var game = new Phaser.Game(config);
