#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crea directory audio se non esiste
const audioDir = path.join(__dirname, '../../public/audio');
if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
}

// Lista delle chiavi audio (come in constants.js AUDIO_KEYS)
const audioKeys = [
    'theme',
    'invincible',
    'underground',
    'coin',
    'jump',
    'powerup',
    'stomp',
    'pipe',
    'flagpole',
    'gameover',
    'levelcomplete',
    'fireball'
];

// Funzione per creare un file OGG placeholder (header OggS minimale)
function createOGGPlaceholder() {
    // Header OggS minimale (vorbis comment empty)
    const oggHeader = Buffer.from([
        0x4f, 0x67, 0x67, 0x53, 0x00, 0x02, 0x00, 0x00, // OggS capture + version 0
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // granule position
        0x00, 0x00, 0x00, 0x00, // bitstream serial number
        0x00, 0x00, 0x00, 0x00, // page sequence number
        0x00, 0x00, 0x00, 0x00, // checksum
        0x01, // page segments
        0x00 // segment length (0 = empty packet)
    ]);
    return oggHeader;
}

// Funzione per creare un file MP3 placeholder (ID3 tag vuoto + frame silenzio)
function createMP3Placeholder() {
    // ID3v2 header (10 bytes)
    const id3Header = Buffer.from([
        0x49, 0x44, 0x33, // "ID3"
        0x03, 0x00, // version 2.3.0
        0x00, // flags
        0x00, 0x00, 0x00, 0x0A, // size 10 (syncsafe)
    ]);

    // Frame silenzio MP3 (32kbps, 1 canale, 1 frame)
    const mp3Frame = Buffer.from([
        0xFF, 0xFB, 0x90, 0x44, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00
    ]);

    return Buffer.concat([id3Header, mp3Frame]);
}

console.log('Generating placeholder audio files...');

audioKeys.forEach(key => {
    // Crea file .ogg
    const oggPath = path.join(audioDir, `${key}.ogg`);
    const oggData = createOGGPlaceholder();
    fs.writeFileSync(oggPath, oggData);
    console.log(`Created: ${oggPath} (${oggData.length} bytes)`);

    // Crea file .mp3
    const mp3Path = path.join(audioDir, `${key}.mp3`);
    const mp3Data = createMP3Placeholder();
    fs.writeFileSync(mp3Path, mp3Data);
    console.log(`Created: ${mp3Path} (${mp3Data.length} bytes)`);
});

console.log('All audio placeholder files generated.');
console.log('Note: In a real implementation, use actual NES audio files from open sources.');