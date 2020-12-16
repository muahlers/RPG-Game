export default class ModalWindow {
  constructor(scene, opts) {
    if (!opts) opts = {};
    const {
      x = 0,
      y = 0,
      debug = false,
      borderThickness = 3,
      borderColor = 0x907748,
      borderAlpha = 0.3,
      windowAlpha = 0.4,
      textAlpha = 0.2,
      windowColor = 0x303030,
      windowWidth = 305,
      windowHeight = scene.scale.height,
    } = opts;

    this.scene = scene;
    this.x = x;
    this.y = y;
    this.debug = debug;

    this.borderThickness = borderThickness;
    this.borderColor = borderColor;
    this.borderAlpha = borderAlpha;
    this.windowAlpha = windowAlpha;
    this.textAlpha = textAlpha;
    this.windowColor = windowColor;
    this.windowWidth = windowWidth;
    this.windowHeight = windowHeight;
    this.worldOldX = this.scene.cameras.main.worldView.x;
    this.worldOldY = this.scene.cameras.main.worldView.y;

    this.graphics = this.scene.add.graphics();
  }

  createWindow() {
    const windowDimension = this.calculateWindowDimension();
    this.createOuterWindow(windowDimension);
    this.createInnerWindow(windowDimension);
    this.createInnerWindowRectangle(windowDimension);
  }

  createOuterWindow(data) {
    this.graphics.lineStyle(this.borderThickness, this.borderColor, this.borderAlpha);
    this.graphics.strokeRect(data.x, data.y, data.rectWidth, data.rectHeight);
  }

  createInnerWindow(data) {
    this.graphics.fillStyle(this.windowColor, this.windowAlpha);
    this.graphics.fillRect(data.x + 1, data.y + 1, data.rectWidth - 1, data.rectHeight - 1);
  }

  redrawWindow() {
    this.graphics.clear();
    this.createWindow();
  }

  update() {
    // update the dialg window if the main world view has chenged.
    if (
      this.scene.cameras.main.worldView.x !== this.worldOldX
       || this.scene.cameras.main.worldView.y !== this.worldOldY) {
      this.redrawWindow();
      this.worldOldX = this.scene.cameras.main.worldView.x;
      this.worldOldY = this.scene.cameras.main.worldView.y;
    }
  }
}
