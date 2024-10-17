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

    perlinValues(tiles){
        let result = [];
        noise.seed(this.seed);

        for(let i = 0; i < 20 / SCALE; i++){
            result[i] = [];
            //result.bitmap[i] = [];
            for(let j = 0; j < 20 / SCALE; j++){
                //let bit = 0b0000;
                let pVal = Math.abs(noise.perlin2(i / this.sampleSize, j / this.sampleSize));
                pVal *= 10;

                noise.seed(this.seed / 2);
                let rand1 = Math.abs(noise.perlin2(i / this.sampleSize, j / this.sampleSize));
                noise.seed(this.seed / 3);
                let rand2 = Math.abs(noise.perlin2(i / this.sampleSize, j / this.sampleSize));

                // map pVals to tile textures                
                for(const tile of tiles){
                    if(pVal <= tile.height){
                        pVal = -1;
                        continue
                    }
                    else{ // does tile go in this height range?
                        if(tile.probability >= rand1){ // apply tile weight/probability
                            rand2 = Math.floor(rand2 * 10 * tile.texture.length);
                            pVal = tile.texture[Math.floor(rand2 % tile.texture.length)];
                        }
                        else pVal = -1; // put nothing
                        break;
                    }
                }

                //if(hasTransitions && pVal > 0){
                //    if(i > 0 && result.perlin[i-1][j] > -1){ // if current tile has a NORTH neighbor...
                //        // ...add it to current tile's bitmap value
                //        bit += N;      
                //        // ...and update north neighbor's bitmap value to reflect SOUTH neighbor (aka current tile)
                //        result.bitmap[i-1][j] += S;
                //    }
                //    if(j > 0 && result.perlin[i][j-1] > -1){ // if current tile has a WEST neighbor...
                //        // ...add it to current tile's bitmap value
                //        bit += W;  
                //        // ...and update north neighbor's bitmap value to reflect SOUTH neighbor (aka current tile)
                //        result.bitmap[i][j-1] += E;
                //    }  
                //}          

                //result.bitmap[i][j] = bit;
                //result.perlin[i][j] = pVal;
                result[i][j] = pVal;
            }
        }
        /// *** TODO: change pVal to correct transition tile using the bitvalue calculated.
        // also should probably make all of the bitmapping stuff its own fcn
        
        // 0    =   *none                   = -
        // 1    =   *top                    = -
        // 2    =   *left                   = -
        // 3    =   top and left            = 8     3 -> +4         ***
        // 4    =   *right                  = -     
        // 5    =   top and right           = 6     5 -> +2
        // 6    =   *left and right         = -
        // 7    =   left top and right      = 7     7 -> +3
        // 8    =   *bottom                 = -
        // 9    =   *top and bottom         = -
        // 10   =   left and bottom         = 2     10 -> -2
        // 11   =   top left and bottom     = 5     11 -> +1
        // 12   =   bottom and right        = 0     12 -> -4        
        // 13   =   top bottom and right    = 3     13 -> -1
        // 14   =   left bttom and right    = 1     14 -> -3
        // 15   =   all                     = 4     15 -> +0

        // temp solution -- can probably be more elegant than this

        //if(hasTransitions){
        //    for(let i = 0; i < 20 / SCALE; i++){
        //        for(let j = 0; j < 20 / SCALE; j++){
        //            if(result.perlin[i][j] > -1){
        //            switch(result.bitmap[i][j]){
        //                case 3:
        //                    result.perlin[i][j] += 18;
        //                    break;
        //                case 5:
        //                    result.perlin[i][j] += 16;
        //                    break;
        //                case 7:
        //                    result.perlin[i][j] += 17;
        //                    break;
        //                case 10:
        //                    result.perlin[i][j] -= 16;
        //                    break;
        //                case 11:
        //                    result.perlin[i][j] += 1;
        //                    break;
        //                case 12:
        //                    result.perlin[i][j] -= 18;
        //                    break;
        //                case 13:
        //                    result.perlin[i][j] -= 1;
        //                    break;
        //                case 14:
        //                    result.perlin[i][j] -= 17;
        //                    break;
        //                case 15:
        //                    result.perlin[i][j] += 0
        //                    break;
        //                default:
        //                    break;
        //            }}
        //        }
        //    }
        //}

        return result;
    }

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
        
        // 0    =   *none                   = -
        // 1    =   *top                    = -
        // 2    =   *left                   = -
        // 3    =   top and left            = 8     3 -> +4         ***
        // 4    =   *right                  = -     
        // 5    =   top and right           = 6     5 -> +2
        // 6    =   *left and right         = -
        // 7    =   left top and right      = 7     7 -> +3
        // 8    =   *bottom                 = -
        // 9    =   *top and bottom         = -
        // 10   =   left and bottom         = 2     10 -> -2
        // 11   =   top left and bottom     = 5     11 -> +1
        // 12   =   bottom and right        = 0     12 -> -4        
        // 13   =   top bottom and right    = 3     13 -> -1
        // 14   =   left bttom and right    = 1     14 -> -3
        // 15   =   all                     = 4     15 -> +0

        // temp solution -- can probably be more elegant than this
        for(let i = 0; i < 20 / SCALE; i++){
            for(let j = 0; j < 20 / SCALE; j++){
                if(pVals[i][j] > -1){
                switch(result[i][j]){
                    case 0: case 1: case 2: break;
                    case 3:
                        pVals[i][j] += 18;
                        break;
                    case 4: break;
                    case 5:
                        pVals[i][j] += 16;
                        break;
                    case 6: break;
                    case 7:
                        pVals[i][j] += 17;
                        break;
                    case 8: case 9: break;
                    case 10:
                        pVals[i][j] -= 16;
                        break;
                    case 11:
                        pVals[i][j] += 1;
                        break;
                    case 12:
                        pVals[i][j] -= 18;
                        break;
                    case 13:
                        pVals[i][j] -= 1;
                        break;
                    case 14:
                        pVals[i][j] -= 17;
                        break;
                    case 15: // pVals[i][j] += 0
                    default:
                        break;
                }}
            }
        }

        return result;
    }

    // helper fcn that returns an array of perlin-genrated values
    mapArray(tiles, hasTransitions){
        let result = {
            perlin: this.perlinValues(tiles),
            bitmap: []
        };

        if(hasTransitions){
            result.bitmap = this.bitmaskValues(result.perlin);
        }

        return result;
    }

    /* takes sample size, seed, and an array of objects: {height, texture, probability} */
    generateLayer(perlinValues, tileset){
        const map = this.make.tilemap({
            data: perlinValues.perlin,
            tileWidth: 64,
            tileHeight: 64,
        });
        console.log(perlinValues.bitmap)
        const tilesheet = map.addTilesetImage(tileset.name, tileset.key);
        const layer = map.createLayer(0, tilesheet, 0, 0)
        layer.setScale(SCALE);

        return layer;
    }

    // takes an array of layers and a tileset to regenerate each layer in the array 
    regenerate(layersArray, tileset){
        for(let x of layersArray){
            if(x) x.layer.destroy();  // dont need the old vesion "under" the new, delete to prevent lag
            x.layer = this.generateLayer(this.mapArray(x.key.textures, x.key.hasTransitions /* fix */), tileset);
        }
    }

    create() {
        this.sampleSize = 10;
        this.seed = Math.random();
        this.tileset = {
            name: "terrain",        // name of tileset when added to tiled
            key: "terrain-tiles"    // tilesheet key defined in load.js (or wherever)
        };

        this.snow = {
            textures: [{height: 5, texture: [this.SNOW], probability: 1,}],
            hasTransitions: true
        }
        this.rock = {
            textures: [{height: 4, texture: [this.ROCK], probability: 1}],
            hasTransitions: true
        }
        this.grass = {
            textures: [{height: 2.5, texture: [this.GRASS], probability: 1}],
            hasTransitions: true
        }
        this.sand = {
            textures: [{height: 1, texture: [this.SAND], probability: 1}],
            hasTransitions: true
        }
        this.water = {
            textures: [{height: -1, texture: [this.WATER], probability: 1}]
        }
        this.stuff = {
            textures: [
            {height: 5.5, texture: [this.SNOWMAN, this.SNOWTREE], probability: 0.1},
            {height: 5, texture: [this.SNOWTREE], probability: 0.1},
            {height: 4, texture: [this.SNOWTREE, this.BOULDER], probability: 0.1},
            {height: 3, texture: [this.BOULDER], probability: 0.05},
            {height: 2, texture: [this.TREE, this.BUSH], probability: 0.25},
            {height: -1, texture: [-1], probability: 1},
            ]
        }
        
        this.allLayers = [
            {key: this.water, layer: this.generateLayer(this.mapArray(this.water.textures, this.water.hasTransitions), this.tileset)},
            {key: this.sand, layer: this.generateLayer(this.mapArray(this.sand.textures, this.sand.hasTransitions), this.tileset)},
            {key: this.grass, layer: this.generateLayer(this.mapArray(this.grass.textures, this.grass.hasTransitions), this.tileset)},
            {key: this.rock, layer: this.generateLayer(this.mapArray(this.rock.textures, this.rock.hasTransitions), this.tileset)},
            {key: this.snow, layer: this.generateLayer(this.mapArray(this.snow.textures, this.snow.hasTransitions), this.tileset)},
            {key: this.stuff, layer: this.generateLayer(this.mapArray(this.stuff.textures, this.stuff.hasTransitions), this.tileset)}
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