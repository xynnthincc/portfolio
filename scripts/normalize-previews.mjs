/**
 * Normalises project previews to the laptop-screen frame (1200x750 WebP).
 *
 * Drop a screenshot into public/proj/ (jpg/png/webp) and run:
 *   node scripts/normalize-previews.mjs            # rewrite what needs it
 *   node scripts/normalize-previews.mjs --force    # rewrite everything
 *
 * Files already at the right dimensions are skipped unless --force is passed.
 * The source image is left untouched; the output is <name>.webp next to it.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { toLaptopFrame, LAPTOP_WIDTH, LAPTOP_HEIGHT } from './lib/preview-frame.mjs';

const DIR = 'public/proj';
const FORCE = process.argv.includes('--force');
const IN_EXT = /\.(jpe?g|png|webp)$/i;

const files = (await fs.readdir(DIR)).filter((f) => IN_EXT.test(f)).sort();

let rewritten = 0;
let skipped = 0;
const failed = [];

for (const file of files) {
	const input = path.join(DIR, file);
	const name = path.basename(file, path.extname(file));
	const output = path.join(DIR, `${name}.webp`);

	try {
		const meta = await sharp(input).metadata();

		// Nothing to do when this *is* the output file and is already framed.
		if (!FORCE && meta.width === LAPTOP_WIDTH && meta.height === LAPTOP_HEIGHT) {
			console.log(`  ${file.padEnd(24)} already ${LAPTOP_WIDTH}x${LAPTOP_HEIGHT}, skipped`);
			skipped++;
			continue;
		}

		const before = (await fs.stat(input)).size;
		const result = await toLaptopFrame(input, output);
		const after = (await fs.stat(output)).size;

		console.log(
			`  ${file.padEnd(24)} ${meta.width}x${meta.height} -> ${result.width}x${result.height}  ` +
				`${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`,
		);
		rewritten++;
	} catch (err) {
		// A running `next dev` keeps files in public/ open on Windows, which
		// makes replacing them fail with EBUSY. Report and keep going instead of
		// losing the whole batch.
		console.log(`  ${file.padEnd(24)} FAILED — ${err.code ?? err.message}`);
		failed.push(file);
	}
}

console.log(`\n${rewritten} rewritten, ${skipped} already correct, ${failed.length} failed`);
if (failed.length) {
	console.log('Stop any running dev server and re-run to finish the failed files.');
	process.exitCode = 1;
}