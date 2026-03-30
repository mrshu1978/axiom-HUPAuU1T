import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const W = 212, H = 15;
const TILE = { EMPTY: 0, GROUND: 2, BRICK: 3, QUESTION: 4, USED: 5, PIPE_TL: 6, PIPE_TR: 7, PIPE_BODY: 8, CASTLE: 9, FLAGPOLE: 10, FLAG: 11, CASTLE_DOOR: 12 };

function makeLayer(name) {
  return new Array(W * H).fill(0);
}

function set(data, x, y, v) {
  if (x >= 0 && x < W && y >= 0 && y < H) data[y * W + x] = v;
}

function fillRect(data, x, y, w, h, v) {
  for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) set(data, x + dx, y + dy, v);
}

const ground = makeLayer('ground');
const platforms = makeLayer('platforms');

fillRect(ground, 0, 13, 69, 2, TILE.GROUND);
fillRect(ground, 71, 13, 15, 2, TILE.GROUND);
fillRect(ground, 89, 13, 63, 2, TILE.GROUND);
fillRect(ground, 155, 13, 57, 2, TILE.GROUND);

const pipes = [[28, 2], [38, 3], [46, 4], [57, 4], [163, 2], [179, 2]];
for (const [px, ph] of pipes) {
  set(platforms, px, 12 - ph, TILE.PIPE_TL);
  set(platforms, px + 1, 12 - ph, TILE.PIPE_TR);
  for (let py = 12 - ph + 1; py <= 12; py++) {
    set(platforms, px, py, TILE.PIPE_BODY);
    set(platforms, px + 1, py, TILE.PIPE_BODY);
  }
}

const questionBlocks = [[16, 9], [21, 9], [22, 5], [23, 9], [78, 9], [94, 5], [106, 9], [109, 9], [109, 5], [112, 9], [129, 9], [130, 9], [170, 9]];
for (const [qx, qy] of questionBlocks) set(platforms, qx, qy, TILE.QUESTION);

const brickRuns = [[20, 9, 1], [22, 9, 1], [24, 9, 1], [77, 9, 1], [80, 5, 8], [91, 9, 3], [94, 9, 1], [100, 5, 3], [118, 9, 3], [121, 5, 3], [128, 5, 4], [129, 9, 2], [168, 9, 3]];
for (const [bx, by, bw] of brickRuns) fillRect(platforms, bx, by, bw, 1, TILE.BRICK);

const stairPositions = [134, 140, 148, 152, 181];
for (const sx of stairPositions) {
  const maxH = sx === 148 || sx === 152 ? 8 : 4;
  for (let step = 0; step < maxH; step++) {
    fillRect(platforms, sx + step, 12 - step, 1, step + 1, TILE.GROUND);
  }
}

set(platforms, 198, 2, TILE.FLAG);
fillRect(platforms, 198, 3, 1, 10, TILE.FLAGPOLE);

fillRect(platforms, 202, 7, 5, 6, TILE.CASTLE);
fillRect(platforms, 203, 4, 3, 3, TILE.CASTLE);
set(platforms, 204, 3, TILE.CASTLE);
set(platforms, 204, 11, TILE.CASTLE_DOOR);
set(platforms, 204, 12, TILE.CASTLE_DOOR);

const objects = [
  { name: 'mario_spawn', type: 'spawn', x: 40, y: 192 },
  { name: 'goomba', type: 'enemy', x: 352, y: 192 },
  { name: 'goomba', type: 'enemy', x: 640, y: 192 },
  { name: 'goomba', type: 'enemy', x: 816, y: 192 },
  { name: 'goomba', type: 'enemy', x: 820, y: 192 },
  { name: 'koopa', type: 'enemy', x: 1712, y: 192 },
  { name: 'goomba', type: 'enemy', x: 1248, y: 192 },
  { name: 'goomba', type: 'enemy', x: 1504, y: 192 },
  { name: 'goomba', type: 'enemy', x: 1760, y: 80 },
  { name: 'goomba', type: 'enemy', x: 2560, y: 192 },
  { name: 'flagpole', type: 'flagpole', x: 3168, y: 48 }
];

const tilemap = {
  compressionlevel: -1,
  height: H,
  infinite: false,
  layers: [
    { data: ground, height: H, id: 1, name: 'ground', opacity: 1, type: 'tilelayer', visible: true, width: W, x: 0, y: 0 },
    { data: platforms, height: H, id: 2, name: 'platforms', opacity: 1, type: 'tilelayer', visible: true, width: W, x: 0, y: 0 },
    {
      draworder: 'topdown', id: 3, name: 'objects', objects: objects.map((o, i) => ({
        height: 16, id: i + 1, name: o.name, type: o.type, visible: true, width: 16, x: o.x, y: o.y
      })),
      opacity: 1, type: 'objectgroup', visible: true, x: 0, y: 0
    }
  ],
  nextlayerid: 4,
  nextobjectid: objects.length + 1,
  orientation: 'orthogonal',
  renderorder: 'right-down',
  tiledversion: '1.10.0',
  tileheight: 16,
  tilesets: [{
    columns: 12,
    firstgid: 1,
    image: '../sprites/tiles-spritesheet.png',
    imageheight: 16,
    imagewidth: 192,
    margin: 0,
    name: 'tiles',
    spacing: 0,
    tilecount: 12,
    tileheight: 16,
    tilewidth: 16
  }],
  tilewidth: 16,
  type: 'map',
  version: '1.10',
  width: W
};

const outPath = path.join(ROOT, 'public/assets/tilemaps/world1-1.json');
fs.writeFileSync(outPath, JSON.stringify(tilemap, null, 2));
console.log(`Tilemap written: ${outPath} (${fs.statSync(outPath).size} bytes)`);
