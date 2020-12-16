import * as Phaser from 'phaser';
import InventoryWindow from '../classes/InventoryWindow';

export default class UiScene extends Phaser.Scene {
  constructor() {
    super('Ui');
  }

  init() {
    // grab a reference to the game scene
    this.gameScene = this.scene.get('Game');
    // TODO: set to false
    this.showInventory = true;
  }

  create() {
    this.setupUiElements();
    this.setupEvents();

    // handles game resize.
    this.scale.on('resize', this.resize, this);
    // fix a bug.
    this.resize({ height: this.scale.height, width: this.scale.width });
  }

  setupUiElements() {
    // create the score text game object
    this.scoreText = this.add.text(35, 8, 'Coins: 0', { fontSize: '16px', fill: '#fff' });
    // create coin icon
    this.coinIcon = this.add.image(15, 15, 'items', 3);
    // create Inventory modal
    this.inventoryWindow = new InventoryWindow(this, {
      windowWidth: this.scale.width / 2,
      windowHeight: this.scale.height * 0.8,
      borderAlpha: 1,
      windowAlpha: 0.9,
      debug: false,
      textAlpha: 1,
      windowColor: 0x000000,
    });

    // create inventory button.
    this.inventoryButton = this.add.image(50, this.scale.height - 50, 'inventoryButton').setInteractive();
    this.inventoryButton.setScale(2);
    this.inventoryButton.on('pointerdown', () => {
      console.log('button press');
      this.toggleInventory(this.gameScene.player, true);
    });

    // CLick out inventory window close window.
    this.input.on('pointerdown', (pointer, gameObjects) => {
      if (!gameObjects.includes(this.inventoryWindow.rect)
      && !gameObjects.includes(this.inventoryButton)) {
        this.gameScene.dialogWindow.rect.setInteractive();
        this.inventoryWindow.hideWindow();
        this.showInventory = false;
      }
    });
  }

  setupEvents() {
    // listen for the updateScore event from the game scene
    this.gameScene.events.on('updateScore', (score) => {
      this.scoreText.setText(`Coins: ${score}`);
    });
  }

  resize(gameSize) {
    if (this.inventoryWindow) {
      this.inventoryWindow.resize(gameSize);
    }

    if (gameSize.width < 560) {
      this.inventoryButton.y = gameSize.height - 250;
    } else {
      this.inventoryButton.y = gameSize.height - 50;
    }
  }

  toggleInventory(playerObject, mainPlayer) {
    this.showInventory = !this.showInventory;
    if (this.showInventory) {
      this.gameScene.dialogWindow.rect.disableInteractive();
      this.inventoryWindow.showWindow(playerObject, mainPlayer);
    } else {
      this.gameScene.dialogWindow.rect.setInteractive();
      this.inventoryWindow.hideWindow();
    }
  }
}
