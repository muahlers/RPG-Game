import * as Phaser from 'phaser';
import UiButton from '../classes/UiButton';
import {
  createDiv, createLabel, createInputField,
} from '../utils/utils';

export default class CredentialBaseScene extends Phaser.Scene {
  createUi(btnText1, btnTarget1, btnText2, btnTarget2, btnText3, btnTarget3) {
    // create title text
    this.titleText = this.add.text(this.scale.width / 2, this.scale.height * 0.1, 'Zenva MMORPG', { fontSize: '64px', fill: '#fff' });
    this.titleText.setOrigin(0.5);

    this.createInput();

    this.button1 = new UiButton(
      this, this.scale.width / 2,
      this.scale.height * 0.65,
      'button1',
      'button2',
      btnText1,
      btnTarget1,
    );
    this.button2 = new UiButton(
      this, this.scale.width / 2,
      this.scale.height * 0.75,
      'button1',
      'button2',
      btnText2,
      btnTarget2,
    );
    if (btnText3 && btnTarget3) {
      this.button3 = new UiButton(
        this, this.scale.width / 2,
        this.scale.height * 0.85,
        'button1',
        'button2',
        btnText3,
        btnTarget3,
      );
    }

    // handles game resize.
    this.scale.on('resize', this.resize, this);
    // fix a bug.
    this.resize({ height: this.scale.height, width: this.scale.width });
  }

  createInput() {
    this.div = createDiv('input-div');
    this.loginLabel = createLabel('login', 'Email', 'form-label');
    this.loginInput = createInputField('text', 'login', 'login', 'login-input', 'Email Address');
    this.passwordLabel = createLabel('password', 'Password', 'form-label');
    this.passwordInput = createInputField('password', 'password', 'password', 'login-input', '');

    this.div.append(this.loginLabel);
    this.div.append(document.createElement('br'));
    this.div.append(this.loginInput);
    this.div.append(document.createElement('br'));
    this.div.append(this.passwordLabel);
    this.div.append(document.createElement('br'));
    this.div.append(this.passwordInput);

    document.body.appendChild(this.div);
  }

  startScene(targetScene) {
    this.scale.removeListener('resize', this.resize);
    this.div.parentNode.removeChild(this.div);
    this.scene.start(targetScene);
  }

  resize(gameSize) {
    const { width, height } = gameSize;
    this.cameras.resize(width, height);

    this.titleText.setPosition(width / 2, height * 0.1);

    if (width < 1200) {
      this.titleText.setFontSize('64px');
    } else {
      this.titleText.setFontSize('128px');
    }
    if (height < 700) {
      this.button1.setPosition(width / 2, height * 0.68);
      this.button2.setPosition(width / 2, height * 0.79);
      this.button1.setScale(0.7);
      this.button2.setScale(0.7);
      if (this.button3) {
        this.button3.setPosition(width / 2, height * 0.90);
        this.button3.setScale(0.7);
      }
    } else {
      this.button1.setPosition(width / 2, height * 0.65);
      this.button2.setPosition(width / 2, height * 0.75);
      this.button1.setScale(1);
      this.button2.setScale(1);
      if (this.button3) {
        this.button3.setPosition(width / 2, height * 0.85);
        this.button3.setScale(1);
      }
    }
  }
}
