import { v4 as uuidv4 } from 'uuid';
import { randomNumber } from './utils';

export default class MonsterModel {
  constructor(x, y, gold, spawnerId, frame, health, attack) {
    this.id = `${spawnerId}-${uuidv4()}`;
    this.spawnerId = spawnerId;
    this.x = x * 2;
    this.y = y * 2;
    this.gold = gold;
    this.frame = frame;
    this.health = health;
    this.maxHealth = health;
    this.attack = attack;
    // Cordenantes where the monster appered.
    this.xOrigin = x * 2;
    this.yOrigin = y * 2;
    this.radius = 128;
  }

  loseHealth(attack) {
    this.health -= attack;
  }

  move() {
    const randomPosition = randomNumber(1, 8);
    const distance = 32;
    /*
    if (Math.sqrt(Math.power([this.x - this.xOrigin, 2]) + Math.power([this.y - this.yOrigin, 2]))  < this.radius) {
      switch (randomPosition) {
        case 1:
          this.x += distance;
          break;
        case 2:
          this.x -= distance;
          break;
        case 3:
          this.y += distance;
          break;
        case 4:
          this.y -= distance;
          break;
        case 5:
          this.x += distance;
          this.y += distance;
          break;
        case 6:
          this.x += distance;
          this.y -= distance;
          break;
        case 7:
          this.x -= distance;
          this.y += distance;
          break;
        case 8:
          this.x -= distance;
          this.y -= distance;
          break;
        default:
          break;
      }
    } */
  }
}
