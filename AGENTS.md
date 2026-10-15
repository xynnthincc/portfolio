# AGENTS.md

Single-package Next.js 16 (App Router, Turbopack) personal portfolio. No test runner, no CI, no database. Most pages are client components.

## Commands

```bash
npm run dev      # next dev --turbopack  (http://localhost:3000)
npm run build    # production build + prerender (~50s warm, ~90s cold)
npm run start    # serve the build
npm run lint     # eslint . (Next 16 removed `next lint`; the script calls the CLI directly)
npx tsc --noEmit # currently clean — keep it that way
```

Verification = `npm run build` + `npm run lint` + `npx tsc --noEmit`. There are no tests.

- `next build` still rewrites `tsconfig.json` (`jsx: react-jsx`, adds `.next/dev/types/**/*.ts`). Revert that churn before committing.
- `next.config.ts` sets `typescript.ignoreBuildErrors: true`. It exists so a vendored block can't block a deploy, **not** as permission to add type errors — `tsc --noEmit` is expected to pass.

## Structure

- `src/app/` — routes: `/`, `/Awards`, `/Contact`, `POST /api/contact`. Route dirs are capitalized; `href`s must match case exactly.
- `src/app/layout.tsx` is a **server** component: fonts, `metadata`/`viewport` exports, and `<SiteChrome />`. Keep it that way — the header, mobile menu and social rail live in `src/components/SiteChrome.tsx` (client), the cursor + Lenis in `ScrollEffects.tsx` (client, loaded through `ScrollEffectsLoader.tsx` with `ssr: false`).
- `src/blocks/` — vendored [react-bits](https://reactbits.dev/ts/tailwind/) components (Backgrounds / Components / TextAnimations), a mix of `.tsx` and `.jsx`. New ones are installed via `jsrepo.json` (paths map to `./src/blocks`); keep the `/* Installed from https://reactbits.dev/... */` header when adding. `components.json` also registers the `@react-bits` shadcn registry.
- `src/lib/useIsDesktop.ts` — the single source of truth for the 768px gate. Don't re-add local `matchMedia` effects; see "Performance conventions".
- `src/fonts/` — local Gilroy woff2 files + `fonts.ts` (`next/font/local`, exposes `--font-gilroy`).
- `public/` — assets are referenced by path and grouped by purpose: `proj/`, `techstack/`, `exp_logos/`, `hackathons/`, `trophies/`, `solutions/`, `photos/`, `icons/`, `logo/`, `noise.png`, `assets/lanyard/`.
- `@/*` maps to `./src/*`.

## Content lives inline, not in `src/data`

Projects, experience, nav items, and social links are hardcoded arrays at the top of the component that renders them (`page.tsx` `projects`, `ExperienceTimeline.tsx` `experiences`, `SiteChrome.tsx` `items` / `socialLinks`). Keep `SiteChrome`'s Projects dropdown in sync with `page.tsx` — same projects, different grouping.

- `src/data/projects.tsx` and `src/components/StatsSection.tsx` are **orphaned** — nothing imports them. Editing them has no effect.
- **Only projects with a real screenshot of the live site are listed.** A preview is the entire point of the card, so source-only projects (BESTARI, Echoes of Steel) are deliberately left out rather than shown with a stand-in.
- Project entry shape: `tech` is `{ label, icon? }[]` (the icon is optional because `public/techstack/` has no asset for every technology in use), `link` is set **only** when the project is really deployed, and `repo` is the GitHub source. `ProjectCard` renders "Visit Live" only when `link` exists, "View Code" when `repo` exists.
- Project copy is in Indonesian where the product is Indonesian. Don't invent claims — descriptions come from each project's README, GitHub description or live meta description.
- `year` is the repository's creation year, not a guess.

## Project previews

Every preview is a **1200x750 WebP** — a laptop-screen frame. The card renders it in `aspect-[16/10]`; do not reintroduce fixed pixel heights or `flex-grow`, which is what made the grid stretch vertically.

Workflow:

- **Hand-captured screenshots** — drop a jpg/png into `public/proj/` and run `node scripts/normalize-previews.mjs`. Idempotent: files already at 1200x750 are skipped. `--force` reprocesses everything.
- **Live URLs** — `node scripts/fetch-previews.mjs name=url ...` captures via thum.io and frames the result.

Framing rules live in `scripts/lib/preview-frame.mjs` and are load-bearing:

- `fit: 'cover'` anchored **top-left**. Cover fills the frame with no padding band; padding to 16:10 left a visible stripe under light-themed pages, and centre-anchoring sliced through the site logo. Wide captures crop from the right so the logo survives.
- `fetch-previews.mjs` needs `wait/10`, and tries a viewport capture first with `fullpage` as a fallback — some deployments (Hive) return a blank viewport shot and only render under `fullpage`.
- Blank captures are detected and rejected rather than written.

Two Windows caveats the scripts already absorb: a running `next dev` holds files in `public/` open, so the normalizer reports failures per file and keeps going instead of aborting, and outputs are staged to `.part` before being swapped in.

## Performance conventions this site depends on

- Heavy below-the-fold components are `dynamic(() => import(...), { ssr: false })`. Above-the-fold ones are imported eagerly.
- **All WebGL/canvas work goes through `useIsDesktop()`.** `Threads` (ogl), `Squares` (ogl), `FallingText` (matter-js), the custom cursor and Lenis are desktop-only. Hiding them with a CSS class such as `hidden md:block` is *not* enough — the component still mounts and its render loop keeps running; that bug cost mobile battery twice before.
- `ScrollEffects` hides the native pointer (`document.body.style.cursor = 'none'`) only while mounted and restores it on cleanup.
- `src/app/page.tsx` renders exactly one instance of heavy animated components. Don't "add a mobile variant" — a second copy means a second Matter.js/WebGL loop.
- Give every `next/image` a `sizes` prop; 1:1 dimension props on full-width images serve oversized files.

## Assets

Most SVGs in `public/` are Figma exports with a bitmap inlined as base64, and `next/image` does not optimize SVG. `scripts/compress-svg-rasters.mjs` re-encodes those rasters (JPEG when opaque, quantised PNG when they have alpha) after downscaling. Re-run it (`--dry` first) whenever large mockups or logos are added.

Keep the output in PNG/JPEG. An earlier WebP version of that script produced SVGs that browsers rendered but that librsvg (sharp, ImageMagick, many build tools) rendered blank — do not reintroduce WebP-in-SVG.

`body::after` in `globals.css` tiles `public/noise.png` for film grain. Regenerate with `node scripts/make-noise.mjs`. Do not swap back to an `feTurbulence` filter: on a fixed viewport-sized element it re-rasterises the whole viewport on scroll and resize.

## Tailwind is v4, CSS-first

- Config lives in `src/app/globals.css`. Theme tokens must use `@theme inline { ... }` — the previous `:root inline { ... }` block was an invalid selector that matched nothing, so `font-sans` silently fell back to the system stack.
- `tailwind.config.js` is **not loaded** (no `@config` directive, and v4 doesn't auto-detect it). Its `fontFamily` extensions do nothing; `body` sets `font-family` directly.

## Contact form / env

`POST /api/contact` sends mail through nodemailer + Gmail and needs `CONTACT_EMAIL` and `CONTACT_PASS` (a Gmail **app password**, not the account password) in `.env.local`. `.env*` is gitignored, so a fresh clone won't have them and the form will 500 — recreate locally before testing. Never commit real credentials.

The route validates types and lengths and **only ever puts the site's own address in the envelope sender**; visitor input is used solely as `Reply-To`. Keep it that way — nodemailer ≤10.0.5 has SMTP/CRLF header-injection advisories and user input reaching `from` is the dangerous case. The UI reports results with `alert()` only.

## Conventions

- TS is `strict`, but `@typescript-eslint/no-explicit-any` is off and `src/global.d.ts` hand-declares image and 3D asset modules — `any` and untyped assets are expected here.
- `three`, `@react-three/*` and `meshline` were removed with `Lanyard.jsx`. `ogl` stays (Threads) and `matter-js` stays (FallingText). Only `framer-motion` is used for animation — nothing imports `motion` directly anymore.
- framer-motion v14 types transition `type`/`ease` as string literal unions; add `as const` when passing them from object literals (see `CircularText.tsx`).
- ESLint uses a native flat config (`eslint-config-next/core-web-vitals` + `/typescript`). Do not reintroduce `FlatCompat` — it made lint crash with `Converting circular structure to JSON`.
- Comments in config and code are frequently Indonesian; that's the author's voice, not a signal to translate.