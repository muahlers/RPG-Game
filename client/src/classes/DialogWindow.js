export default class DialogWindow {
  constructor(scene, opts) {
    if (!opts) opts = {};
    const {
      x = 0,
      y = 0,
      debug = false,
    } = opts;

    this.scene = scene;
    this.x = x;
    this.y = y;
    this.debug = debug;

    this.borderThickness = 3;
    this.borderColor = 0x907748;
    this.borderAlpha = 0.9;
    this.windowAlpha = 0.4;
    this.textAlpha = 0.2;
    this.windowColor = 0x303030;
    this.windowWidth = 305;
    this.windowHeight = this.scene.scale.height;

    this.graphics = this.scene.add.graphics();
    this.graphics.setDepth(2);
    this.createWindow();
  }

  createWindow() {
    const windowDimension = this.calculateWindowDimension();
    this.createOuterWindow(windowDimension);
    this.createInnerWindow(windowDimension);
  }

  calculateWindowDimension() {
    const x = this.x - this.windowWidth - 2 + this.scene.cameras.main.worldView.x;
    const y = this.y + 2 + this.scene.cameras.main.worldView.x;
    const rectWidth = this.windowWidth - 5;
    const rectHeight = this.windowHeight;

    return {
      x, y, rectWidth, rectHeight,
    };
  }

  createOuterWindow(data) {
    this.graphics.lineStyle(this.borderThickness, this.borderColor, this.borderAlpha);
    this.graphics.strokeRect(data.x, data.y, data.rectWidth, data.rectHeight);
    console.log(`WindowCreated! x: ${data.x} y:${data.y} recW:${data.rectWidth} recH:${data.rectHeight}`);
  }

  createInnerWindow() {

  }

  update() {
    this.redrawWindow();
  }

  redrawWindow() {
    this.graphics.clear();
    this.createWindow()
  }
}
