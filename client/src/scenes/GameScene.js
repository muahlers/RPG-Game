import * as Phaser from 'phaser';
import GameMap from '../classes/GameMap';
import PlayerContainer from '../classes/player/PlayerContainer';
import Chest from '../classes/Chest';
import Monster from '../classes/Monster';
import { getCookie } from '../utils/utils';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  init() {
    // Launch UI in parallel.
    this.scene.launch('Ui');
    // get a reference to our socket.
    this.socket = this.sys.game.globals.socket;
    // Listen for socket events.
    this.listenForSocketEvents();
  }

  listenForSocketEvents() { // Connection with server logic.
    // spawn main players game objects from server to new client.
    this.socket.on('currentPlayers', (players) => {
      console.log('Current Players:');
      console.log(players);

      // Identifico aljugador Principal.
      Object.keys(players).forEach((id) => {
        if (players[id].id === this.socket.id) {
          this.createPlayer(players[id], true);
          this.addCollisions();
        } else {
          this.createPlayer(players[id], false);
        }
      });
    });
    // spawn monsters game objects from server to new client.
    this.socket.on('currentMonsters', (monsters) => {
      Object.keys(monsters).forEach((id) => {
        this.spawnMonster(monsters[id]);
      });
    });
    // spawn chests game objects from server to new client.
    this.socket.on('currentChests', (chests) => {
      Object.keys(chests).forEach((id) => {
        this.spawnChest(chests[id]);
      });
    });
    // spawn new players game objects from server to other clients.
    this.socket.on('spawnPlayer', (player) => {
      console.log('Spwan New Player to all Servers:');
      this.createPlayer(player, false);
      console.log(player);
    });
    // inform a player has moved.
    this.socket.on('playerMoved', (player) => {
      this.otherPlayers.getChildren().forEach((otherPlayer) => {
        if (player.id === otherPlayer.id) {
          otherPlayer.setPosition(player.x, player.y);
          otherPlayer.updateHealthBar();
          otherPlayer.updateFliX(player.flipX);
          otherPlayer.playerAttacking = player.playerAttacking;
          otherPlayer.currentDirection = player.currentDirection;
          if (player.playerAttacking) {
            otherPlayer.attack();
          }
        }
      });
    });
    // inform that a chest has been spawned.
    this.socket.on('chestSpawned', (chest) => {
      this.spawnChest(chest);
    });
    // inform that a monster has been spawned.
    this.socket.on('monsterSpawned', (monster) => {
      this.spawnMonster(monster);
    });
    // inform that a chest has been removed.
    this.socket.on('chestRemoved', (chestId) => {
      this.chests.getChildren().forEach((chest) => {
        if (chest.id === chestId) {
          chest.makeInactive();
        }
      });
    });
    // inform that a monster has been removed.
    this.socket.on('monsterRemoved', (monsterId) => {
      this.monsters.getChildren().forEach((monster) => {
        if (monster.id === monsterId) {
          monster.makeInactive();
          this.monsterDeathAudio.play();
        }
      });
    });
    // inform that a monster position has change.
    this.socket.on('monsterMovement', (monsters) => {
      this.monsters.getChildren().forEach((monster) => {
        Object.keys(monsters).forEach((monsterId) => {
          if (monster.id === monsterId) {
            this.physics.moveToObject(monster, monsters[monsterId], 60);
          }
        });
      });
    });
    // inform that player score has changed.
    this.socket.on('updateScore', (gold) => {
      this.events.emit('updateScore', gold);
    });
    // inform that player health has changed.
    this.socket.on('updatePlayerHealth', (playerId, health) => {
      if (this.player.id === playerId) {
        if (health < this.player.health) {
          this.playerDamageAudio.play();
        }
        this.player.updateHealth(health);
      } else {
        this.otherPlayers.getChildren().forEach((player) => {
          if (player.id === playerId) {
            player.updateHealth(health);
          }
        });
      }
    });
    // inform that a monster health has changed.
    this.socket.on('updateMonsterHealth', (monsterId, health) => {
      this.monsters.getChildren().forEach((monster) => {
        if (monster.id === monsterId) {
          monster.updateHealth(health);
        }
      });
    });
    // inform that player has to be respwned.
    this.socket.on('respawnPlayer', (objPlayer) => {
      if (this.player.id === objPlayer.id) {
        this.playerDeathAudio.play();
        this.player.respawn(objPlayer);
      } else {
        this.otherPlayers.getChildren().forEach((player) => {
          if (player.id === objPlayer.id) {
            this.player.respawn(player);
          }
        });
      }
    });
    // inform that a player has left the game.
    this.socket.on('desconectar', (playerId) => {
      this.otherPlayers.getChildren().forEach((player) => {
        if (player.id === playerId) {
          player.cleanUp();
        }
      });
    });
    // inform that the token as expire.
    this.socket.on('invalidToken', () => {
      // window.alert('Token is not longer valid,please login again.');
      // window.location.reload();
    });
  }

  create() {
    this.createMap();
    this.createAudio();
    this.createGroups();
    this.createInput();

    // emit event to server that a new player joined.
    console.log(`from Cookie: ${getCookie('jwt')}`);
    this.socket.emit('newPlayer', getCookie('jwt'));
  }

  update() {
    if (this.player) this.player.update(this.cursors);

    if (this.player) {
      const {
        x, y, flipX, playerAttacking, currentDirection,
      } = this.player;
      if (x !== this.player.oldPosition.x || y !== this.player.oldPosition.y
      || flipX !== this.player.oldPosition.flipX
      || playerAttacking !== this.player.oldPosition.playerAttacking) {
        // Emito señal que jugador se movio.
        this.socket.emit('playerMovement', {
          x, y, flipX, playerAttacking, currentDirection,
        });
        // Guardo la nueva posición del jugador.
        this.player.oldPosition = {
          x, y, flipX, playerAttacking, currentDirection,
        };
      }
    }
  }

  // Create Methods ////////////////////////////////

  createMap() {
    // create map
    this.gameMap = new GameMap(this, 'map', 'background', 'background', 'blocked');
  }

  createAudio() {
    this.goldPickupAudio = this.sound.add('goldSound', { loop: false, volume: 0.3 });
    this.playerAttackAudio = this.sound.add('playerAttack', { loop: false, volume: 0.01 });
    this.playerDamageAudio = this.sound.add('playerDamage', { loop: false, volume: 0.2 });
    this.playerDeathAudio = this.sound.add('playerDeath', { loop: false, volume: 0.2 });
    this.monsterDeathAudio = this.sound.add('enemyDeath', { loop: false, volume: 0.2 });
  }

  createGroups() {
    // create a chest group
    this.chests = this.physics.add.group();
    // create a monster group
    this.monsters = this.physics.add.group();
    this.monsters.runChildUpdate = true;
    // create an others player group.
    this.otherPlayers = this.physics.add.group();
    this.otherPlayers.runChildUpdate = true;
  }

  createInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  createPlayer(playerObject, mainPlayer) {
    const newPlayer = new PlayerContainer(
      this,
      playerObject.x * 2,
      playerObject.y * 2,
      'characters',
      0,
      playerObject.health,
      playerObject.maxHealth,
      playerObject.id,
      this.playerAttackAudio,
      mainPlayer,
    );

    if (!mainPlayer) {
      this.otherPlayers.add(newPlayer);
    } else {
      this.player = newPlayer;
      // save player postion in the world.
      this.player.oldPosition = {
        x: this.player.x,
        y: this.player.y,
        flipX: this.player.flipX,
      };
    }
  }

  addCollisions() {
    // check for collisions between the player and the tiled blocked layer
    this.physics.add.collider(this.player, this.gameMap.blockedLayer);
    // check for overlaps between player and chest game objects
    this.physics.add.overlap(this.player, this.chests, this.collectChest, null, this);
    // check for collisions between the monster group and the tiled blocked layer
    this.physics.add.collider(this.monsters, this.gameMap.blockedLayer);
    // check for overlaps between the player's weapon and monster game objects
    this.physics.add.overlap(this.player.weapon, this.monsters, this.enemyOverlap, null, this);
    // check for collisions between the player and other players in the game.
    this.physics.add.collider(this.player, this.otherPlayers, this.pvpCollider, null, this);
    // check for overlaps between the player's weapon and other player game objects.
    this.physics.add.overlap(
      this.player.weapon, this.otherPlayers, this.weaponOverlapEnemy, false, this,
    );
  }

  // /////////////////////////////////////////////

  spawnChest(chestObject) {
    let chest = this.chests.getFirstDead();
    if (!chest) {
      chest = new Chest(this, chestObject.x * 2, chestObject.y * 2, 'items', 0, chestObject.gold, chestObject.id);
      // add chest to chests group
      this.chests.add(chest);
    } else {
      chest.coins = chestObject.gold;
      chest.id = chestObject.id;
      chest.setPosition(chestObject.x * 2, chestObject.y * 2);
      chest.makeActive();
    }
  }

  spawnMonster(monsterObject) {
    let monster = this.monsters.getFirstDead();
    if (!monster) {
      monster = new Monster(
        this,
        monsterObject.x,
        monsterObject.y,
        'monsters',
        monsterObject.frame,
        monsterObject.id,
        monsterObject.health,
        monsterObject.maxHealth,
      );
      // add monster to monsters group
      this.monsters.add(monster);
    } else {
      monster.id = monsterObject.id;
      monster.health = monsterObject.health;
      monster.maxHealth = monsterObject.maxHealth;
      monster.setTexture('monsters', monsterObject.frame);
      monster.setPosition(monsterObject.x, monsterObject.y);
      monster.makeActive();
    }
  }

  pvpCollider(player, otherPlayer) {
    this.player.body.setVelocity(0);
    otherPlayer.body.setVelocity(0);
  }

  weaponOverlapEnemy(weapon, enemyPlayer) {
    if (this.player.playerAttacking && !this.player.swordHit) {
      this.player.swordHit = true;
      this.socket.emit('attackedPlayer', enemyPlayer.id);
    }
  }

  enemyOverlap(weapon, enemy) {
    if (this.player.playerAttacking && !this.player.swordHit) {
      this.player.swordHit = true;
      this.socket.emit('monsterAttacked', enemy.id);
    }
  }

  collectChest(player, chest) {
    // play gold pickup sound
    this.goldPickupAudio.play();
    this.socket.emit('pickUpChest', chest.id);
  }
}
