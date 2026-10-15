/**
 * Builds project preview images from real screenshots.
 *
 * Live sites are screenshotted directly. For projects that are not deployed,
 * the GitHub repo page is screenshotted instead — a real screenshot beats an
 * invented mockup. Anything already fetched is skipped, so re-running is cheap.
 *
 * Requires a network connection and the `sharp` devDependency.
 *
 * Usage: node scripts/fetch-previews.mjs name=url [name=url ...]
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const OUT_DIR = 'public/proj';
const WIDTH = 1000;
const MAX_HEIGHT = 1250;
// Height of GitHub's global navigation bar at a 1280px-wide capture.
const TRIM_GITHUB_NAV = 64;

// thum.io is free and needs no API key. Three options matter here:
//  - `noanimate` stops animations from firing mid-capture.
//  - `wait/10` plus `fullpage` is required for the Hive deployment, which
//    renders blank until its client bundle hydrates. With `crop/900` instead
//    of `fullpage` the capture comes back as a blank white image.
const endpoint = (url) =>
	`https://image.thum.io/get/width/1280/noanimate/wait/10/fullpage/${url}`;

const targets = process.argv.slice(2).map((arg) => {
	const i = arg.indexOf('=');
	if (i < 0) throw new Error(`expected name=url, got "${arg}"`);
	return { name: arg.slice(0, i), url: arg.slice(i + 1) };
});

await fs.mkdir(OUT_DIR, { recursive: true });

for (const t of targets) {
	const out = path.join(OUT_DIR, `${t.name}.webp`);
	try {
		await fs.access(out);
		console.log(`  ${t.name}: already present, skipped`);
		continue;
	} catch {
		/* not fetched yet */
	}

	try {
		const res = await fetch(endpoint(t.url), {
			headers: { 'User-Agent': 'Mozilla/5.0 (preview-builder)' },
			signal: AbortSignal.timeout(90000),
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);

		const buf = Buffer.from(await res.arrayBuffer());
		const meta = await sharp(buf).metadata();
		if (!meta.width || meta.width < 400) throw new Error(`unexpected size ${meta.width}x${meta.height}`);

		// Reject the mShots-style blank placeholder: a real page shot has many
		// distinct colours, a placeholder is a flat dark rectangle.
		const raw = await sharp(buf).resize(80, 80, { fit: 'inside' }).raw().toBuffer();
		const distinct = new Set();
		for (let i = 0; i < raw.length; i += raw.length > 20000 ? 6 : 3) {
			distinct.add(`${raw[i]},${raw[i + 1]},${raw[i + 2]}`);
		}
		if (distinct.size < 12) throw new Error(`looks blank (${distinct.size} colours)`);

		// `fullpage` captures vary wildly in height, so scale first and then cap
		// the height, giving every card in the projects grid a comparable shape.
		// GitHub's global nav (black bar) is trimmed off repo captures so the
		// card starts at the repo content instead of generic site chrome.
		let source = buf;
		if (t.url.includes('github.com') && meta.height > TRIM_GITHUB_NAV) {
			source = await sharp(buf)
				.extract({ left: 0, top: TRIM_GITHUB_NAV, width: meta.width, height: meta.height - TRIM_GITHUB_NAV })
				.toBuffer();
		}

		const scaled = await sharp(source)
			.resize({ width: WIDTH, withoutEnlargement: true })
			.toBuffer();
		const scaledMeta = await sharp(scaled).metadata();

		await sharp(scaled)
			.extract({
				left: 0,
				top: 0,
				width: scaledMeta.width,
				height: Math.min(MAX_HEIGHT, scaledMeta.height),
			})
			.webp({ quality: 80 })
			.toFile(out);

		const { size } = await fs.stat(out);
		console.log(
			`  ${t.name}: ${meta.width}x${meta.height} -> ${out} (${(size / 1024).toFixed(0)}KB)`,
		);
	} catch (err) {
		console.log(`  ${t.name}: FAILED — ${err.message}`);
	}
}