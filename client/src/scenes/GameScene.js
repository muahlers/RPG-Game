import * as Phaser from 'phaser';
import GameMap from '../classes/GameMap';
import PlayerContainer from '../classes/player/PlayerContainer';
import Chest from '../classes/Chest';
import Monster from '../classes/Monster';
import Item from '../classes/Item';
import { getCookie } from '../utils/utils';
import DialogWindow from '../classes/DialogWindow';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  init() {
    console.log('Inside Game Scene: init()');
    // Launch UI in parallel.
    this.scene.launch('Ui');
    // get a reference to our socket.
    this.socket = this.sys.game.globals.socket;
    // Listen for socket events.
    this.listenForSocketEvents();
    console.log(this.scene.settings);
    this.selectedCharacter = this.scene.settings.data.selectedCharacter || 0;
  }

  listenForSocketEvents() { // Connection with server logic.
    // NUEVO JUGADOR:
    // spawn main players game objects from server to new client.
    this.socket.on('currentPlayers', (players) => {
      console.log('Current Players:');
      console.log(players);

      // Identifico aljugador Principal.
      Object.keys(players).forEach((id) => {
        if (players[id].id === this.socket.id) {
          this.createPlayer(players[id], true);
          this.addCollisions();
          console.log(players[id]);
        } else {
          this.createPlayer(players[id], false);
        }
      });
    });
    // spawn monsters game objects from server to new client.
    this.socket.on('currentMonsters', (monsters) => {
      console.log('Current Monsters:');
      Object.keys(monsters).forEach((id) => {
        this.spawnMonster(monsters[id]);
      });
    });
    // spawn chests game objects from server to new client.
    this.socket.on('currentChests', (chests) => {
      console.log('Current Chests:');
      Object.keys(chests).forEach((id) => {
        this.spawnChest(chests[id]);
      });
    });
    // spawn items game objects from server to new client.
    this.socket.on('currentItems', (items) => {
      console.log('Current Items:');
      Object.keys(items).forEach((id) => {
        this.spawnItem(items[id]);
      });
    });
    // spawn new players game objects from server to other clients.
    this.socket.on('spawnPlayer', (player) => {
      console.log('Spwan New Player to all Servers:');
      this.createPlayer(player, false);
      console.log(player);
    });
    // Chests:
    // inform that a chest has been spawned.
    this.socket.on('chestSpawned', (chest) => {
      this.spawnChest(chest);
    });
    // inform that a chest has been removed.
    this.socket.on('chestRemoved', (chestId) => {
      this.chests.getChildren().forEach((chest) => {
        if (chest.id === chestId) {
          chest.makeInactive();
        }
      });
    });
    // Items:
    // inform a item has been spawned.
    this.socket.on('itemSpawned', (item) => {
      console.log(`item Spawned I${item.id}`);
      this.spawnItem(item);
      console.log('item Spawned II');
    });
    // inform a item has been removed.
    this.socket.on('itemRemoved', (itemId) => {
      this.items.getChildren().forEach((item) => {
        if (item.id === itemId) {
          item.makeInactive();
        }
      });
    });
    // Monsters:
    // inform that a monster has been spawned.
    this.socket.on('monsterSpawned', (monster) => {
      this.spawnMonster(monster);
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
            // monster.drawOrigin(monsters[monsterId].x, monsters[monsterId].y);
            this.physics.moveToObject(monster, monsters[monsterId], 80);
          }
        });
      });
    });
    // inform that a monster health has changed.
    this.socket.on('updateMonsterHealth', (monsterId, health) => {
      this.monsters.getChildren().forEach((monster) => {
        if (monster.id === monsterId) {
          monster.updateHealth(health);
        }
      });
    });
    // Players:
    // inform that player score has changed.
    this.socket.on('updateScore', (gold) => {
      this.events.emit('updateScore', gold);
      this.player.gold = gold;
    });
    // inform that other player has update his gold.
    this.socket.on('updatePlayersScore', (playerId, gold) => {
      this.otherPlayers.getChildren().forEach((otherPlayer) => {
        if (otherPlayer.id === playerId) {
          otherPlayer.gold = gold;
        }
      });
    });
    // inform that player has pick up an item.
    this.socket.on('updateItems', (playerObject) => {
      this.player.items = playerObject.playerItems;
      this.player.maxHealth = playerObject.maxHealth;
      this.player.attackValue = playerObject.attack;
      this.player.defenseValue = playerObject.defense;
      this.player.updateHealthBar();
    });
    // inform that other player has pick up an item.
    this.socket.on('updatePlayersItems', (playerId, playerObject) => {
      this.otherPlayers.getChildren().forEach((otherPlayer) => {
        if (playerId === otherPlayer.id) {
          otherPlayer.items = playerObject.playerItems;
          otherPlayer.maxHealth = playerObject.maxHealth;
          otherPlayer.attackValue = playerObject.attack;
          otherPlayer.defenseValue = playerObject.defense;
          otherPlayer.updateHealthBar();
        }
      });
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
    // Chat:
    this.socket.on('newMessage', (messageObject) => {
      this.dialogWindow.addNewMessage(messageObject);
    });
    // Security:
    // inform that the token as expire.
    this.socket.on('invalidToken', () => {
      if (BYPASS_AUTH !== 'ENABLED') {
        window.alert('Token is not longer valid,please login again.');
        window.location.reload();
      }
    });
  }

  create() {
    console.log('Inside Game Scene: create()');
    this.createMap();
    this.createAudio();
    this.createGroups();
    this.createInput();

    // create Dialog.
    console.log('create Chat');
    this.dialogWindow = new DialogWindow(this, {
      x: this.scale.width,
    });

    // emit event to server that a new player joined.
    let jwtCookie = '12345678';
    if (BYPASS_AUTH !== 'ENABLED') {
      jwtCookie = getCookie('jwt');
    }

    this.socket.emit('newPlayer', jwtCookie, this.selectedCharacter);

    // handles game resize.
    this.scale.on('resize', this.resize, this);
    // fix a bug.
    this.resize({ height: this.scale.height, width: this.scale.width });
    // add key down Event Listener.
    this.keyDownListener();
    // remove focus from chat input field.
    this.input.on('pointerdown', () => {
      document.getElementById('chatInput').blur();
    });

    console.log('Outside Game Scene: create()');
  }

  keyDownListener() {
    this.inputMessageField = document.getElementById('chatInput');
    console.log('Key Listener');
    console.log(this.inputMessageField);
    window.addEventListener('keydown', (event) => {
      // enter was pressed
      if (event.which === 13) {
        this.sendMessage();
      } else if (event.which === 32) {
        // space key was press.
        if (document.activeElement === this.inputMessageField) {
          this.inputMessageField.value = `${this.inputMessageField.value} `;
        }
      }
    });
  }

  sendMessage() {
    if (this.inputMessageField) {
      const message = this.inputMessageField.value;
      if (message) {
        this.inputMessageField.value = '';
        // TODO
        // this.socket.emit('sendMessage', message, getCookie('jwt'));
        this.socket.emit('sendMessage', message);
      }
    }
  }

  update() {
    // Update Dialog Window
    this.dialogWindow.update();

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
    // create a chest group.
    this.chests = this.physics.add.group();
    // create a item group.
    this.items = this.physics.add.group();
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
      playerObject.frame,
      playerObject.health,
      playerObject.maxHealth,
      playerObject.id,
      this.playerAttackAudio,
      mainPlayer,
      playerObject.playerName,
      playerObject.gold,
      playerObject.defense,
      playerObject.attack,
      playerObject.playerItems,
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

    newPlayer.setInteractive();
    newPlayer.on('pointerdown', () => {
      this.events.emit('showInventory', newPlayer, mainPlayer);
    });
  }

  addCollisions() {
    // check for collisions between the player and the tiled blocked layer
    this.physics.add.collider(this.player, this.gameMap.blockedLayer);
    // check for overlaps between player and chest game objects
    this.physics.add.overlap(this.player, this.chests, this.collectChest, null, this);
    // check for overlaps between player and items game objects
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
    // check for collisions between the monster group and the tiled blocked layer
    this.physics.add.collider(this.monsters, this.gameMap.blockedLayer);
    // check for collisions between the monster group and player.
    this.physics.add.collider(this.monsters, this.player, this.monsterAttack, null, this);
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

  spawnItem(itemObject) {
    let item = this.items.getFirstDead();
    if (!item) {
      item = new Item(this, itemObject.x * 2, itemObject.y * 2, 'tools', itemObject.frame, itemObject.id);
      // add item to items group.
      this.items.add(item);
    } else {
      item.id = itemObject.id;
      item.frame = itemObject.frame;
      item.setFrame(item.frame);
      item.setPosition(itemObject.x * 2, itemObject.y * 2);
      item.makeActive();
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
        monsterObject.xOrigin,
        monsterObject.yOrigin,
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

  monsterAttack(player, monster) {
    this.socket.emit('monsterAttackedPlayer', monster.id);
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

  collectItem(player, item) {
    this.socket.emit('pickUpItem', item.id);
  }

  resize(gameSize) {
    // Remember to Cut resize Listener if we change Secene.
    const { width, height } = gameSize;
    this.cameras.resize(width, height);
    this.dialogWindow.resize(gameSize);
  }

  sendDropItemMessage(itemId) {
    this.socket.emit('playerDroppedItem', itemId);
  }
}
