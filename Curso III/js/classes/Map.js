class Map {
    constructor(scene, key, setTileName, backgroundLayerName, blockedLayerName) {
      this.scene = scene;
      this.key = key; // Tiled Json file key name
      this.setTileName = setTileName; // Tiled TileSet image key name
      this.backgroundLayerName = backgroundLayerName; // Tiled background layer key name
      this.blockedLayerName = blockedLayerName; // Tiled blocked Layer key name
      this.createMap();
    }

    createMap(){
        // create Tile MAP
        this.map = this.scene.make.tilemap({key: this.key});
        // add Tile set to the Map ("name of the layer", "key of tile set image","","". "margin spacing","margin spacing")
        this.tiles = this.map.addTilesetImage(this.backgroundLayerName, this.setTileName, 32, 32, 1, 2);
        // create our background layer *createSaticLayer('name of layer in Tiled'.loaded Tiles, x starting pos , y starting pos)
        this.backgroundLayer = this.map.createStaticLayer(this.backgroundLayerName, this.tiles, 0, 0);
        this.backgroundLayer.setScale(2);
        // create blocked Layer
        this.blockedLayer = this.map.createStaticLayer(this.blockedLayerName, this.tiles, 0, 0);
        this.blockedLayer.setScale(2);
        this.blockedLayer.setCollisionByExclusion([-1]);

        // update world Bounderies
        this.scene.physics.world.bounds.width = this.map.widthInPixels * 2;
        this.scene.physics.world.bounds.height = this.map.heightInPixels * 2;

        // limit camera to world bound
        this.scene.cameras.main.setBounds(0, 0,  this.map.widthInPixels * 2,this.map.heightInPixels * 2);
      }
}
