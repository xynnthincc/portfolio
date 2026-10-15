/**
 * Builds project preview images from real screenshots.
 *
 * Usage: node scripts/fetch-previews.mjs name=url [name=url ...]
 *
 * Output is always a laptop-screen frame (1200x750 WebP) — see lib/preview-frame.
 * Captures the viewport rather than the full page: fullpage shots came back
 * 1000x1250, which made the project cards absurdly tall on the grid.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { toLaptopFrame } from './lib/preview-frame.mjs';

const OUT_DIR = 'public/proj';

// thum.io is free and needs no API key.
//
//  - `noanimate` stops animations from firing mid-capture.
//  - `wait/10` is required for the Hive deployment, which renders blank until
//    its client bundle hydrates.
//
// A plain viewport capture is the "laptop screen" view and is what we want:
// `fullpage` returns the whole scrollable page, and cropping that to 16:10
// slices through the middle of the hero. But some deployments (Hive) still come
// back blank as a viewport shot, so `fullpage` is kept as a fallback and the
// blank check below decides which one actually gets used.
const endpoints = (url) => [
	`https://image.thum.io/get/width/1280/noanimate/wait/10/${url}`,
	`https://image.thum.io/get/width/1280/noanimate/wait/10/fullpage/${url}`,
];

const targets = process.argv.slice(2).map((arg) => {
	const i = arg.indexOf('=');
	if (i < 0) throw new Error(`expected name=url, got "${arg}"`);
	return { name: arg.slice(0, i), url: arg.slice(i + 1) };
});

await fs.mkdir(OUT_DIR, { recursive: true });

for (const t of targets) {
	const raw = path.join(OUT_DIR, `${t.name}.raw`);
	const out = path.join(OUT_DIR, `${t.name}.webp`);

	const capture = async (url) => {
		const res = await fetch(url, {
			headers: { 'User-Agent': 'Mozilla/5.0 (preview-builder)' },
			signal: AbortSignal.timeout(90000),
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return Buffer.from(await res.arrayBuffer());
	};

	/** A real page shot has many distinct colours; a failed render is flat. */
	const looksReal = async (buf) => {
		const meta = await sharp(buf).metadata();
		if (!meta.width || meta.width < 400) return false;
		const small = await sharp(buf).resize(80, 80, { fit: 'inside' }).raw().toBuffer();
		const distinct = new Set();
		for (let i = 0; i < small.length; i += small.length > 20000 ? 6 : 3) {
			distinct.add(`${small[i]},${small[i + 1]},${small[i + 2]}`);
		}
		return distinct.size >= 12;
	};

	try {
		let buf = null;
		let problems = [];

		for (const url of endpoints(t.url)) {
			try {
				const candidate = await capture(url);
				if (await looksReal(candidate)) {
					buf = candidate;
					break;
				}
				problems.push('blank capture');
			} catch (err) {
				problems.push(err.message);
			}
		}

		if (!buf) throw new Error(problems.join(' / ') || 'no usable capture');

		await fs.writeFile(raw, buf);
		const framed = await toLaptopFrame(raw, out);
		await fs.rm(raw, { force: true });

		const { size } = await fs.stat(out);
		console.log(
			`  ${t.name}: -> ${framed.width}x${framed.height} (${(size / 1024).toFixed(0)}KB)`,
		);
	} catch (err) {
		await fs.rm(raw, { force: true }).catch(() => {});
		console.log(`  ${t.name}: FAILED — ${err.message}`);
	}
}