export default class PlayerModel {
  constructor(playerId, spawnLocations, players, name, frame) {
    this.health = 10;
    this.maxHealth = 10;
    this.gold = 0;
    this.id = playerId;
    this.spawnLocations = spawnLocations;
    this.playerName = name;
    this.frame = frame;

    const location = this.spawnLocations[Math.floor(Math.random() * this.spawnLocations.length)];
    [this.x, this.y] = location;
  }

  updateGold(gold) {
    this.gold += gold;
  }

  updateHealth(health) {
    this.health += health;
    if (this.health > 10) this.health = 10;
  }

  respawn() {
    this.health = this.maxHealth;
    const location = this.spawnLocations[Math.floor(Math.random() * this.spawnLocations.length)];
    [this.x, this.y] = location;
  }
}
