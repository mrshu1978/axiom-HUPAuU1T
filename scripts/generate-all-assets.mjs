import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function crc32(buf) {
  let c = 0xffffffff;
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let v = n;
    for (let k = 0; k < 8; k++) v = v & 1 ? 0xedb88320 ^ (v >>> 1) : v >>> 1;
    table[n] = v;
  }
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function createPNG(width, height, pixels) {
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0;
    for (let x = 0; x < width; x++) {
      const si = (y * width + x) * 4;
      const di = y * (1 + width * 4) + 1 + x * 4;
      raw[di] = pixels[si]; raw[di+1] = pixels[si+1]; raw[di+2] = pixels[si+2]; raw[di+3] = pixels[si+3];
    }
  }
  const deflated = zlib.deflateSync(raw);
  const sig = Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]);
  function chunk(type, data) {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const t = Buffer.from(type);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
    return Buffer.concat([len, t, data, crc]);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', deflated), chunk('IEND', Buffer.alloc(0))]);
}

function drawRect(pixels, w, x, y, rw, rh, r, g, b, a = 255) {
  for (let dy = 0; dy < rh; dy++) for (let dx = 0; dx < rw; dx++) {
    const i = ((y+dy)*w + (x+dx)) * 4;
    pixels[i] = r; pixels[i+1] = g; pixels[i+2] = b; pixels[i+3] = a;
  }
}

function drawPixel(pixels, w, x, y, r, g, b, a = 255) {
  const i = (y * w + x) * 4;
  pixels[i] = r; pixels[i+1] = g; pixels[i+2] = b; pixels[i+3] = a;
}

function drawMarioFrame(pixels, w, fx, fy, state, pose) {
  const skin = [255, 200, 150]; const red = [200, 30, 30]; const blue = [30, 30, 200];
  const brown = [139, 90, 43]; const white = [255, 255, 255]; const green = [30, 180, 30];
  const hat = state === 'fire' ? white : red;
  const shirt = state === 'fire' ? red : red;
  const pants = state === 'fire' ? green : blue;

  if (pose === 'dead') {
    drawRect(pixels, w, fx+4, fy+2, 8, 4, ...skin); drawRect(pixels, w, fx+3, fy+0, 10, 2, ...hat);
    drawRect(pixels, w, fx+5, fy+6, 6, 4, ...shirt); drawRect(pixels, w, fx+4, fy+10, 8, 4, ...pants);
    drawPixel(pixels, w, fx+5, fy+4, 0, 0, 0); drawPixel(pixels, w, fx+9, fy+4, 0, 0, 0);
    drawPixel(pixels, w, fx+6, fy+5, 0, 0, 0); drawPixel(pixels, w, fx+7, fy+5, 0, 0, 0); drawPixel(pixels, w, fx+8, fy+5, 0, 0, 0);
    return;
  }
  drawRect(pixels, w, fx+4, fy+0, 8, 3, ...hat);
  drawRect(pixels, w, fx+4, fy+3, 8, 3, ...skin);
  drawPixel(pixels, w, fx+5, fy+3, 0, 0, 0); drawPixel(pixels, w, fx+9, fy+3, 0, 0, 0);
  drawRect(pixels, w, fx+3, fy+6, 10, 4, ...shirt);
  drawRect(pixels, w, fx+6, fy+7, 4, 2, ...skin);
  if (pose === 'walk1' || pose === 'walk3') {
    drawRect(pixels, w, fx+3, fy+10, 4, 4, ...pants); drawRect(pixels, w, fx+9, fy+10, 4, 4, ...pants);
    drawRect(pixels, w, fx+3, fy+14, 4, 2, ...brown); drawRect(pixels, w, fx+9, fy+14, 4, 2, ...brown);
  } else if (pose === 'walk2') {
    drawRect(pixels, w, fx+5, fy+10, 6, 4, ...pants);
    drawRect(pixels, w, fx+5, fy+14, 6, 2, ...brown);
  } else if (pose === 'jump') {
    drawRect(pixels, w, fx+2, fy+10, 4, 3, ...pants); drawRect(pixels, w, fx+10, fy+10, 4, 3, ...pants);
    drawRect(pixels, w, fx+2, fy+13, 4, 2, ...brown); drawRect(pixels, w, fx+10, fy+8, 4, 2, ...brown);
  } else if (pose === 'skid') {
    drawRect(pixels, w, fx+3, fy+10, 5, 4, ...pants); drawRect(pixels, w, fx+8, fy+10, 5, 4, ...pants);
    drawRect(pixels, w, fx+2, fy+14, 5, 2, ...brown); drawRect(pixels, w, fx+9, fy+14, 5, 2, ...brown);
  } else {
    drawRect(pixels, w, fx+4, fy+10, 8, 4, ...pants);
    drawRect(pixels, w, fx+4, fy+14, 3, 2, ...brown); drawRect(pixels, w, fx+9, fy+14, 3, 2, ...brown);
  }
}

// Mario spritesheet: 7 cols x 4 rows = 28 frames (16x16 each) → 112x64
function generateMario() {
  const w = 112, h = 64;
  const pixels = Buffer.alloc(w * h * 4);
  const poses = ['idle', 'walk1', 'walk2', 'walk3', 'jump', 'skid', 'dead'];
  const states = ['small', 'small', 'super', 'fire'];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 7; col++) {
      drawMarioFrame(pixels, w, col*16, row*16, states[row], poses[col]);
    }
  }
  return createPNG(w, h, pixels);
}

function drawGoomba(pixels, w, fx, fy, frame) {
  const brown = [160, 90, 40]; const darkBrown = [100, 50, 20]; const tan = [220, 180, 130];
  if (frame === 2) { drawRect(pixels, w, fx+2, fy+10, 12, 6, ...darkBrown); return; }
  drawRect(pixels, w, fx+3, fy+0, 10, 6, ...brown);
  drawRect(pixels, w, fx+2, fy+6, 12, 5, ...brown);
  drawPixel(pixels, w, fx+4, fy+4, 0, 0, 0); drawPixel(pixels, w, fx+10, fy+4, 0, 0, 0);
  drawRect(pixels, w, fx+5, fy+7, 6, 2, ...tan);
  if (frame === 0) { drawRect(pixels, w, fx+2, fy+11, 5, 5, ...darkBrown); drawRect(pixels, w, fx+9, fy+11, 5, 5, ...darkBrown); }
  else { drawRect(pixels, w, fx+3, fy+11, 4, 5, ...darkBrown); drawRect(pixels, w, fx+9, fy+11, 4, 5, ...darkBrown); }
}

function drawKoopa(pixels, w, fx, fy, frame) {
  const green = [30, 160, 30]; const darkGreen = [20, 100, 20]; const yellow = [240, 220, 80];
  if (frame >= 6) {
    drawRect(pixels, w, fx+2, fy+4, 12, 10, ...green); drawRect(pixels, w, fx+3, fy+5, 10, 8, ...darkGreen);
    drawRect(pixels, w, fx+4, fy+6, 8, 6, ...yellow);
    return;
  }
  drawRect(pixels, w, fx+4, fy+0, 8, 5, ...green);
  drawPixel(pixels, w, fx+5, fy+2, 0, 0, 0); drawPixel(pixels, w, fx+9, fy+2, 0, 0, 0);
  drawRect(pixels, w, fx+3, fy+5, 10, 7, ...green); drawRect(pixels, w, fx+4, fy+6, 8, 5, ...darkGreen);
  if (frame === 4) { drawRect(pixels, w, fx+3, fy+12, 4, 4, ...yellow); drawRect(pixels, w, fx+9, fy+12, 4, 4, ...yellow); }
  else { drawRect(pixels, w, fx+4, fy+12, 3, 4, ...yellow); drawRect(pixels, w, fx+9, fy+12, 3, 4, ...yellow); }
}

// Enemies: 8 frames 16x16 → 128x16
function generateEnemies() {
  const w = 128, h = 16;
  const pixels = Buffer.alloc(w * h * 4);
  drawGoomba(pixels, w, 0, 0, 0); drawGoomba(pixels, w, 16, 0, 1); drawGoomba(pixels, w, 32, 0, 2);
  pixels.fill(0, 48*4, 64*4);
  drawKoopa(pixels, w, 64, 0, 4); drawKoopa(pixels, w, 80, 0, 5); drawKoopa(pixels, w, 96, 0, 6); drawKoopa(pixels, w, 112, 0, 7);
  return createPNG(w, h, pixels);
}

// Tiles: 12 frames 16x16 → 192x16
function generateTiles() {
  const w = 192, h = 16;
  const pixels = Buffer.alloc(w * h * 4);
  const sky = [92, 148, 252]; const ground = [200, 76, 12]; const brick = [180, 100, 40];
  const question = [230, 180, 30]; const usedBlock = [120, 80, 40]; const pipeGreen = [0, 168, 0];
  const pipeDark = [0, 120, 0]; const castle = [160, 160, 160]; const flag = [200, 200, 200];
  // 0: sky
  drawRect(pixels, w, 0, 0, 16, 16, ...sky);
  // 1: ground
  drawRect(pixels, w, 16, 0, 16, 16, ...ground);
  drawRect(pixels, w, 17, 1, 14, 1, 220, 160, 100); drawRect(pixels, w, 17, 8, 14, 1, 160, 60, 10);
  // 2: brick
  drawRect(pixels, w, 32, 0, 16, 16, ...brick);
  drawRect(pixels, w, 33, 0, 7, 7, 200, 120, 60); drawRect(pixels, w, 41, 0, 7, 7, 200, 120, 60);
  drawRect(pixels, w, 36, 8, 7, 7, 200, 120, 60);
  // 3: question active
  drawRect(pixels, w, 48, 0, 16, 16, ...question);
  drawRect(pixels, w, 52, 3, 8, 10, 255, 220, 80);
  drawRect(pixels, w, 54, 4, 4, 3, 0, 0, 0); drawRect(pixels, w, 55, 7, 2, 3, 0, 0, 0); drawRect(pixels, w, 54, 10, 4, 1, 0, 0, 0); drawPixel(pixels, w, 55, 12, 0, 0, 0);
  // 4: question used
  drawRect(pixels, w, 64, 0, 16, 16, ...usedBlock);
  // 5: pipe top-left
  drawRect(pixels, w, 80, 0, 16, 16, ...pipeGreen);
  drawRect(pixels, w, 80, 0, 3, 16, ...pipeDark); drawRect(pixels, w, 80, 0, 16, 3, ...pipeDark);
  // 6: pipe top-right
  drawRect(pixels, w, 96, 0, 16, 16, ...pipeGreen);
  drawRect(pixels, w, 109, 0, 3, 16, ...pipeDark); drawRect(pixels, w, 96, 0, 16, 3, ...pipeDark);
  // 7: pipe body
  drawRect(pixels, w, 112, 0, 16, 16, ...pipeGreen);
  drawRect(pixels, w, 112, 0, 3, 16, ...pipeDark);
  // 8: castle block
  drawRect(pixels, w, 128, 0, 16, 16, ...castle);
  drawRect(pixels, w, 129, 1, 6, 6, 180, 180, 180); drawRect(pixels, w, 137, 1, 6, 6, 180, 180, 180);
  // 9: flagpole
  drawRect(pixels, w, 144, 0, 16, 16, ...sky); drawRect(pixels, w, 151, 0, 2, 16, 100, 100, 100);
  // 10: flag
  drawRect(pixels, w, 160, 0, 16, 16, ...sky); drawRect(pixels, w, 167, 0, 2, 16, 100, 100, 100);
  drawRect(pixels, w, 160, 1, 7, 6, 0, 180, 0);
  // 11: castle door
  drawRect(pixels, w, 176, 0, 16, 16, ...castle); drawRect(pixels, w, 180, 6, 8, 10, 50, 50, 50);
  return createPNG(w, h, pixels);
}

// Items: 10 frames 16x16 → 160x16
function generateItems() {
  const w = 160, h = 16;
  const pixels = Buffer.alloc(w * h * 4);
  // 0: coin frame 1
  drawRect(pixels, w, 5, 2, 6, 12, 255, 200, 30);
  // 1: coin frame 2
  drawRect(pixels, w, 22, 2, 4, 12, 255, 200, 30);
  // 2: coin frame 3
  drawRect(pixels, w, 38, 2, 2, 12, 255, 200, 30);
  // 3: mushroom
  drawRect(pixels, w, 50, 0, 12, 8, 220, 30, 30); drawRect(pixels, w, 50, 2, 12, 4, 255, 255, 255);
  drawRect(pixels, w, 52, 8, 8, 8, 230, 200, 150);
  // 4: fire flower
  drawRect(pixels, w, 66, 0, 12, 6, 255, 100, 0); drawRect(pixels, w, 68, 2, 8, 2, 255, 220, 0);
  drawRect(pixels, w, 70, 6, 4, 6, 0, 160, 0); drawRect(pixels, w, 68, 12, 8, 4, 0, 120, 0);
  // 5: 1up mushroom
  drawRect(pixels, w, 82, 0, 12, 8, 30, 180, 30); drawRect(pixels, w, 82, 2, 12, 4, 255, 255, 255);
  drawRect(pixels, w, 84, 8, 8, 8, 230, 200, 150);
  // 6: star
  drawRect(pixels, w, 100, 2, 8, 8, 255, 220, 30); drawRect(pixels, w, 102, 0, 4, 12, 255, 255, 100);
  drawRect(pixels, w, 98, 4, 12, 4, 255, 255, 100);
  // 7: empty
  // 8: fireball
  drawRect(pixels, w, 132, 4, 8, 8, 255, 100, 0); drawRect(pixels, w, 134, 6, 4, 4, 255, 220, 50);
  // 9: empty
  return createPNG(w, h, pixels);
}

// HUD icons: 4 frames 8x8 → 32x8
function generateHud() {
  const w = 32, h = 8;
  const pixels = Buffer.alloc(w * h * 4);
  // 0: coin icon
  drawRect(pixels, w, 1, 1, 6, 6, 255, 200, 30);
  // 1: life icon (mario head)
  drawRect(pixels, w, 10, 0, 6, 3, 200, 30, 30); drawRect(pixels, w, 10, 3, 6, 3, 255, 200, 150);
  drawPixel(pixels, w, 11, 4, 0, 0, 0); drawPixel(pixels, w, 14, 4, 0, 0, 0);
  // 2: time icon
  drawRect(pixels, w, 17, 0, 6, 8, 255, 255, 255);
  drawRect(pixels, w, 19, 1, 2, 5, 0, 0, 0);
  // 3: x icon
  drawPixel(pixels, w, 25, 1, 255, 255, 255); drawPixel(pixels, w, 30, 1, 255, 255, 255);
  drawPixel(pixels, w, 26, 2, 255, 255, 255); drawPixel(pixels, w, 29, 2, 255, 255, 255);
  drawPixel(pixels, w, 27, 3, 255, 255, 255); drawPixel(pixels, w, 28, 3, 255, 255, 255);
  drawPixel(pixels, w, 26, 4, 255, 255, 255); drawPixel(pixels, w, 29, 4, 255, 255, 255);
  drawPixel(pixels, w, 25, 5, 255, 255, 255); drawPixel(pixels, w, 30, 5, 255, 255, 255);
  return createPNG(w, h, pixels);
}

// WAV generation
function createWAV(samples, sampleRate = 22050) {
  const numSamples = samples.length;
  const byteRate = sampleRate * 2;
  const dataSize = numSamples * 2;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVE', 8); buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22); buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(byteRate, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < numSamples; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  return buf;
}

function tone(freq, duration, sampleRate = 22050, volume = 0.5) {
  const n = Math.floor(sampleRate * duration);
  const s = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    const env = Math.min(1, (n - i) / (sampleRate * 0.02));
    s[i] = Math.sin(2 * Math.PI * freq * t) * volume * env;
  }
  return s;
}

function sweep(f1, f2, duration, sr = 22050, vol = 0.5) {
  const n = Math.floor(sr * duration);
  const s = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const f = f1 + (f2 - f1) * t;
    const env = Math.min(1, (n - i) / (sr * 0.02));
    s[i] = Math.sin(2 * Math.PI * f * (i / sr)) * vol * env;
  }
  return s;
}

function concat(...arrays) {
  const total = arrays.reduce((a, b) => a + b.length, 0);
  const r = new Float64Array(total);
  let off = 0;
  for (const a of arrays) { r.set(a, off); off += a.length; }
  return r;
}

function silence(duration, sr = 22050) { return new Float64Array(Math.floor(sr * duration)); }

function generateAudio() {
  const sr = 22050;
  const audio = {
    jump: createWAV(Array.from(sweep(200, 600, 0.15, sr, 0.4))),
    coin: createWAV(Array.from(concat(tone(988, 0.08, sr, 0.4), tone(1319, 0.15, sr, 0.4)))),
    stomp: createWAV(Array.from(tone(150, 0.1, sr, 0.5))),
    powerup: createWAV(Array.from(concat(tone(523, 0.08, sr), tone(659, 0.08, sr), tone(784, 0.08, sr), tone(1047, 0.15, sr)))),
    pipe: createWAV(Array.from(sweep(400, 100, 0.2, sr, 0.3))),
    flagpole: createWAV(Array.from(concat(tone(523, 0.1, sr), tone(659, 0.1, sr), tone(784, 0.1, sr), tone(1047, 0.1, sr), tone(1319, 0.1, sr), tone(1568, 0.3, sr)))),
    gameover: createWAV(Array.from(concat(tone(392, 0.2, sr, 0.4), silence(0.1), tone(330, 0.2, sr, 0.4), silence(0.1), tone(262, 0.4, sr, 0.4)))),
    levelcomplete: createWAV(Array.from(concat(tone(523, 0.08, sr), tone(659, 0.08, sr), tone(784, 0.08, sr), tone(1047, 0.08, sr), tone(1319, 0.08, sr), tone(1568, 0.08, sr), tone(2093, 0.3, sr)))),
    invincible: createWAV(Array.from(concat(...Array.from({length: 8}, (_, i) => concat(tone(523 * (1 + i*0.1), 0.1, sr, 0.3), tone(659 * (1 + i*0.1), 0.1, sr, 0.3)))))),
    fireball: createWAV(Array.from(sweep(800, 200, 0.1, sr, 0.3))),
    theme: createWAV(Array.from(concat(
      tone(659, 0.12, sr, 0.3), tone(659, 0.12, sr, 0.3), silence(0.12), tone(659, 0.12, sr, 0.3), silence(0.12),
      tone(523, 0.12, sr, 0.3), tone(659, 0.12, sr, 0.3), silence(0.12), tone(784, 0.24, sr, 0.3), silence(0.24),
      tone(392, 0.24, sr, 0.3), silence(0.24),
      tone(523, 0.18, sr, 0.3), silence(0.06), tone(392, 0.18, sr, 0.3), silence(0.06), tone(330, 0.18, sr, 0.3),
      silence(0.06), tone(440, 0.12, sr, 0.3), silence(0.06), tone(494, 0.12, sr, 0.3), silence(0.06),
      tone(466, 0.06, sr, 0.3), tone(440, 0.12, sr, 0.3), silence(0.06),
      tone(392, 0.12, sr, 0.3), tone(659, 0.12, sr, 0.3), tone(784, 0.12, sr, 0.3),
      tone(880, 0.12, sr, 0.3), silence(0.06), tone(698, 0.12, sr, 0.3), tone(784, 0.12, sr, 0.3),
      silence(0.06), tone(659, 0.12, sr, 0.3), silence(0.06), tone(523, 0.12, sr, 0.3),
      tone(587, 0.12, sr, 0.3), tone(494, 0.12, sr, 0.3)
    ))),
    underground: createWAV(Array.from(concat(
      tone(175, 0.15, sr, 0.4), tone(262, 0.15, sr, 0.3), tone(175, 0.15, sr, 0.4),
      tone(233, 0.15, sr, 0.3), tone(175, 0.15, sr, 0.4), tone(220, 0.15, sr, 0.3),
      tone(175, 0.15, sr, 0.4), silence(0.15)
    )))
  };
  return audio;
}

// Write all files
console.log('Generating sprites...');
const sprites = path.join(ROOT, 'public/assets/sprites');
fs.writeFileSync(path.join(sprites, 'mario-sprites.png'), generateMario());
fs.writeFileSync(path.join(sprites, 'enemies-sprites.png'), generateEnemies());
fs.writeFileSync(path.join(sprites, 'tiles-spritesheet.png'), generateTiles());
fs.writeFileSync(path.join(sprites, 'items-sprites.png'), generateItems());
fs.writeFileSync(path.join(sprites, 'hud-sprites.png'), generateHud());

console.log('Generating audio...');
const audioDir = path.join(ROOT, 'public/audio');
const audioFiles = generateAudio();
for (const [name, buf] of Object.entries(audioFiles)) {
  fs.writeFileSync(path.join(audioDir, `${name}.wav`), buf);
}

console.log('Generating PWA icons...');
const iconsDir = path.join(ROOT, 'public/icons');
const icon192 = Buffer.alloc(192 * 192 * 4);
drawRect(icon192, 192, 0, 0, 192, 192, 92, 148, 252);
drawRect(icon192, 192, 40, 20, 112, 50, 200, 30, 30);
drawRect(icon192, 192, 60, 70, 72, 60, 200, 30, 30);
drawRect(icon192, 192, 55, 130, 82, 42, 30, 30, 200);
drawRect(icon192, 192, 50, 60, 92, 15, 255, 200, 150);
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), createPNG(192, 192, icon192));
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), createPNG(192, 192, icon192));

// Verify sizes
console.log('\nAsset sizes:');
for (const f of fs.readdirSync(sprites)) {
  const s = fs.statSync(path.join(sprites, f)).size;
  console.log(`  sprites/${f}: ${s} bytes ${s < 100 ? '❌ PLACEHOLDER' : '✅'}`);
}
for (const f of fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3'))) {
  const s = fs.statSync(path.join(audioDir, f)).size;
  console.log(`  audio/${f}: ${s} bytes ${s < 100 ? '❌ PLACEHOLDER' : '✅'}`);
}
console.log('\nDone!');
