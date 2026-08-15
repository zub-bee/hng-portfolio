const fs = require("fs");
const zlib = require("zlib");

const width = 1200;
const height = 630;
const bytesPerPixel = 3;
const totalPixels = width * height;
const buffer = Buffer.alloc(totalPixels * bytesPerPixel);

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * bytesPerPixel;
    let r = 10;
    let g = 10;
    let b = 12;

    if (x < 220) {
      const a = 1 - x / 220;
      r = Math.min(255, 10 + Math.round(40 * a));
      g = Math.min(255, 10 + Math.round(14 * a));
      b = Math.min(255, 12 + Math.round(18 * a));
    }

    if (x > 820) {
      const t = Math.min(1, (x - 820) / 240);
      r = Math.min(255, 10 + Math.round(60 * t));
      g = Math.min(255, 10 + Math.round(20 * t));
      b = Math.min(255, 12 + Math.round(30 * t));
    }

    if (x >= 300 && x <= 900 && y >= 180 && y <= 430) {
      const band = 1 - Math.abs((x - 600) / 600);
      r = Math.min(255, 10 + Math.round(120 * band));
      g = Math.min(255, 10 + Math.round(40 * band));
      b = Math.min(255, 12 + Math.round(70 * band));
    }

    if (x >= 170 && x <= 520 && y >= 170 && y <= 470) {
      const core = 1 - Math.abs((x - 345) / 355) * 0.7;
      r = Math.min(255, 10 + Math.round(60 * core));
      g = Math.min(255, 10 + Math.round(60 * core));
      b = Math.min(255, 12 + Math.round(65 * core));
    }

    buffer[idx] = r;
    buffer[idx + 1] = g;
    buffer[idx + 2] = b;
  }
}

const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = c & 1 ? (0xedb88320 ^ (c >>> 1)) >>> 0 : c >>> 1;
  }
  crcTable[i] = c >>> 0;
}

function crc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type), data])), 0);

  return Buffer.concat([length, Buffer.from(type), data, crc]);
}

const rawData = Buffer.alloc(height * (1 + width * bytesPerPixel));
let offset = 0;
for (let y = 0; y < height; y++) {
  rawData[offset] = 0;
  offset += 1;
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * bytesPerPixel;
    rawData[offset] = buffer[idx];
    rawData[offset + 1] = buffer[idx + 1];
    rawData[offset + 2] = buffer[idx + 2];
    offset += 3;
  }
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(width, 0);
ihdr.writeUInt32BE(height, 4);
ihdr[8] = 8;
ihdr[9] = 2;
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", zlib.deflateSync(rawData)),
  chunk("IEND", Buffer.alloc(0)),
]);

fs.mkdirSync("public", { recursive: true });
fs.writeFileSync("public/og.png", png);
console.log(`Created public/og.png (${png.length} bytes)`);
