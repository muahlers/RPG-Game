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
  }

  loseHealth(attack) {
    this.health -= attack;
  }

  move(xMax, yMax) {
    const randomPosition = randomNumber(1, 8);
    const distance = 32;

    switch (randomPosition) {
      case 1:
        if (this.x < xMax - distance) {
          this.x += distance;
        }
        break;
      case 2:
        if (this.x > 0 + distance) {
          this.x -= distance;
        }
        break;
      case 3:
        if (this.y < yMax - distance) {
          this.y += distance;
        }
        break;
      case 4:
        if (this.y > 0 + distance) {
          this.y -= distance;
        }
        break;
      case 5:
        if (this.x < xMax - distance && this.y < yMax - distance) {
          this.x += distance;
          this.y += distance;
        }
        break;
      case 6:
        if (this.x < xMax - distance && this.y > 0 + distance) {
          this.x += distance;
          this.y -= distance;
        }
        break;
      case 7:
        if (this.x > 0 + distance && this.y < yMax - distance) {
          this.x -= distance;
          this.y += distance;
        }
        break;
      case 8:
        if (this.x > 0 + distance && this.y > 0 + distance) {
          this.x -= distance;
          this.y -= distance;
        }
        break;
      default:
        break;
    }
  }
}
