class GameManager {
    constructor(scene, mapData) {
        this.scene = scene;
        this.mapData = mapData;

        this.spawners = []; // keep track of existing spawners loacations
        this.chests = {};   // keep track of existing chests loacations

        this.playerLocations = [];
        this.chestLocations = {};
        this.monsterLocation = {};
    }

    setup() {
      this.parseMapData();
      this.setupEventListener();
      this.setupSpawners();
      this.spawnPlayer();
    }

      parseMapData(){

          this.mapData.forEach((layer) => { // Traspaso de los layers del mapa a mis propiedades de GameManager
              if(layer.name === 'player_locations') {  // Extraigo los arreglos de x,y de los objetos en el layer player_locations
                  layer.objects.forEach((obj) => {
                      this.playerLocations.push([obj.x, obj.y]);
                  });

              } else if(layer.name === 'chest_locations') { // Traspaso de los layers del mapa grupos de distintos chest locations. Ordenados por numero de sector.
                  layer.objects.forEach((obj) => {
                      if(this.chestLocations[obj.properties[0].value]) {
                          this.chestLocations[obj.properties[0].value].push([obj.x, obj.y]);
                      } else {
                          this.chestLocations[obj.properties[0].value] = [[obj.x, obj.y]];    // creo el sector si es que no existe.
                      }
                  });

              } else if (layer.name === 'monster_locations') {  // hago lo musmo que con los chests
                  layer.objects.forEach((obj) => {
                      if(this.monsterLocation[obj.properties[0].value]) {
                          this.monsterLocation[obj.properties[0].value].push([obj.x, obj.y]);
                      } else {
                          this.monsterLocation[obj.properties[0].value] = [[obj.x, obj.y]];
                      }
                  });
              }
          });
      }

      setupEventListener(){
        this.scene.events.on('pickUpChest', (chestId) => {
              // update spawner that owns this Chest
              if(this.chests[chestId]) {
                console.log(chestId);
                console.log(this.chests[chestId].spawnerId);

                

                //this.spawners[1].removeObject(chestId);
              }
        });
      }

      setupSpawners(){

          // create Chest spawners
          Object.keys(this.chestLocations).forEach((keys) => {
              const config = {
                    spawnInterval: 3000,       // 30 seg
                    limit: 3,
                    objectType: spawnerType.CHEST,
                    id: `chest-${keys}`,
              };

              const spawner = new Spawner(
                  config,
                  this.chestLocations[keys],
                  this.addChest.bind(this),
                  this.deleteChest.bind(this));

              this.spawners[keys] = spawner;
          });

          console.log(this.spawners);
      }

      addChest(chestId, chest){
          this.chests[chestId] = chest;
          this.scene.events.emit('spawnedChest', chest);
      }

      deleteChest(chestId){
          delete this.chests[chestId];
      }


      spawnPlayer(){

        const location = this.playerLocations[Math.floor(Math.random() * this.playerLocations.length)];
        this.scene.events.emit('spawnPlayer', location);

      }
  }
