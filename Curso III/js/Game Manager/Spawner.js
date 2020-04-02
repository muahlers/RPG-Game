class Spawner {
    constructor(config, spawnLocations, addObject, deleteObject) {
        this.id = config.id;                          // id of the spawner.
        this.spawnInterval = config.spawnInterval;    // time betwen spawns
        this.limit = config.limit;                    //max number of objects created by this spawn
        this.objectType = config.objectType;          // type of object created by this spawn
        this.spawnLocations = spawnLocations;         // diferent locations this spawnwer can spawn
        this.addObject = addObject;                   // add a object spawned in the GameManager
        this.deleteObject = deleteObject;             // delete a object spawned in the GameManager

        this.objectCreated = [];                      // List of Objects created

        this.start();
    }

    start() {

      this.interval = setInterval(() => {
          if(this.objectCreated.length < this.limit) {
              this.spawnObject();
            }
          },this.spawnInterval);
    }

    spawnObject() {

      if(this.objectType === spawnerType.CHEST){
          this.spawnChest();
      }

    }

    spawnChest(){

      const location = this.pickRandomLocation();
      const chest = new ChestModel(location[0], location[1], randomNumber(10, 20), this.id);
      this.objectCreated.push(chest);
      this.addObject(chest.id, chest);
      console.log(chest);

    }

    pickRandomLocation(){

        const location = this.spawnLocations[Math.floor(Math.random() * this.spawnLocations.length)];
        const invalidLocation = this.objectCreated.some((obj) => {
            if(obj.x === location[0] && obj.y === location[1]) {
                return true;
            }
            return false;
        });

        if(invalidLocation) return this.pickRandomLocation();
        return location;

    }

    removeObject(id){

      this.objectCreated = this.objectCreated.filter(obj => obj.id !== id);
      this.deleteObject(id);  // paso informacion a Game Manager

    }

}
