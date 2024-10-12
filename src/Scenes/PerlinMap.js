class PerlinMap extends Phaser.Scene {
    constructor() {
        super("perlinMapScene");
    }

    preload(){ }

    init() {
        this.SNOW = 86;
        this.ROCK = 28;
        this.GRASS = 23;
        this.SAND = 91;
        this.WATER = 203;
    }

    generateMap(sample, seedVal){
        let perlinValues = [];
        noise.seed(seedVal);
        for(let i = 0; i < 20 / SCALE; i++){
            perlinValues[i] = [];
            for(let j = 0; j < 20 / SCALE; j++){
                let pVal = Math.abs(noise.perlin2(i / sample, j / sample));
                pVal *= 10;
                console.log (pVal)
                
                if(pVal > 5)        pVal = this.SNOW; 
                else if(pVal > 4)   pVal = this.ROCK; 
                else if(pVal > 2)   pVal = this.GRASS;
                else if(pVal > 1)   pVal = this.SAND;
                else                pVal = this.WATER;

                perlinValues[i][j] = pVal;  // be -1, 18, 23, or 28 only
            }
        }

        const map = this.make.tilemap({
            data: perlinValues,
            tileWidth: 64,
            tileHeight: 64,
        });

        const tilesheet = map.addTilesetImage("terrain", "terrain-tiles");
        const layer = map.createLayer(0, tilesheet, 0, 0)
        layer.setScale(SCALE);
    }

    create() {
        this.sampleSize = 10;
        this.seed = Math.random();
        this.generateMap(this.sampleSize, this.seed);

        // reload key
        this.reload = this.input.keyboard.addKey('R')
        this.sampleSmall = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT)
        this.sammpleLarge = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)
    }

    update() {
        // scene switching
        if(Phaser.Input.Keyboard.JustDown(this.reload)) {
            this.seed = Math.random();
            this.generateMap(this.sampleSize, this.seed);
        }
        // decrease sample size (larger this.sampleSize -> smaller fraction)
        if(Phaser.Input.Keyboard.JustDown(this.sampleSmall)) {
            this.sampleSize++;
            this.generateMap(this.sampleSize, this.seed);
        }
        // increase sample size
        if(Phaser.Input.Keyboard.JustDown(this.sammpleLarge)) {
            this.sampleSize--;
            this.generateMap(this.sampleSize, this.seed);
        }
    }
}