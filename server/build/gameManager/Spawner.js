"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _ChestModel = _interopRequireDefault(require("./ChestModel"));

var _MonsterModel = _interopRequireDefault(require("./MonsterModel"));

var _ItemModel = _interopRequireDefault(require("./ItemModel"));

var _utils = require("./utils");

var itemsData = _interopRequireWildcard(require("../../public/assets/level/tools.json"));

function getRandomValue() {
  var bonusValue = [-10, -7, -5, 0, 3, 5, 7, 10, 12, 15];
  return bonusValue[Math.floor(Math.random() * bonusValue.length)];
}

var Spawner = /*#__PURE__*/function () {
  function Spawner(config, spawnLocations, addObject, deleteObject, moveObjects) {
    (0, _classCallCheck2["default"])(this, Spawner);
    this.id = config.id;
    this.spawnInterval = config.spawnInterval;
    this.limit = config.limit;
    this.objectType = config.spawnerType;
    this.spawnLocations = spawnLocations;
    this.addObject = addObject;
    this.deleteObject = deleteObject;
    this.moveObjects = moveObjects;
    this.objectsCreated = [];
    this.start();
  }

  (0, _createClass2["default"])(Spawner, [{
    key: "start",
    value: function start() {
      var _this = this;

      this.interval = setInterval(function () {
        if (_this.objectsCreated.length < _this.limit) {
          _this.spawnObject();
        }
      }, this.spawnInterval);
      if (this.objectType === _utils.SpawnerType.MONSTER) this.moveMonsters();
    }
  }, {
    key: "spawnObject",
    value: function spawnObject() {
      if (this.objectType === _utils.SpawnerType.CHEST) {
        this.spawnChest();
      } else if (this.objectType === _utils.SpawnerType.MONSTER) {
        this.spawnMonster();
      } else if (this.objectType === _utils.SpawnerType.ITEM) {
        this.spawnItem();
      }
    }
  }, {
    key: "spawnItem",
    value: function spawnItem() {
      var randomItem = itemsData.items[Math.floor(Math.random() * itemsData.items.length)]; //const location = this.pickRandomLocation();

      var location = [150, 220];
      var item = new _ItemModel["default"](location[0], // x
      location[1], // y
      this.id, // itemId
      randomItem.name, // name
      randomItem.frame, // frame
      getRandomValue(), // attack
      getRandomValue(), // defense
      getRandomValue());
      this.objectsCreated.push(item);
      this.addObject(item.id, item);
    }
  }, {
    key: "spawnChest",
    value: function spawnChest() {
      var location = this.pickRandomLocation();
      var chest = new _ChestModel["default"](location[0], location[1], (0, _utils.randomNumber)(10, 20), this.id);
      this.objectsCreated.push(chest);
      this.addObject(chest.id, chest);
    }
  }, {
    key: "spawnMonster",
    value: function spawnMonster() {
      var location = this.pickRandomLocation();
      var monster = new _MonsterModel["default"](location[0], location[1], (0, _utils.randomNumber)(10, 20), this.id, (0, _utils.randomNumber)(0, 20), (0, _utils.randomNumber)(100, 150), (0, _utils.randomNumber)(10, 20));
      this.objectsCreated.push(monster);
      this.addObject(monster.id, monster);
    }
  }, {
    key: "pickRandomLocation",
    value: function pickRandomLocation() {
      var location = this.spawnLocations[Math.floor(Math.random() * this.spawnLocations.length)];
      var invalidLocation = this.objectsCreated.some(function (obj) {
        if (obj.x === location[0] && obj.y === location[1]) {
          return true;
        }

        return false;
      });
      if (invalidLocation) return this.pickRandomLocation();
      return location;
    }
  }, {
    key: "removeObject",
    value: function removeObject(id) {
      this.objectsCreated = this.objectsCreated.filter(function (obj) {
        return obj.id !== id;
      });
      this.deleteObject(id);
    }
  }, {
    key: "moveMonsters",
    value: function moveMonsters() {
      var _this2 = this;

      this.moveMonsterInterval = setInterval(function () {
        _this2.objectsCreated.forEach(function (monster) {
          monster.move();
        });

        _this2.moveObjects();
      }, 1000);
    }
  }]);
  return Spawner;
}();

exports["default"] = Spawner;
//# sourceMappingURL=Spawner.js.map