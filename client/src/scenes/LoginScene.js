import CredentialBaseScene from './CredentialBaseScene';
import { postData, refreshTokenInterval } from '../utils/utils';

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
    console.log(`URL: ${SERVER_URL}`);
  }

  login() {
    const loginValue = this.loginInput.value;
    const passwordValue = this.passwordInput.value;
    console.log(`going to log in :${loginValue} ${passwordValue}`);
    postData(`${SERVER_URL}/login`, { email: loginValue, password: passwordValue })
      .then((response) => {
        if (response.status === '200') {
          console.log(response.status);
          // refreshTokenInterval();
          console.log('out Inerval')
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
