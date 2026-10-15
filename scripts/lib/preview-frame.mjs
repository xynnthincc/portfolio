/**
 * Shared framing rules for project preview images.
 *
 * Every preview is delivered as a laptop-screen frame (16:10) so the project
 * grid stays a uniform shape and cards never grow tall enough to push the rest
 * of the page down.
 */
import fs from 'node:fs/promises';
import sharp from 'sharp';

/** 16:10 — the classic laptop panel ratio (1280x800, 1440x900, ...). */
export const LAPTOP_WIDTH = 1200;
export const LAPTOP_HEIGHT = 750;

/**
 * Writes a WebP to `output`.
 *
 * Stages to a `.part` file and swaps it in. Antivirus and lingering dev-server
 * file watchers can hold a destination image open for a moment, which libvips
 * reports as "unable to open for write: Invalid argument"; writing to a fresh
 * path and then replacing sidesteps that lock.
 */
async function writeWebp(pipeline, output, quality) {
	const staged = `${output}.part`;
	await fs.rm(staged, { force: true });
	await pipeline.webp({ quality }).toFile(staged);
	await fs.rm(output, { force: true });
	await fs.rename(staged, output);
}

/**
 * Writes `input` to `output` as a 1200x750 WebP, laptop-screen shaped.
 *
 * Uses `fit: 'cover'` anchored top-left: the frame is filled edge to edge and
 * any excess is cropped away. Padding to reach 16:10 was tried first and left a
 * visible band under light-themed pages; upscaling a short screenshot was worse
 * still. These are page screenshots, so the top is always the part worth
 * keeping, and wide captures are cropped from the right so the site logo and
 * left-hand nav stay in frame instead of being sliced through the middle.
 *
 * The input is read into memory first: sharp keeps file handles open lazily, and
 * on Windows that blocks overwriting the very file being processed.
 */
export async function toLaptopFrame(input, output, { quality = 82, retries = 3 } = {}) {
	const source = await fs.readFile(input);

	let lastError;
	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			await writeWebp(
				sharp(source).resize({
					width: LAPTOP_WIDTH,
					height: LAPTOP_HEIGHT,
					fit: 'cover',
					position: 'left top',
					withoutEnlargement: true,
				}),
				output,
				quality,
			);
			return { width: LAPTOP_WIDTH, height: LAPTOP_HEIGHT };
		} catch (err) {
			lastError = err;
			await new Promise((r) => setTimeout(r, 300 * attempt));
		}
	}
	throw lastError;
}