import * as Phaser from 'phaser';
import UiButton from '../classes/UiButton';
import {
  createDiv, createLabel, createInputField,
} from '../utils/utils';

export default class CredentialBaseScene extends Phaser.Scene {
  createUi(btnText1, btnTarget1, btnText2, btnTarget2, btnText3, btnTarget3) {
    // create title text
    this.titleText = this.add.text(this.scale.width / 2, this.scale.height / 8, 'Zenva MMORPG', { fontSize: '64px', fill: '#fff' });
    this.titleText.setOrigin(0.5);

    this.createInput();

    this.button1 = new UiButton(
      this, this.scale.width / 2,
      this.scale.height * 0.60,
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
        this.scale.height * 0.90,
        'button1',
        'button2',
        btnText3,
        btnTarget3,
      );
    }
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
    this.div.parentNode.removeChild(this.div);
    this.scene.start(targetScene);
  }
}
