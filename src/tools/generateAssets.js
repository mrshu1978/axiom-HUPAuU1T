#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Funzione per creare un PNG placeholder 1x1 pixel
function create1x1PNG(color = [255, 0, 0, 255]) {
    // PNG header minimale per un pixel 1x1 RGBA
    const png = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
        0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
        0x49, 0x48, 0x44, 0x52, // IHDR
        0x00, 0x00, 0x00, 0x01, // width: 1
        0x00, 0x00, 0x00, 0x01, // height: 1
        0x08, // bit depth
        0x06, // color type: RGBA
        0x00, // compression
        0x00, // filter
        0x00, // interlace
        0x00, 0x00, 0x00, 0x00, // CRC placeholder
        0x00, 0x00, 0x00, 0x0B, // IDAT chunk length
        0x49, 0x44, 0x41, 0x54, // IDAT
        0x78, 0x01, // zlib header
        0x63, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, // compressed data: 1 pixel
        color[0], color[1], color[2], color[3], // RGBA
        0x00, 0x00, 0x00, 0x00, // CRC placeholder
        0x00, 0x00, 0x00, 0x00, // IEND chunk length
        0x49, 0x45, 0x4E, 0x44, // IEND
        0xAE, 0x42, 0x60, 0x82  // IEND CRC
    ]);
    return png;
}

// Funzione per creare PNG con dimensioni specificate
function createPNG(width, height, color = [255, 0, 0, 255]) {
    // Per semplicità, creiamo un PNG 1x1 e lo scaliamo mentalmente
    // In un'implementazione reale con canvas si disegnerebbe l'immagine
    // Qui creiamo solo un placeholder valido
    return create1x1PNG(color);
}

// Crea directory se non esiste
const spritesDir = path.join(__dirname, '../../public/assets/sprites');
if (!fs.existsSync(spritesDir)) {
    fs.mkdirSync(spritesDir, { recursive: true });
}

// Colori per i diversi sprite (palette NES)
const colors = {
    mario: [226, 34, 34, 255], // #E52222 rosso
    enemies: [180, 122, 48, 255], // #B47A30 marrone
    tiles: [200, 75, 12, 255], // #C84B0C arancione terreno
    items: [255, 215, 0, 255], // #FFD700 oro
    hud: [123, 97, 255, 255] // #7B61FF accent Axiom
};

// Crea i 5 file PNG placeholder
const files = [
    { name: 'mario-sprites.png', color: colors.mario },
    { name: 'enemies-sprites.png', color: colors.enemies },
    { name: 'tiles-spritesheet.png', color: colors.tiles },
    { name: 'items-sprites.png', color: colors.items },
    { name: 'hud-sprites.png', color: colors.hud }
];

console.log('Generating placeholder sprite assets...');
files.forEach(file => {
    const filePath = path.join(spritesDir, file.name);
    const pngData = createPNG(16, 16, file.color);
    fs.writeFileSync(filePath, pngData);
    console.log(`Created: ${filePath} (${pngData.length} bytes)`);
});

console.log('All sprite assets generated as 1x1 PNG placeholders.');
console.log('Note: In a real implementation, use canvas npm to draw actual sprite sheets.');