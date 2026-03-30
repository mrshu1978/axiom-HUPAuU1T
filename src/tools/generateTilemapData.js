#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Leggi il file JSON
const tilemapPath = path.join(__dirname, '../../public/assets/tilemaps/world1-1.json');
const tilemap = JSON.parse(fs.readFileSync(tilemapPath, 'utf8'));

// Dimensioni: width=212, height=15
const width = 212;
const height = 15;
const totalTiles = width * height;

// Crea array di tile per ground layer (tile ID 1 = ground)
const groundData = new Array(totalTiles).fill(0);
// Riempi le ultime 2 righe con ground tile (ID 1)
for (let y = height - 2; y < height; y++) {
    for (let x = 0; x < width; x++) {
        // Crea qualche gap per pipe e pit
        if ((x >= 28 && x <= 29) || (x >= 38 && x <= 39) || (x >= 46 && x <= 47) || (x >= 57 && x <= 58)) {
            // Pipe area - no ground
            groundData[y * width + x] = 0;
        } else if (x >= 190 && x <= 200) {
            // Pit near end - no ground
            groundData[y * width + x] = 0;
        } else {
            groundData[y * width + x] = 1; // ground tile
        }
    }
}

// Crea array per platforms layer
const platformsData = new Array(totalTiles).fill(0);

// Platform pattern approssimativo World 1-1
// Question blocks at columns 16,20,22 (row 8)
platformsData[8 * width + 16] = 3; // question block
platformsData[8 * width + 20] = 3;
platformsData[8 * width + 22] = 3;

// Brick clusters at col 23-26 (row 8)
for (let x = 23; x <= 26; x++) {
    platformsData[8 * width + x] = 2; // brick
}

// Brick cluster at col 77-80 (row 5)
for (let x = 77; x <= 80; x++) {
    platformsData[5 * width + x] = 2;
}

// Brick at col 78 (row 8)
platformsData[8 * width + 78] = 2;

// Pipes (usiamo tile 5-8 per pipe parts)
// Pipe at col 28-29 (rows 10-13)
for (let y = 10; y <= 13; y++) {
    platformsData[y * width + 28] = 7; // pipe body left
    platformsData[y * width + 29] = 8; // pipe body right
}
platformsData[10 * width + 28] = 5; // pipe top left
platformsData[10 * width + 29] = 6; // pipe top right

// Pipe at col 38-39 (rows 9-13)
for (let y = 9; y <= 13; y++) {
    platformsData[y * width + 38] = 7;
    platformsData[y * width + 39] = 8;
}
platformsData[9 * width + 38] = 5;
platformsData[9 * width + 39] = 6;

// Pipe at col 46-47 (rows 8-13)
for (let y = 8; y <= 13; y++) {
    platformsData[y * width + 46] = 7;
    platformsData[y * width + 47] = 8;
}
platformsData[8 * width + 46] = 5;
platformsData[8 * width + 47] = 6;

// Pipe at col 57-58 (rows 8-13)
for (let y = 8; y <= 13; y++) {
    platformsData[y * width + 57] = 7;
    platformsData[y * width + 58] = 8;
}
platformsData[8 * width + 57] = 5;
platformsData[8 * width + 58] = 6;

// Castle tiles near end (col 203-206, rows 6-9)
for (let y = 6; y <= 9; y++) {
    for (let x = 203; x <= 206; x++) {
        platformsData[y * width + x] = 9; // castle block
    }
}

// Flagpole (col 198, rows 2-13)
for (let y = 2; y <= 13; y++) {
    platformsData[y * width + 198] = 10; // flagpole base
}
platformsData[2 * width + 198] = 11; // flag at top

// Converti array in base64 (little-endian 32-bit)
function arrayToBase64(arr) {
    const buffer = new ArrayBuffer(arr.length * 4);
    const view = new DataView(buffer);
    for (let i = 0; i < arr.length; i++) {
        view.setUint32(i * 4, arr[i], true);
    }
    return Buffer.from(buffer).toString('base64');
}

// Aggiorna i layer nel tilemap
tilemap.layers[0].data = arrayToBase64(groundData);
tilemap.layers[0].encoding = 'base64';

tilemap.layers[1].data = arrayToBase64(platformsData);
tilemap.layers[1].encoding = 'base64';

// Scrivi il file aggiornato
fs.writeFileSync(tilemapPath, JSON.stringify(tilemap, null, 2));
console.log(`Tilemap data generated and saved to ${tilemapPath}`);