class PerlinMap extends Phaser.Scene {
    constructor() {
        super("perlinMapScene");
    }

    preload(){ }

    /* init() 
    // defines tileset, texture indices in tileset, and groups tile data by type */
    init() {
        this.tileset = {
            name: "terrain",        // name of tileset when added to tiled
            key: "terrain-tiles"    // tilesheet key defined in load.js (or wherever)
        };

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

        // tile data
        this.snow = {
            tiles: [{height: 5, texture: [this.SNOW], probability: 1,}],
            hasTransitions: true
        }
        this.rock = {
            tiles: [{height: 4, texture: [this.ROCK], probability: 1}],
            hasTransitions: true
        }
        this.grass = {
            tiles: [{height: 2.5, texture: [this.GRASS], probability: 1}],
            hasTransitions: true
        }
        this.sand = {
            tiles: [{height: 1, texture: [this.SAND], probability: 1}],
            hasTransitions: true
        }
        this.water = {
            tiles: [{height: -1, texture: [this.WATER], probability: 1}]
        }
        this.stuff = {
            tiles: [
            {height: 5.5, texture: [this.SNOWMAN, this.SNOWTREE], probability: 0.1},
            {height: 5, texture: [this.SNOWTREE], probability: 0.15},
            {height: 4, texture: [this.SNOWTREE, this.BOULDER], probability: 0.1},
            {height: 3, texture: [this.BOULDER], probability: 0.01},
            {height: 2, texture: [this.TREE, this.BUSH], probability: 0.15},
            {height: -1, texture: [-1], probability: 1},
            ]
        }
    }

    /* perlinValue() -> helper fcn for mapArray() 
    // > takes an array of objects: {height, texture[], probability}
    // > generates an array of perlin values that are mapped to the tile indices provided by the param tiles 
    // > if tiles has multiple textures, will render randomly from the given array
    // > supports probablity weighting */
    perlinValues(tiles){
        let result = [];
        noise.seed(this.seed);

        for(let i = 0; i < 20 / SCALE; i++){
            result[i] = [];
            for(let j = 0; j < 20 / SCALE; j++){
                let pVal = Math.abs(noise.perlin2(i / this.sampleSize, j / this.sampleSize));
                pVal *= 10;

                // basing random values on perlin generation so that we can regenerate and rescale map with these same vals
                // rand1 used for probability check
                noise.seed(this.seed / 2);
                let rand1 = Math.abs(noise.perlin2(i / this.sampleSize, j / this.sampleSize));
                // rand2 used for picking random texture in tile.texture array
                noise.seed(this.seed / 3);
                let rand2 = Math.abs(noise.perlin2(i / this.sampleSize, j / this.sampleSize));

                // map pVals to tile textures                
                //for(const tile of tiles){
                for(let t = 0; t < tiles.length; t++){
                    let tile = tiles[t];

                   if(pVal > tile.height){
                        if(tile.probability >= rand1){ 
                            rand2 = Math.ceil(rand2 * 10 * tile.texture.length);
                            pVal = tile.texture[Math.ceil(rand2 % tile.texture.length)];
                        }
                        else pVal = -1;
                        break;
                   }
                   else{
                        if(tiles.length > 1 ) continue;
                        else {pVal = -1; break }
                   }
                }

                // check if pVal has a decimal place. if so, it was never mapped to a tile and thus should be empty
                let check = (pVal - Math.floor(pVal)) !== 0
                if(check) pVal = -1;

                result[i][j] = pVal;
            }
        }
        return result;
    }

    /* bitmaskValues() -> helper fcn for mapArray()
    // > parses neighborhood in the given array, generating an array with bitmasking for every index
    // > reference -> https://code.tutsplus.com/how-to-use-tile-bitmasking-to-auto-tile-your-level-layouts--cms-25673t */
    bitmaskValues(pVals){
        let result = [];
        // bits associates with directions for bitmap
        let N = 0b0001; // north
        let W = 0b0010; // west
        let E = 0b0100; // east
        let S = 0b1000; // south

        for(let i = 0; i < 20 / SCALE; i++){
            result[i] = [];
            for(let j = 0; j < 20 / SCALE; j++){
                let bit = 0b0000;
                let pVal = pVals[i][j];

                if(pVal > 0){
                    if(i > 0 && pVals[i-1][j] > -1){ // if current tile has a NORTH neighbor...
                        // ...add it to current tile's bitmap value
                        bit += N;      
                        // ...and update north neighbor's bitmap value to reflect SOUTH neighbor (aka current tile)
                        result[i-1][j] += S;
                    }
                    if(j > 0 && pVals[i][j-1] > -1){ // if current tile has a WEST neighbor...
                        // ...add it to current tile's bitmap value
                        bit += W;  
                        // ...and update north neighbor's bitmap value to reflect SOUTH neighbor (aka current tile)
                        result[i][j-1] += E;
                    }  
                }          

                result[i][j] = bit;
            }
        }

        return result;
    }

    /* applyTansitions() -> helper fcn for mapArray()
    // > returns an int to be added to a perlin value, corresponding to specific transition tiles 
    // > scalability note: the ints that are returned depend ENTIRELY on the tileset being used
    //      aka, if you change the tileset, all of these ints may need to be adjusted :(    */
    applyTransitions(bit){
        // temp solution -- can probably be more elegant than this
        switch(bit){
            //          // has neighbor(s) at...
            case 0:     // none
            case 1:     // N
            case 2:     // W
                return 0;       // temp
            case 3:     // N W
                return 18;
            case 4:     // E
                return 0;       // temp
            case 5:     // N E
                return 16;
            case 6:     // W E
                return 0;       // temp
            case 7:     // W N E
                return 17;
            case 8:     // S
            case 9:     // N S
                return 0;       // temp
            case 10:    // W S
                return -16;
            case 11:    // N W S
                return 1;
            case 12:    // S E
                return -18;
            case 13:    // N S E
                return -1;
            case 14:    // W S E
                return -17;
            case 15:    // all
            default:
                return 0;
        }
    }

    /* mapArray()
    // helper fcn that returns an array of perlin-genrated values
    // if hasTransitions is true, then will also bitmask initial perlin values
    //      and update perlin values to include transition tiles */
    mapArray(textureData){
        let result = {
            perlin: this.perlinValues(textureData.tiles), // make perlin array
            bitmask: []
        };

        if(textureData.hasTransitions){
            result.bitmask = this.bitmaskValues(result.perlin); // make bitmask array

            // adjust perlin array to reflect bitmask (aka apply tanstion tiles)
            for(let i = 0; i < 20 / SCALE; i++){
                for(let j = 0; j < 20 / SCALE; j++){
                    if(result.perlin[i][j] > -1){
                        result.perlin[i][j] += this.applyTransitions(result.bitmask[i][j]);
                    }
                }
            }
        }

        return result;
    }

    /* generateLayer()
    // > takes an array of values correspondnig to tile indices and a tileset 
    // > use array to build map data, use tileset to draw layer */
    generateLayer(mapValues, tileset){
        const map = this.make.tilemap({
            data: mapValues.perlin,
            tileWidth: 64,
            tileHeight: 64,
        });
        const tilesheet = map.addTilesetImage(tileset.name, tileset.key);
        const layer = map.createLayer(0, tilesheet, 0, 0)
        layer.setScale(SCALE);

        return layer;
    }

    /* regenerate()
    // takes an array of layers and a tileset to regenerate each layer in the array */ 
    regenerate(layersArray, tileset){
        for(let x of layersArray){
            if(x) x.layer.destroy();  // dont need the old vesion "under" the new, delete to prevent lag
            x.layer = this.generateLayer(this.mapArray(x.key /* fix */), tileset);
        }
    }

    /* create() 
    // handles sampleSize, seed, and layers init */
    create() {  
        this.sampleSize = 10;
        this.seed = 100 //Math.random();//////////

        this.allLayers = [
            {key: this.water, layer: this.generateLayer(this.mapArray(this.water), this.tileset)},
            {key: this.sand, layer: this.generateLayer(this.mapArray(this.sand), this.tileset)},
            {key: this.grass, layer: this.generateLayer(this.mapArray(this.grass), this.tileset)},
            {key: this.rock, layer: this.generateLayer(this.mapArray(this.rock), this.tileset)},
            {key: this.snow, layer: this.generateLayer(this.mapArray(this.snow), this.tileset)},
            {key: this.stuff, layer: this.generateLayer(this.mapArray(this.stuff), this.tileset)}
        ];

        // reload key
        this.reload = this.input.keyboard.addKey('R')
        this.sampleSmall = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.COMMA)
        this.sammpleLarge = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PERIOD)
    }

    /* update()
    // handles user input */
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