import CredentialBaseScene from './CredentialBaseScene';
import { postData } from '../utils/utils';

export default class LoginScene extends CredentialBaseScene {
  constructor() {
    super('Login');
  }

  create() {
    this.createUi(
      'Login',
      this.login.bind(this),
      'Forget Password',
      this.startScene.bind(this, 'ForgotPassword'),
      'Back',
      this.startScene.bind(this, 'Title'),
    );
  }

  login() {
    const loginValue = this.loginInput.value;
    const passwordValue = this.passwordInput.value;

    postData('http://localhost:3000/login', { email: loginValue, password: passwordValue })
      .then((response) => {
        if (response.status === '200') {
          this.startScene('Game');
        } else {
          console.log(response.status);
          window.alert('Invalid Username or Password');
        }
      })
      .catch((error) => {
        console.log(error.message);
        window.alert('Invalid Username or Password');
      });
  }
}
