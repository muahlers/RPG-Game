import * as Phaser from 'phaser';
import UiButton from '../classes/UiButton';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    // create title text
    this.titleText = this.add.text(this.scale.width / 2, this.scale.height / 4, 'Zenva MMORPG', { fontSize: '128px', fill: '#fff' });
    this.titleText.setOrigin(0.5);

    // create the Login game button
    this.loginButton = new UiButton(
      this, this.scale.width / 2,
      this.scale.height * 0.65,
      'button1',
      'button2',
      'Login',
      this.startScene.bind(this, 'Login'),
    );
    // create the SignUp game button
    this.signupButton = new UiButton(
      this, this.scale.width / 2,
      this.scale.height * 0.75,
      'button1',
      'button2',
      'Sign Up',
      this.startScene.bind(this, 'Signup'),
    );
    // handles game resize.
    this.scale.on('resize', this.resize, this);
    // fix a bug.
    this.resize({ height: this.scale.height, width: this.scale.width });
  }

  startScene(targetScene) {
    this.scale.removeListener('resize', this.resize);
    this.scene.start(targetScene);
  }

  resize(gameSize) {
    const { width, height } = gameSize;
    this.cameras.resize(width, height);

    if (width < 1000) {
      this.titleText.setFontSize('64px');
    } else {
      this.titleText.setFontSize('128px');
    }
    if (height < 700) {
      this.titleText.setPosition(width / 2, height * 0.40);
      this.loginButton.setPosition(width / 2, height * 0.65);
      this.signupButton.setPosition(width / 2, height * 0.80);
      this.loginButton.setScale(0.7);
      this.signupButton.setScale(0.7);
    } else {
      this.titleText.setPosition(width / 2, height / 4);
      this.loginButton.setPosition(width / 2, height * 0.65);
      this.signupButton.setPosition(width / 2, height * 0.75);
      this.loginButton.setScale(1);
      this.signupButton.setScale(1);
    }
  }
}
