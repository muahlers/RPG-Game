import ModalWindow from './ModalWindow';

export default class InventoryWindow extends ModalWindow {
  constructor(scene, opts) {
    super(scene, opts);

    this.playerObject = {};
    this.mainPlayer = false;
    this.inventotyItems = {};
    this.graphics.setDepth(3);
    this.createWindow();
    // this.hideWindow();
  }

  calculateWindowDimension() {
    let x = this.x + (this.scene.scale.width / 4);
    let y = this.y + (this.scene.scale.height * 0.1);

    if (this.scene.scale.width < 750) {
      x = this.x + 40;
      y = this.y + 40;
    }

    const rectWidth = this.windowWidth;
    const rectHeight = this.windowHeight - 5;

    return {
      x, y, rectWidth, rectHeight,
    };
  }

  createInnerWindowRectangle(data) {
    if (this.rect) {
      this.rect.setPosition(data.x + 1, data.y + 1);
      this.rect.setDisplaySize(data.rectWidth - 1, data.rectHeight - 1);

      // update position of inventory container.
      this.inventoryContainer.setPosition(data.x + 1, data.y + 1);
      this.inventoryContainer.setSize(data.rectWidth - 1, data.rectHeight - 1);

      // center title text;
      this.titleText.setPosition(this.inventoryContainer.width / 2, 20);
    } else {
      this.rect = this.scene.add.rectangle(
        data.x + 1,
        data.y + 1,
        data.rectWidth - 1,
        data.rectHeight - 1,
      );
      if (this.debug) this.rect.setFillStyle(0x6666ff);
      this.rect.setOrigin(0, 0);

      // create inventory container for positioning elements.
      this.inventoryContainer = this.scene.add.container(data.x + 1, data.y + 1);
      this.inventoryContainer.setDepth(3);
      this.inventoryContainer.setAlpha(this.textAlpha);

      // create inventory title
      this.titleText = this.scene.add.text(this.inventoryContainer.width / 2, 20, 'Player Stats', { fontSize: '22px', fill: '#ffffff', align: 'center' });
      this.titleText.setOrigin(0.5);
      this.inventoryContainer.add(this.titleText);
      // create inventory stats
      this.createInventoryStats();
      // create inventory slots
      this.createInventorySlots();
    }
  }

  createInventoryStats() {

  }

  createInventorySlots() {

  }

  resize(gameSize) {
    // Remember to Cut resize Listener if we change Secene.
    if (gameSize.width < 750) {
      this.windowWidth = this.scene.scale.width - 80;
      this.windowHeight = this.scene.scale.height - 80;
    } else {
      this.windowWidth = this.scene.scale.width / 2;
      this.windowHeight = this.scene.scale.height * 0.8;
    }

    this.redrawWindow();
  }

  hideWindow() {
    this.rect.disableInteractive();
    this.graphics.setAlpha(0);
  }

  showWindow(playerObject, mainPlayer) {
    this.mainPlayer = mainPlayer;
    this.playerObject = playerObject;
    console.log(playerObject);
    this.rect.setInteractive();
    this.graphics.setAlpha(1);
  }
}
