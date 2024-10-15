class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
      this.load.setPath("./assets/");
      this.load.image("terrain-tiles", "mapPack_tilesheet.png");    // tile sheet   
      this.load.tilemapTiledJSON("map", "terrain map.json");                   // Load JSON of tilemap
   }

    create() {
        // pass to the next Scene
        this.scene.start("perlinMapScene");

        document.getElementById('description').innerHTML = 
            `<h2>press R to regenerate map<br>
            press < to decrease sample window<br>
            press > to increase sample window</h2>`
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}