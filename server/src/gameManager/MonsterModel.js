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
    this.radius = 300;
    this.radiusPlayer = 400;
    this.canAttack = true;
  }

  loseHealth(attack) {
    this.health -= attack;
  }

  move(playersObject) {
    const distance = 50;
    let isPlayerNear = false;
    let playerNearId = [];
    let distPlayerToMonster = 10000000000;
    // Encuento Heroe mas cercano si es que hay!
    Object.keys(playersObject).forEach((player) => {
      const distPlayer = (this.x - playersObject[player].x) ** 2
       + (this.y - playersObject[player].y) ** 2;
      if (distPlayer < this.radiusPlayer ** 2) {
        isPlayerNear = true;
        if (distPlayerToMonster > distPlayer) {
          distPlayerToMonster = distPlayer;
          playerNearId = player;
        }
      }
    });
    // Ejecuto tipo de Movimiento.
    if (isPlayerNear) {
      this.moveToPlayer(playersObject[playerNearId], distance);
    } else {
      this.moveAround(distance);
    }
  }

  moveToPlayer(player, distance) {
    const xMinDistance = Math.min(distance, Math.abs(this.x - player.x));
    const yMinDistance = Math.min(distance, Math.abs(this.y - player.y));
    if (this.x > player.x) {
      if (this.y > player.y) {
        this.x -= xMinDistance;
        this.y -= yMinDistance;
        console.log('-x,-y');
      } else {
        this.x -= xMinDistance;
        this.y += yMinDistance;
        console.log('-x,+y');
      }
    } else if (this.y > player.y) {
      this.x += xMinDistance;
      this.y -= yMinDistance;
      console.log('+x,-y');
    } else {
      this.x += xMinDistance;
      this.y += yMinDistance;
      console.log('+x,+y');
    }
  }

  moveAround(distance) {
    const randomPosition = randomNumber(1, 8);
    const distOrigin = (this.x - this.xOrigin) ** 2
     + (this.y - this.yOrigin) ** 2;

    // Veo si el Monstruo esta dentro de su radio de movimiento.
    if (distOrigin < this.radius ** 2) {
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
    } else { // Monstruo si Sale del Radio de Movimineto.
      let xdistance = 1;
      let ydistance = 1;

      if (this.xOrigin - this.x < 0) xdistance = -1;
      if (this.yOrigin - this.y < 0) ydistance = -1;

      this.x += distance * xdistance;
      this.y += distance * ydistance;
    }
  }

  attackPlayer() {
    if (this.canAttack) {
      /* const timer = setTimeout(() => {
        this.canAttack = true;
      }, 1000); */
      this.canAttack = false;
      return this.attack;
    }
    return 0;
  }
}
