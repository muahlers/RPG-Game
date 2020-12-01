import CredentialBaseScene from './CredentialBaseScene';
import { postData } from '../utils/utils';

export default class ResetPasswordScene extends CredentialBaseScene {
  constructor() {
    super('ResetPassword');
  }

  create() {
    this.createUi(
      'Reset Password',
      this.resetPassword.bind(this),
      'Back',
      this.startScene.bind(this, 'Login'),
    );

    this.loginInput.parentNode.removeChild(this.loginInput);
    this.loginLabel.parentNode.removeChild(this.loginLabel);
  }

  resetPassword() {
    const loginValue = this.loginInput.value;

    postData('http://localhost:3000/forgot-password', { email: loginValue })
      .then((response) => {
        if (response.status === '200') {
          window.alert(response.message);
          this.startScene('Title');
        } else {
          console.log(response.status);
          window.alert('If an acount was found, a password reset email was sent.');
        }
      })
      .catch((error) => {
        console.log(error.message);
        window.alert('If an acount was found, a password reset email was sent.');
      });
  }
}
