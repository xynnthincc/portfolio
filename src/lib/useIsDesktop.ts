'use client';

import { useSyncExternalStore } from 'react';

/**
 * Breakpoint used across the site to decide whether to boot WebGL / canvas
 * work. Must stay in sync with the `md:` Tailwind breakpoint (768px).
 */
const DESKTOP_QUERY = '(min-width: 768px)';

function subscribe(callback: () => void) {
	const mql = window.matchMedia(DESKTOP_QUERY);
	mql.addEventListener('change', callback);
	return () => mql.removeEventListener('change', callback);
}

const getSnapshot = () => window.matchMedia(DESKTOP_QUERY).matches;

// Server render (and the first client render) assumes mobile so that no GPU
// context is ever created before hydration decides otherwise. This avoids a
// hydration mismatch and keeps mobile free of Three.js / Matter.js work.
const getServerSnapshot = () => false;

/**
 * True on desktop viewports. Gate every WebGL, canvas, smooth-scroll or
 * cursor effect behind this — see AGENTS.md.
 */
export function useIsDesktop(): boolean {
	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}