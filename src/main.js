// PLEASE SEE README FOR ASSETS CREDITS

// debug with extreme prejudice
"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    width: 800,
    height: 800,
    scene: [Load, PerlinMap]
}

const SCALE = 0.25;
const game = new Phaser.Game(config);