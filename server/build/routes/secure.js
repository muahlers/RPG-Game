"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _express = _interopRequireDefault(require("express"));

var _chatModel = _interopRequireDefault(require("../models/chatModel"));

// Creo una instancia de express para manejar rutas llamada Router.
var router = _express["default"].Router();

router.post('/chat', /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(request, response) {
    var email, message, chat;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(!request.body || !request.body.message)) {
              _context.next = 4;
              break;
            }

            response.status(400).json({
              message: 'invalid message',
              status: '400'
            });
            _context.next = 10;
            break;

          case 4:
            email = request.user.email; // const email = response.body.email.

            message = request.body.message;
            _context.next = 8;
            return _chatModel["default"].create({
              email: email,
              message: message
            });

          case 8:
            chat = _context.sent;
            response.status(200).json({
              message: ' message sent!',
              status: '200'
            });

          case 10:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;
//# sourceMappingURL=secure.js.map