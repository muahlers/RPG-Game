export const SpawnerType = {
  MONSTER: 'MONSTER',
  CHEST: 'CHEST',
};

export function randomNumber(min, max) {
  return Math.floor(Math.random() * max) + min;
}

export function postData(url, data = {}) {
  console.log(`inside postData(): ${url}`);
  console.log(JSON.stringify(data));
  return fetch(url, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'include', // needed for cookies,  'include' 'same-origin'
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
    body: JSON.stringify(data),
  }).then((response) => response.json());
}

export function createDiv(className) {
  const div = document.createElement('div');
  div.className = className;
  return div;
}

export function createLabel(use, text, className) {
  const label = document.createElement('label');
  label.for = use;
  label.innerText = text;
  label.className = className;
  return label;
}

export function createInputField(inputType, name, id, className, placeholder) {
  const inputField = document.createElement('input');
  inputField.type = inputType;
  inputField.name = name;
  inputField.id = id;
  inputField.className = className;
  inputField.placeholder = placeholder;
  return inputField;
}

export function getCookie(cname) { // Esta funcion no funciona
  console.log('Inside getCookie');
  const name = `${cname}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  console.log(`Cookie: ${decodeURIComponent(document.cookie)}`);
  for (let i = 0; i < ca.length; i += 1) {
    let c = ca[i];
    while (c.charAt(0) === '') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

export function refreshTokenInterval() {
  console.log('Inside refresInterval');
  console.log(`getCookie: ${getCookie('refreshJwt')}`);
  setInterval(() => {
    postData(`${SERVER_URL}/token`, { refreshToken: getCookie('refreshJwt') })
      .then(() => {})
      .catch((error) => {
        console.log(error.message);
        // window.alert('Token is not longer valid, please login again.');
        // window.location.replace('/index.html');
      });
  }, parseInt(TOKEN_INTERVAL, 10));
}
