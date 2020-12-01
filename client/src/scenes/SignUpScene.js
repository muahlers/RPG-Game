import CredentialBaseScene from './CredentialBaseScene';
import {
  postData, createLabel, createInputField,
} from '../utils/utils';

export default class SignUpScene extends CredentialBaseScene {
  constructor() {
    super('Signup');
  }

  create() {
    this.createUi('Sign Up', this.signup.bind(this), 'Back', this.startScene.bind(this, 'Title'));
    this.createUsernameInput();
  }

  createUsernameInput() {
    this.userNameLabel = createLabel('username', 'Username', 'form-label');
    this.userNameInput = createInputField('text', 'username', 'username', 'login-input', 'Username');

    this.div.append(document.createElement('br'));
    this.div.append(this.userNameLabel);
    this.div.append(document.createElement('br'));
    this.div.append(this.userNameInput);
  }

  signup() {
    const loginValue = this.loginInput.value;
    const passwordValue = this.passwordInput.value;
    const usernameValue = this.userNameInput.value;

    if (loginValue && passwordValue && usernameValue) {
      postData('http://localhost:3000/signup', {
        email: loginValue, password: passwordValue, username: usernameValue,
      })
        .then((response) => {
          if (response.status === '200') {
            console.log(response.message);
            this.startScene('Login');
          } else {
            console.log(response.error);
            window.alert('Invalid Username or Password');
          }
        })
        .catch((error) => {
          console.log(error.message);
          window.alert('Invalid Username or Password');
        });
    } else {
      window.alert('All fields must be filled out');
    }
  }
}
