import ChestModel from './ChestModel';
import MonsterModel from './MonsterModel';
import ItemModel from './ItemModel';
import { SpawnerType, randomNumber } from './utils';
import * as itemsData from '../../public/assets/level/tools.json';

function getRandomValue() {
  const bonusValue = [-10, -7, -5, 0, 3, 5, 7, 10, 12, 15];
  return bonusValue[Math.floor(Math.random() * bonusValue.length)];
}

export default class Spawner {
  constructor(config, spawnLocations, addObject, deleteObject, moveObjects) {
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

  start() {
    this.interval = setInterval(() => {
      if (this.objectsCreated.length < this.limit) {
        this.spawnObject();
      }
    }, this.spawnInterval);
    if (this.objectType === SpawnerType.MONSTER) this.moveMonsters();
  }

  spawnObject() {
    if (this.objectType === SpawnerType.CHEST) {
      this.spawnChest();
    } else if (this.objectType === SpawnerType.MONSTER) {
      this.spawnMonster();
    } else if (this.objectType === SpawnerType.ITEM) {
      this.spawnItem();
    }
  }

  spawnItem() {
    const randomItem = itemsData.items[Math.floor(Math.random() * itemsData.items.length)];
    //const location = this.pickRandomLocation();
    const location = [150, 220];
    const item = new ItemModel(
      location[0], // x
      location[1], // y
      this.id, // itemId
      randomItem.name, // name
      randomItem.frame, // frame
      getRandomValue(), // attack
      getRandomValue(), // defense
      getRandomValue(), // health
    );
    this.objectsCreated.push(item);
    this.addObject(item.id, item);
  }

  spawnChest() {
    const location = this.pickRandomLocation();
    const chest = new ChestModel(location[0], location[1], randomNumber(10, 20), this.id);
    this.objectsCreated.push(chest);
    this.addObject(chest.id, chest);
  }

  spawnMonster() {
    const location = this.pickRandomLocation();
    const monster = new MonsterModel(
      location[0],
      location[1],
      randomNumber(10, 20),
      this.id,
      randomNumber(0, 20),
      randomNumber(100, 150),
      randomNumber(10, 20),
    );
    this.objectsCreated.push(monster);
    this.addObject(monster.id, monster);
  }

  pickRandomLocation() {
    const location = this.spawnLocations[Math.floor(Math.random() * this.spawnLocations.length)];
    const invalidLocation = this.objectsCreated.some((obj) => {
      if (obj.x === location[0] && obj.y === location[1]) {
        return true;
      }
      return false;
    });

    if (invalidLocation) return this.pickRandomLocation();
    return location;
  }

  removeObject(id) {
    this.objectsCreated = this.objectsCreated.filter((obj) => obj.id !== id);
    this.deleteObject(id);
  }

  moveMonsters() {
    this.moveMonsterInterval = setInterval(() => {
      this.objectsCreated.forEach((monster) => {
        monster.move();
      });

      this.moveObjects();
    }, 1000);
  }
}
