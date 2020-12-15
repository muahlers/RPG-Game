"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _PlayerModel = _interopRequireDefault(require("./PlayerModel"));

var _Spawner = _interopRequireDefault(require("./Spawner"));

var levelData = _interopRequireWildcard(require("../../public/assets/level/large_level.json"));

var itemsData = _interopRequireWildcard(require("../../public/assets/level/tools.json"));

var _utils = require("./utils");

var _chatModel = _interopRequireDefault(require("../models/chatModel"));

var GameManager = /*#__PURE__*/function () {
  function GameManager(io) {
    (0, _classCallCheck2["default"])(this, GameManager);
    // socket logic connection.
    this.io = io;
    this.spawners = {};
    this.chests = {};
    this.monsters = {};
    this.items = {};
    this.players = {};
    this.playerLocations = [];
    this.chestLocations = {};
    this.monsterLocations = {};
    this.itemsLocations = itemsData.locations;
  }

  (0, _createClass2["default"])(GameManager, [{
    key: "setup",
    value: function setup() {
      this.parseMapData();
      this.setupEventListener();
      this.setupSpawners();
    }
  }, {
    key: "parseMapData",
    value: function parseMapData() {
      var _this = this;

      this.levelData = levelData;
      this.levelData.layers.forEach(function (layer) {
        if (layer.name === 'player_locations') {
          layer.objects.forEach(function (obj) {
            _this.playerLocations.push([obj.x, obj.y]);
          });
        } else if (layer.name === 'chest_locations') {
          layer.objects.forEach(function (obj) {
            if (_this.chestLocations[obj.properties.spawner]) {
              _this.chestLocations[obj.properties.spawner].push([obj.x, obj.y]);
            } else {
              _this.chestLocations[obj.properties.spawner] = [[obj.x, obj.y]];
            }
          });
        } else if (layer.name === 'monster_locations') {
          layer.objects.forEach(function (obj) {
            if (_this.monsterLocations[obj.properties.spawner]) {
              _this.monsterLocations[obj.properties.spawner].push([obj.x, obj.y]);
            } else {
              _this.monsterLocations[obj.properties.spawner] = [[obj.x, obj.y]];
            }
          });
        }
      });
    }
  }, {
    key: "setupEventListener",
    value: function setupEventListener() {
      var _this2 = this;

      // Socket logic.
      this.io.on('connection', function (socket) {
        // Player disconnected.
        socket.on('disconnect', function () {
          // delete user data from server.
          delete _this2.players[socket.id]; // emit a message to all players to delete this player.

          _this2.io.emit('desconectar', socket.id);
        }); // New Player.
        // socket.on('newPlayer', (token, frame) => {

        socket.on('newPlayer', function (frame) {
          try {
            console.log('Sending Info to new Player: Players, Chests, Monsters'); // validate token, if valid send game information, else reject login.
            // const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // get player's name
            // const { name } = decoded.user;

            var name = 'test'; // create a new Player

            console.log("Player in Server: ".concat(socket.id, " frame: ").concat(frame));

            _this2.spawnPlayer(socket.id, name, frame);

            console.log('Emitinig Current Players'); // send the players objecto to the new player

            socket.emit('currentPlayers', _this2.players);
            console.log('Emitinig Current Monsters'); // send the monsters objecto to the new player

            socket.emit('currentMonsters', _this2.monsters);
            console.log('Emitinig Current Chests'); // send the chests objecto to the new player

            socket.emit('currentChests', _this2.chests);
            console.log('Emitinig Current Chests'); // send the items objecto to the new player

            socket.emit('currentItems', _this2.items);
            console.log('Emitinig Broadcasting to others players'); // inform the other players of the new player that joined.

            socket.broadcast.emit('spawnPlayer', _this2.players[socket.id], frame);
          } catch (error) {
            console.log(error);
            socket.emit('invalidToken');
          }
        }); // Players move.

        socket.on('playerMovement', function (playerData) {
          if (_this2.players[socket.id]) {
            _this2.players[socket.id].x = playerData.x;
            _this2.players[socket.id].y = playerData.y;
            _this2.players[socket.id].flipX = playerData.flipX;
            _this2.players[socket.id].playerAttacking = playerData.playerAttacking;
            _this2.players[socket.id].currentDirection = playerData.currentDirection; // emita a message to all players about the player that move.

            _this2.io.emit('playerMoved', _this2.players[socket.id]);
          }
        }); // Player Pick up Chest.

        socket.on('pickUpChest', function (chestId) {
          if (_this2.chests[chestId]) {
            var gold = _this2.chests[chestId].gold; // updating the players gold

            _this2.players[socket.id].updateGold(gold);

            socket.emit('updateScore', _this2.players[socket.id].gold); // removing the chest

            _this2.spawners[_this2.chests[chestId].spawnerId].removeObject(chestId);
          }
        }); //  Player Pick up a Item.

        socket.on('pickUpItem', function (itemId) {
          if (_this2.items[itemId]) {
            if (_this2.players[socket.id].canPickUpItem()) {
              _this2.players[socket.id].addItem(_this2.items[itemId]); // Refresh Player Object in Game Scene.


              socket.emit('updateItems', _this2.players[socket.id]); // Refresh Player Object in others Players Game Scene.

              socket.broadcast('updatePlayersItems', socket.id, _this2.players[socket.id]); // removing the item from GameManeger

              _this2.spawners[_this2.item[itemId].spawnerId].removeObject(itemId);
            }
          }
        }); // A monster has been attacked, refresh.

        socket.on('monsterAttacked', function (monsterId) {
          // update the spawner
          if (_this2.monsters[monsterId]) {
            var _this2$monsters$monst = _this2.monsters[monsterId],
                gold = _this2$monsters$monst.gold,
                attack = _this2$monsters$monst.attack;
            var playerAttackValue = _this2.players[socket.id].attack; // subtract health monster model

            _this2.monsters[monsterId].loseHealth(playerAttackValue); // check the monsters health, and if dead remove that object


            if (_this2.monsters[monsterId].health <= 0) {
              // updating the players gold
              _this2.players[socket.id].updateGold(gold);

              socket.emit('updateScore', _this2.players[socket.id].gold); // removing the monster

              _this2.spawners[_this2.monsters[monsterId].spawnerId].removeObject(monsterId);

              _this2.io.emit('monsterRemoved', monsterId); // add bonus health to the player


              _this2.players[socket.id].updateHealth(15);

              _this2.io.emit('updatePlayerHealth', socket.id, _this2.players[socket.id].health);
            } else {
              // update the players health
              _this2.players[socket.id].playerAttacked(attack);

              _this2.io.emit('updatePlayerHealth', socket.id, _this2.players[socket.id].health); // update the monsters health


              _this2.io.emit('updateMonsterHealth', monsterId, _this2.monsters[monsterId].health); // check the player's health, if below 0 have the player respawn


              if (_this2.players[socket.id].health <= 0) {
                // update the gold the player has
                _this2.players[socket.id].updateGold(parseInt(-_this2.players[socket.id].gold / 2, 10));

                socket.emit('updateScore', _this2.players[socket.id].gold); // respawn the player

                _this2.players[socket.id].respawn(_this2.players);

                _this2.io.emit('respawnPlayer', _this2.players[socket.id]);

                console.log('Respawn Death Player:');
              }
            }
          }
        });
        socket.on('attackedPlayer', function (enemyPlayerId) {
          if (_this2.players[enemyPlayerId]) {
            // get required information
            var gold = _this2.players[enemyPlayerId].gold;
            var playerAttackValue = _this2.players[socket.id].attack; // substract health from attacked player

            _this2.players[enemyPlayerId].playerAttacked(playerAttackValue); // check iff enemy payer is dead, if it's give half gold to other player.


            if (_this2.players[enemyPlayerId].health < 1) {
              // give player half gold
              _this2.players[socket.id].updateGold(gold / 2);

              _this2.io.emit('updateScore', _this2.players[socket.id].gold); // respawn enemy player.


              _this2.players[enemyPlayerId].respawn(_this2.players);

              _this2.io.emit('respawnPlayer', _this2.players[enemyPlayerId]); // reset the attacked player gold


              _this2.players[enemyPlayerId].updateGold(-gold / 2);

              _this2.io.to("".concat(enemyPlayerId)).emit('updateScore', _this2.players[enemyPlayerId].gold); // update player health


              _this2.io.emit('updatePlayerHealth', socket.id, _this2.players[socket.id].health);
            } else {
              _this2.io.emit('updatePlayerHealth', enemyPlayerId, _this2.players[enemyPlayerId].health);
            }
          }
        }); // socket.on('sendMessage', (message, token) => {

        socket.on('sendMessage', /*#__PURE__*/function () {
          var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(message) {
            var name, email;
            return _regenerator["default"].wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    try {
                      // validate token, if valid send game information, else reject login.
                      // const decoded = jwt.verify(token, process.env.JWT_SECRET);
                      // get player's name
                      // const { name, email } = decoded.user;
                      name = 'test';
                      email = 'test@test.com'; // store data in data base
                      // await ChatModel.create({ email, message });
                      // emit message to all players

                      _this2.io.emit('newMessage', {
                        message: message,
                        name: name,
                        frame: _this2.players[socket.id].frame
                      });
                    } catch (error) {
                      console.log(error);
                      socket.emit('invalidToken');
                    }

                  case 1:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee);
          }));

          return function (_x) {
            return _ref.apply(this, arguments);
          };
        }()); // player connected to our game.

        console.log('Player connected to our game :)');
        console.log("Socket ID: ".concat(socket.id));
      });
    }
  }, {
    key: "setupSpawners",
    value: function setupSpawners() {
      var _this3 = this;

      var config = {
        spawnInterval: 3000,
        limit: 3,
        spawnerType: _utils.SpawnerType.CHEST,
        id: ''
      };
      var spawner; // create chest spawners

      Object.keys(this.chestLocations).forEach(function (key) {
        config.id = "chest-".concat(key);
        spawner = new _Spawner["default"](config, _this3.chestLocations[key], _this3.addChest.bind(_this3), _this3.deleteChest.bind(_this3));
        _this3.spawners[spawner.id] = spawner;
      }); // create monster spawners

      Object.keys(this.monsterLocations).forEach(function (key) {
        config.id = "monster-".concat(key);
        config.spawnerType = _utils.SpawnerType.MONSTER;
        spawner = new _Spawner["default"](config, _this3.monsterLocations[key], _this3.addMonster.bind(_this3), _this3.deleteMonster.bind(_this3), _this3.moveMonsters.bind(_this3));
        _this3.spawners[spawner.id] = spawner;
      }); // create item spawners

      config.id = 'item-1';
      config.spawnerType = _utils.SpawnerType.ITEM;
      spawner = new _Spawner["default"](config, this.itemsLocations, this.addItem.bind(this), this.deleteItem.bind(this));
      this.spawners[spawner.id] = spawner;
    } // Funciones para Spawner.

  }, {
    key: "addChest",
    value: function addChest(chestId, chest) {
      console.log('chest Spawned: ', chestId);
      this.chests[chestId] = chest;
      this.io.emit('chestSpawned', chest);
    }
  }, {
    key: "deleteChest",
    value: function deleteChest(chestId) {
      console.log('chest Removed: ', chestId);
      delete this.chests[chestId];
      this.io.emit('chestRemoved', chestId);
    }
  }, {
    key: "addItem",
    value: function addItem(itemId, item) {
      console.log('item Spawned: ', itemId);
      this.items[itemId] = item;
      this.io.emit('itemSpawned', item);
    }
  }, {
    key: "deleteItem",
    value: function deleteItem(itemId) {
      console.log('item Removed: ', itemId);
      delete this.items[itemId];
      this.io.emit('itemRemoved', itemId);
    }
  }, {
    key: "addMonster",
    value: function addMonster(monsterId, monster) {
      console.log('monster Spawned:', monsterId);
      this.monsters[monsterId] = monster;
      this.io.emit('monsterSpawned', monster);
    }
  }, {
    key: "deleteMonster",
    value: function deleteMonster(monsterId) {
      console.log('monster Removed :', monsterId);
      delete this.monsters[monsterId];
      this.io.emit('monsterRemoved', monsterId);
    }
  }, {
    key: "moveMonsters",
    value: function moveMonsters() {
      this.io.emit('monsterMovement', this.monsters);
    }
  }, {
    key: "spawnPlayer",
    value: function spawnPlayer(playerId, name, frame) {
      var player = new _PlayerModel["default"](this.playerLocations, playerId, this.players, name, frame);
      this.players[playerId] = player;
      console.log("New Player Spawned: ".concat(playerId));
      console.log(player);
    }
  }]);
  return GameManager;
}();

exports["default"] = GameManager;
//# sourceMappingURL=GameManager.js.map