"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

// Extraigo la clase Schema de mongoose
var Schema = _mongoose["default"].Schema; // Creo un esquema para User

var ChatSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: false
  },
  message: {
    type: String,
    required: true
  }
});

var ChatModel = _mongoose["default"].model('chat', ChatSchema);

var _default = ChatModel;
exports["default"] = _default;
//# sourceMappingURL=chatModel.js.map