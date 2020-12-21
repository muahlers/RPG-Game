import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import PlayerModel from './PlayerModel';
import Spawner from './Spawner';
import * as levelData from '../../public/assets/level/large_level.json';
import * as itemsData from '../../public/assets/level/tools.json';
import { SpawnerType } from './utils';
import ChatModel from '../models/chatModel';

export default class GameManager {
  constructor(io) {
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

  setup() {
    this.parseMapData();
    this.setupEventListener();
    this.setupSpawners();
  }

  parseMapData() {
    this.levelData = levelData;
    this.levelData.layers.forEach((layer) => {
      if (layer.name === 'player_locations') {
        layer.objects.forEach((obj) => {
          this.playerLocations.push([obj.x, obj.y]);
        });
      } else if (layer.name === 'chest_locations') {
        layer.objects.forEach((obj) => {
          if (this.chestLocations[obj.properties.spawner]) {
            this.chestLocations[obj.properties.spawner].push([obj.x, obj.y]);
          } else {
            this.chestLocations[obj.properties.spawner] = [[obj.x, obj.y]];
          }
        });
      } else if (layer.name === 'monster_locations') {
        layer.objects.forEach((obj) => {
          if (this.monsterLocations[obj.properties.spawner]) {
            this.monsterLocations[obj.properties.spawner].push([obj.x, obj.y]);
          } else {
            this.monsterLocations[obj.properties.spawner] = [[obj.x, obj.y]];
          }
        });
      }
    });
  }

  setupEventListener() {
    // Socket logic.
    this.io.on('connection', (socket) => {
      // Player disconnected.
      socket.on('disconnect', () => {
        // delete user data from server.
        delete this.players[socket.id];

        // emit a message to all players to delete this player.
        this.io.emit('desconectar', socket.id);
      });
      // New Player.
      socket.on('newPlayer', (token, frame) => {
        try {
          console.log('Sending Info to new Player: Players, Chests, Monsters');

          let name = uuidv4();

          if (process.env.BYPASS_AUTH !== 'ENABLED') {
            // validate token, if valid send game information, else reject login.
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // get player's name
            ({ name } = decoded.user);
          }
          // create a new Player
          console.log(`Player in Server: ${socket.id} frame: ${frame}`);
          this.spawnPlayer(socket.id, name, frame);
          console.log('Emitinig Current Players');
          // send the players objecto to the new player
          socket.emit('currentPlayers', this.players);
          console.log('Emitinig Current Monsters');
          // send the monsters objecto to the new player
          socket.emit('currentMonsters', this.monsters);
          console.log('Emitinig Current Chests');
          // send the chests objecto to the new player
          socket.emit('currentChests', this.chests);
          console.log('Emitinig Current Chests');
          // send the items objecto to the new player
          socket.emit('currentItems', this.items);
          console.log('Emitinig Broadcasting to others players');
          // inform the other players of the new player that joined.
          socket.broadcast.emit('spawnPlayer', this.players[socket.id], frame);
        } catch (error) {
          console.log(error);
          socket.emit('invalidToken');
        }
      });
      // Players move.
      socket.on('playerMovement', (playerData) => {
        if (this.players[socket.id]) {
          this.players[socket.id].x = playerData.x;
          this.players[socket.id].y = playerData.y;
          this.players[socket.id].flipX = playerData.flipX;
          this.players[socket.id].playerAttacking = playerData.playerAttacking;
          this.players[socket.id].currentDirection = playerData.currentDirection;
          // emita a message to all players about the player that move.
          this.io.emit('playerMoved', this.players[socket.id]);
        }
      });
      // Player Pick up Chest.
      socket.on('pickUpChest', (chestId) => {
        if (this.chests[chestId]) {
          const { gold } = this.chests[chestId];

          // updating the players gold
          this.players[socket.id].updateGold(gold);
          socket.emit('updateScore', this.players[socket.id].gold);
          socket.broadcast.emit('updatePlayersScore', socket.id, this.players[socket.id].gold);

          // removing the chest
          this.spawners[this.chests[chestId].spawnerId].removeObject(chestId);
        }
      });
      //  Player Pick up a Item.
      socket.on('pickUpItem', (itemId) => {
        if (this.items[itemId]) {
          if (this.players[socket.id].canPickUpItem()) {
            this.players[socket.id].addItem(this.items[itemId]);
            // Refresh Player Object in Game Scene.
            socket.emit('updateItems', this.players[socket.id]);
            // Refresh Player Object in others Players Game Scene.
            socket.broadcast.emit('updatePlayersItems', socket.id, this.players[socket.id]);

            // removing the item from GameManeger
            this.spawners[this.items[itemId].spawnerId].removeObject(itemId);
          }
        }
      });
      // Player Drop a Item.
      socket.on('playerDroppedItem', (itemId) => {
        this.players[socket.id].removeItem(itemId);
        // Refresh Player Object in Game Scene.
        socket.emit('updateItems', this.players[socket.id]);
        socket.broadcast.emit('updatePlayersItems', socket.id, this.players[socket.id]);
      });
      // A monster has been attacked, refresh.
      socket.on('monsterAttacked', (monsterId) => {
        // update the spawner
        if (this.monsters[monsterId]) {
          const { gold, attack } = this.monsters[monsterId];
          const playerAttackValue = this.players[socket.id].attack;

          // subtract health monster model
          this.monsters[monsterId].loseHealth(playerAttackValue);

          // check the monsters health, and if dead remove that object
          if (this.monsters[monsterId].health <= 0) {
            // updating the players gold
            this.players[socket.id].updateGold(gold);
            socket.emit('updateScore', this.players[socket.id].gold);

            // removing the monster
            this.spawners[this.monsters[monsterId].spawnerId].removeObject(monsterId);
            this.io.emit('monsterRemoved', monsterId);

            // add bonus health to the player
            this.players[socket.id].updateHealth(15);
            this.io.emit('updatePlayerHealth', socket.id, this.players[socket.id].health);
          } else {
            // update the players health
            this.players[socket.id].playerAttacked(attack);
            this.io.emit('updatePlayerHealth', socket.id, this.players[socket.id].health);

            // update the monsters health
            this.io.emit('updateMonsterHealth', monsterId, this.monsters[monsterId].health);

            // check the player's health, if below 0 have the player respawn
            if (this.players[socket.id].health <= 0) {
              // update the gold the player has
              this.players[socket.id].updateGold(parseInt(-this.players[socket.id].gold / 2, 10));
              socket.emit('updateScore', this.players[socket.id].gold);

              // respawn the player
              this.players[socket.id].respawn(this.players);
              this.io.emit('respawnPlayer', this.players[socket.id]);
              console.log('Respawn Death Player:');
            }
          }
        }
      });

      socket.on('attackedPlayer', (enemyPlayerId) => {
        if (this.players[enemyPlayerId]) {
          // get required information
          const { gold } = this.players[enemyPlayerId];
          const playerAttackValue = this.players[socket.id].attack;

          // substract health from attacked player
          this.players[enemyPlayerId].playerAttacked(playerAttackValue);

          // check iff enemy payer is dead, if it's give half gold to other player.
          if (this.players[enemyPlayerId].health < 1) {
            // give player half gold
            this.players[socket.id].updateGold(gold / 2);
            this.io.emit('updateScore', this.players[socket.id].gold);

            // respawn enemy player.
            this.players[enemyPlayerId].respawn(this.players);
            this.io.emit('respawnPlayer', this.players[enemyPlayerId]);

            // reset the attacked player gold
            this.players[enemyPlayerId].updateGold(-gold / 2);
            this.io.to(`${enemyPlayerId}`).emit('updateScore', this.players[enemyPlayerId].gold);

            // update player health
            this.io.emit('updatePlayerHealth', socket.id, this.players[socket.id].health);
          } else {
            this.io.emit('updatePlayerHealth', enemyPlayerId, this.players[enemyPlayerId].health);
          }
        }
      });

      socket.on('sendMessage', (message, token) => {
        try {
          let name = uuidv4();
          let email = '';
          if (process.env.BYPASS_AUTH !== 'ENABLED') {
            // validate token, if valid send game information, else reject login.
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // get player's name
            ({ name, email } = decoded.user);

            // store data in data base
            async (email, message) => {
              await ChatModel.create({ email, message });
            }
          }

          // emit message to all players
          this.io.emit('newMessage', {
            message,
            name,
            frame: this.players[socket.id].frame,
          });
        } catch (error) {
          console.log(error);
          socket.emit('invalidToken');
        }
      });
      // player connected to our game.
      console.log('Player connected to our game :)');
      console.log(`Socket ID: ${socket.id}`);
    });
  }

  setupSpawners() {
    const config = {
      spawnInterval: 6000,
      limit: 3,
      spawnerType: SpawnerType.CHEST,
      id: '',
    };
    let spawner;

    // create chest spawners
    Object.keys(this.chestLocations).forEach((key) => {
      config.id = `chest-${key}`;
      spawner = new Spawner(
        config,
        this.chestLocations[key],
        this.addChest.bind(this),
        this.deleteChest.bind(this),
      );
      this.spawners[spawner.id] = spawner;
    });

    // create monster spawners
    Object.keys(this.monsterLocations).forEach((key) => {
      config.id = `monster-${key}`;
      config.spawnerType = SpawnerType.MONSTER;

      spawner = new Spawner(
        config,
        this.monsterLocations[key],
        this.addMonster.bind(this),
        this.deleteMonster.bind(this),
        this.moveMonsters.bind(this),
      );
      this.spawners[spawner.id] = spawner;
    });

    // create item spawners
    config.id = 'item-1';
    config.spawnerType = SpawnerType.ITEM;
    config.limit = 3;
    config.spawnInterval = 1000 * 60 * 5;

    spawner = new Spawner(
      config,
      this.itemsLocations,
      this.addItem.bind(this),
      this.deleteItem.bind(this),
    );
    this.spawners[spawner.id] = spawner;
  }

  // Funciones para Spawner.
  addChest(chestId, chest) {
    console.log('chest Spawned: ', chestId);
    this.chests[chestId] = chest;
    this.io.emit('chestSpawned', chest);
  }

  deleteChest(chestId) {
    console.log('chest Removed: ', chestId);
    delete this.chests[chestId];
    this.io.emit('chestRemoved', chestId);
  }

  addItem(itemId, item) {
    console.log('item Added: ', itemId);
    this.items[itemId] = item;
    this.io.emit('itemSpawned', item);
  }

  deleteItem(itemId) {
    console.log('item Removed: ', itemId);
    delete this.items[itemId];
    this.io.emit('itemRemoved', itemId);
  }

  addMonster(monsterId, monster) {
    console.log('monster Spawned:', monsterId);
    this.monsters[monsterId] = monster;
    this.io.emit('monsterSpawned', monster);
  }

  deleteMonster(monsterId) {
    console.log('monster Removed :', monsterId);
    delete this.monsters[monsterId];
    this.io.emit('monsterRemoved', monsterId);
  }

  moveMonsters() {
    this.io.emit('monsterMovement', this.monsters);
  }

  spawnPlayer(playerId, name, frame) {
    const player = new PlayerModel(this.playerLocations, playerId, this.players, name, frame);
    this.players[playerId] = player;
    console.log(`New Player Spawned: ${playerId}`);
    console.log(player);
  }
}
