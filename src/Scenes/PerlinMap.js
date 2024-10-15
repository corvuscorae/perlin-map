class PerlinMap extends Phaser.Scene {
    constructor() {
        super("perlinMapScene");
    }

    preload(){ }

    init() {
        // terrain indices
        this.SNOW = 86;
        this.ROCK = 28;
        this.GRASS = 23;
        this.SAND = 91;
        this.WATER = 203;

        // stuff indices
        this.SNOWTREE = 123;
        this.SNOWMAN = 105;
        this.TREE = 43;
        this.BUSH = 59;
        this.BOULDER = 42;
    }

    // helper fcn that returns an array of perlin-genrated values
    makePerlinArray(tiles){
        let result = [];
        noise.seed(this.seed);

        for(let i = 0; i < 20 / SCALE; i++){
            result[i] = [];
            for(let j = 0; j < 20 / SCALE; j++){
                let pVal = Math.abs(noise.perlin2(i / this.sampleSize, j / this.sampleSize));
                pVal *= 10;

                noise.seed(this.seed / 2);
                let rand1 = Math.abs(noise.perlin2(i / this.sampleSize, j / this.sampleSize));
                noise.seed(this.seed / 3);
                let rand2 = Math.abs(noise.perlin2(i / this.sampleSize, j / this.sampleSize));

                // map pVals to tile textures                
                for(const tile of tiles){
                    if(pVal > tile.height){ // does tile go in this height range?
                        if(tile.probability >= rand1){ // apply tile weight/probability
                            rand2 = Math.floor(rand2 * 10 * tile.texture.length);
                            pVal = tile.texture[Math.floor(rand2 % tile.texture.length)];

                            ///*** TODO: transition tiles

                        }
                        else pVal = -1; // put nothing
                        break;
                    }
                    else continue;
                }

                result[i][j] = pVal; // put pVal (now a tile index) in array to be used in map
            }
        }

        return result;
    }

    /* takes sample size, seed, and an array of objects: {height, texture, probability} */
    generateLayer(perlinValues, tileset){
        const map = this.make.tilemap({
            data: perlinValues,
            tileWidth: 64,
            tileHeight: 64,
        });

        const tilesheet = map.addTilesetImage(tileset.name, tileset.key);
        const layer = map.createLayer(0, tilesheet, 0, 0)
        layer.setScale(SCALE);

        return layer;
    }

    // takes an array of layers and a tileset to regenerate each layer in the array 
    regenerate(layersArray, tileset){
        for(let x of layersArray){
            x.layer.destroy();  // dont need the old vesion "under" the new, delete to prevent lag
            x.layer = this.generateLayer(this.makePerlinArray(x.key), tileset);
        }
    }

    create() {
        this.sampleSize = 10;
        this.seed = Math.random();
        this.tileset = {
            name: "terrain",        // name of tileset when added to tiled
            key: "terrain-tiles"    // tilesheet key defined in load.js (or wherever)
        };

        this.terrain = [
            {height: 5, texture: [this.SNOW], probability: 1},
            {height: 4, texture: [this.ROCK], probability: 1},
            {height: 2.5, texture: [this.GRASS], probability: 1},
            {height: 1, texture: [this.SAND], probability: 1},
            {height: -1, texture: [this.WATER], probability: 1}, 
        ]
        this.stuff = [
            {height: 5.5, texture: [this.SNOWMAN, this.SNOWTREE], probability: 0.1},
            {height: 5, texture: [this.SNOWTREE], probability: 0.1},
            {height: 4, texture: [this.SNOWTREE, this.BOULDER], probability: 0.1},
            {height: 3, texture: [this.BOULDER], probability: 0.05},
            {height: 2, texture: [this.TREE, this.BUSH], probability: 0.25},
            {height: -1, texture: [-1], probability: 1},
        ]
        
        this.allLayers = [
            {key: this.terrain, layer: this.generateLayer(this.makePerlinArray(this.terrain), this.tileset)},
            {key: this.stuff, layer: this.generateLayer(this.makePerlinArray(this.stuff), this.tileset)}
        ];

        // reload key
        this.reload = this.input.keyboard.addKey('R')
        this.sampleSmall = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.COMMA)
        this.sammpleLarge = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PERIOD)
    }

    update() {
        // scene switching
        if(Phaser.Input.Keyboard.JustDown(this.reload)) {
            this.seed = Math.random();
            this.regenerate(this.allLayers, this.tileset);
        }
        // decrease sample size (larger this.sampleSize -> smaller fraction)
        if(Phaser.Input.Keyboard.JustDown(this.sampleSmall)) {
            this.sampleSize++;
            this.regenerate(this.allLayers, this.tileset);
        }
        // increase sample size
        if(Phaser.Input.Keyboard.JustDown(this.sammpleLarge)) {
            this.sampleSize--;
            this.regenerate(this.allLayers, this.tileset);
        }
    }
}