/** Generates public/noise.png — a small tileable film-grain texture used by
 *  body::after in globals.css, replacing a full-viewport feTurbulence filter. */
import sharp from 'sharp';

const SIZE = 128;

// Deterministic pseudo-random so the texture is stable across runs.
let seed = 1337;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

const data = Buffer.alloc(SIZE * SIZE);
for (let i = 0; i < data.length; i++) {
  // Two octaves of value noise, centred on mid-grey, biased light so it reads
  // as grain on a near-black background.
  const v = 0.35 * rand() + 0.65 * rand();
  data[i] = Math.round(60 + v * 140);
}

await sharp(data, { raw: { width: SIZE, height: SIZE, channels: 1 } })
  .png({ palette: true, colors: 32, effort: 10 })
  .toFile('public/noise.png');

console.log('wrote public/noise.png');