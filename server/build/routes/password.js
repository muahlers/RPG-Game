"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _express = _interopRequireDefault(require("express"));

var _nodemailer = _interopRequireDefault(require("nodemailer"));

var _nodemailerExpressHandlebars = _interopRequireDefault(require("nodemailer-express-handlebars"));

var _path = _interopRequireDefault(require("path"));

var _crypto = _interopRequireDefault(require("crypto"));

var _userModel = _interopRequireDefault(require("../models/userModel"));

// Configuro Email Sender
var email = process.env.EMAIL_ACCOUNT;
var password = process.env.EMAIL_PASSWORD;

var stmpTransport = _nodemailer["default"].createTransport({
  service: process.env.EMAIL_PROVAIDER,
  auth: {
    user: email,
    pass: password
  }
});

var handlebarsOptions = {
  viewEngine: {
    extName: '.hbs',
    defaultLayout: null,
    partialsDEMAIL_PROVAIDERir: './templates/',
    layoutsDir: './templates'
  },
  viewPath: _path["default"].resolve('./templates/'),
  extName: '.html'
};
stmpTransport.use('compile', (0, _nodemailerExpressHandlebars["default"])(handlebarsOptions)); // Creo una instancia de express para manejar rutas llamada Router.

var router = _express["default"].Router(); // End point forget Password


router.post('/forget-password', /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(request, response, done) {
    var userEmail, user, buffer, token, emailOptions;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            userEmail = request.body.email;
            _context.next = 3;
            return _userModel["default"].findOne({
              email: userEmail
            });

          case 3:
            user = _context.sent;

            if (!user) {
              response.status(400).json({
                message: 'invalid email',
                status: '400'
              });
            } // Create & Update user reset token


            buffer = _crypto["default"].randomBytes(20);
            token = buffer.toString('hex');
            _context.next = 9;
            return _userModel["default"].findByIdAndUpdate({
              _id: user._id
            }, {
              resetToken: token,
              resetTokenExp: Date.now() + 60000
            });

          case 9:
            if (!(!request.body || !request.body.email)) {
              _context.next = 13;
              break;
            }

            response.status(400).json({
              message: 'invalid body',
              status: '400'
            });
            _context.next = 23;
            break;

          case 13:
            _context.prev = 13;
            // Send User a Email to reset password
            emailOptions = {
              to: userEmail,
              from: email,
              template: 'forgot-password',
              subject: 'Game Reset Password',
              // Aqui pongo las variables que van dentro del email
              context: {
                name: 'joe',
                url: "http://localhost:".concat(process.env.PORT || 3000, "/reset-password.html?token=").concat(token)
              }
            };
            _context.next = 17;
            return stmpTransport.sendMail(emailOptions);

          case 17:
            response.status(200).json({
              message: 'An email has been sent to your email address, Password reset link is only valid for 10 min',
              status: '200'
            });
            _context.next = 23;
            break;

          case 20:
            _context.prev = 20;
            _context.t0 = _context["catch"](13);
            return _context.abrupt("return", done(_context.t0));

          case 23:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[13, 20]]);
  }));

  return function (_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}()); // End point reser Password

router.post('/reset-password', /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(request, response, done) {
    var userEmail, user, emailOptions;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!request.body || !request.body.email || !request.body.password) {
              response.status(400).json({
                message: 'invalid email Or Password',
                status: '400'
              });
            }

            userEmail = request.body.email;
            user = _userModel["default"].findOne({
              resetToken: request.body.token,
              resetTokenExp: {
                $gt: Date.now()
              },
              // gt: greater than
              email: userEmail
            });

            if (!user) {
              response.status(400).json({
                message: 'invalid token',
                status: '400'
              });
            }

            if (!request.body.password || !request.body.verifiedPassword || request.body.password !== request.body.verifiedPassword) {
              response.status(400).json({
                message: 'Verified Password Not Match',
                status: '400'
              });
            } // update Database


            user.password = request.body.password;
            user.resetToken = undefined;
            user.resetTokenExp = undefined; // await user.save();

            _context2.prev = 8;
            // Send User a Email telling password updates
            emailOptions = {
              to: userEmail,
              from: email,
              template: 'reset-password',
              subject: 'Game Updated Password',
              // Aqui pongo las variables que van dentro del email
              context: {
                name: user.username
              }
            };
            _context2.next = 12;
            return stmpTransport.sendMail(emailOptions);

          case 12:
            response.status(200).json({
              message: 'password updated',
              status: '200'
            });
            _context2.next = 18;
            break;

          case 15:
            _context2.prev = 15;
            _context2.t0 = _context2["catch"](8);
            return _context2.abrupt("return", done(_context2.t0));

          case 18:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[8, 15]]);
  }));

  return function (_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;
//# sourceMappingURL=password.js.map