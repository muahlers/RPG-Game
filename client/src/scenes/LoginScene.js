import * as Phaser from 'phaser';
import UiButton from '../classes/UiButton';

export default class LoginScene extends Phaser.Scene {
  constructor() {
    super('Login');
  }

  create() {
    // create title text
    this.titleText = this.add.text(this.scale.width / 2, this.scale.height / 8, 'Zenva MMORPG', { fontSize: '64px', fill: '#fff' });
    this.titleText.setOrigin(0.5);

    this.createInput();

    // create the forget password button
    this.forgetPassButton = new UiButton(
      this, this.scale.width / 2,
      this.scale.height * 0.65,
      'button1',
      'button2',
      'Forget Password',
      this.startScene.bind(this, 'forgetPassword'),
    );
    // create backs button
    this.backButton = new UiButton(
      this, this.scale.width / 2,
      this.scale.height * 0.80,
      'button1',
      'button2',
      'Back',
      this.startScene.bind(this, 'Title'),
    );
  }

  createInput() {
    const div = document.createElement('div');
    div.className = 'input-div';
    this.div = div;

    const label = document.createElement('label');
    label.for = 'login';
    label.innerText = 'Email';
    label.className = 'form-label';
    this.loginLabel = label;

    const inputField1 = document.createElement('input');
    inputField1.type = 'text';
    inputField1.name = 'login';
    inputField1.id = 'login';
    inputField1.className = 'login-input';
    inputField1.placeholder = 'Email Address';
    this.loginInput = inputField1;

    const label2 = document.createElement('label');
    label2.for = 'password';
    label2.innerText = 'Password';
    label2.className = 'form-label';
    this.passwordLabel = label2;

    const inputField2 = document.createElement('input');
    inputField2.type = 'password';
    inputField2.name = 'password';
    inputField2.id = 'password';
    inputField2.className = 'login-input';
    this.passwordInput = inputField2;

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
    this.scene.start(targetScene);
  }
}
