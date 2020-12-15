"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _express = _interopRequireDefault(require("express"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _cors = _interopRequireDefault(require("cors"));

var _cookieParser = _interopRequireDefault(require("cookie-parser"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _passport = _interopRequireDefault(require("passport"));

var _main = _interopRequireDefault(require("./routes/main"));

var _password = _interopRequireDefault(require("./routes/password"));

var _secure = _interopRequireDefault(require("./routes/secure"));

var _GameManager = _interopRequireDefault(require("./gameManager/GameManager"));

// Requiro Paquetes Express en node_modules
// Requiro Paquetes Body Parser en node_modules
// Requiro Paquetes de Cors en node_modules
// routes
// Variables en Archivo .env
require('dotenv').config(); // setup mongo connections


var uri = process.env.MONGO_CONNECTION_URL;
var mongoConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
};

if (process.env.MONGO_USER && process.env.MONGO_PASSWORD) {
  mongoConfig.auth = {
    authSource: 'admin'
  };
  mongoConfig.user = process.env.MONGO_USER;
  mongoConfig.pass = process.env.MONGO_PASSWORD;
}

_mongoose["default"].connect(uri, mongoConfig); // if there is no connection to db we exit the app!


_mongoose["default"].connection.on('error', function (error) {
  console.log(error);
  console.log('Base de Datos no encontrada');
  process.exit(1);
}); // setup Express App


var app = (0, _express["default"])(); // Abro una instancia Express y la llamo app!

var server = require('http').createServer(app);

var io = require('socket.io')(server, {
  cors: {// origin: process.env.CORS_ORIGIN,
  }
});

var gameManager = new _GameManager["default"](io);
gameManager.setup(); //

var port = process.env.PORT || 3000; // Defino un Puerto a Usar por el Server.
// update Express Settings

app.use(_bodyParser["default"].urlencoded({
  extended: false
})); // parse application/x-www-form-urlencoded.

app.use(_bodyParser["default"].json()); // parse application/json

app.use((0, _cookieParser["default"])()); // Allow requests from other servers.

app.use((0, _cors["default"])()); // require  passport autho

require('./auth/auth'); // Game.html no quiero que sea publica sin un Token, la pongo antes de la carpeta public.


app.get('/game.html', _passport["default"].authenticate('jwt', {
  session: false
}), function (request, response) {
  response.status(200).json(request.user);
}); // Make folder public be aviable as public content

app.use(_express["default"]["static"]("".concat(__dirname, "/../public"))); // setup routes

app.use('/', _main["default"]);
app.use('/', _password["default"]);
app.use('/', _passport["default"].authenticate('jwt', {
  session: false
}), _secure["default"]);
app.get('/game.html', _passport["default"].authenticate('jwt', {
  session: false
}), function (request, response) {
  response.status(200).json(request.user);
}); // Make folder public be aviable as public content

app.use(_express["default"]["static"]("".concat(__dirname, "/../public"))); // setup routes

app.use('/', _main["default"]);
app.use('/', _password["default"]);
app.use('/', _passport["default"].authenticate('jwt', {
  session: false
}), _secure["default"]); // Catch all other routes. Use() catch all that wasn't catch by the upper code.

app.use(function (request, response) {
  response.status(404).json({
    message: '404 - Not Found',
    status: '404'
  });
}); // If a Error Pop ups from another End Point this middlewaer catch it!

app.use(function (error, request, response, next) {
  console.log(error);
  response.status(error.status || 500).json({
    error: error.message,
    status: '500'
  });
}); // server start listening when bd connection is establish.

_mongoose["default"].connection.on('connected', function () {
  console.log('connected to mongo');
  server.listen(port, function () {
    console.log("Server is Running in Port: ".concat(port));
  });
});
//# sourceMappingURL=index.js.map
