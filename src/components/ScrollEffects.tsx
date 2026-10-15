'use client';

import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useIsDesktop } from '@/lib/useIsDesktop';

const dotSpringConfig = { damping: 25, stiffness: 200 };
const outlineSpringConfig = { damping: 35, stiffness: 400 };

/**
 * Desktop-only chrome: Lenis smooth scrolling plus the custom cursor.
 *
 * Loaded via `next/dynamic({ ssr: false })` from ScrollEffectsLoader, and
 * skipped entirely on mobile, where native scrolling is smoother and the
 * spring cursor would only burn battery.
 */
export default function ScrollEffects() {
	const isDesktop = useIsDesktop();

	const lenis = useRef<{ raf: (t: number) => void; destroy: () => void } | null>(
		null,
	);
	const lenisRafId = useRef<number | null>(null);

	const cursorX = useMotionValue(0);
	const cursorY = useMotionValue(0);

	const dotX = useSpring(cursorX, dotSpringConfig);
	const dotY = useSpring(cursorY, dotSpringConfig);

	const outlineX = useSpring(dotX, outlineSpringConfig);
	const outlineY = useSpring(dotY, outlineSpringConfig);

	// --- Lenis smooth scrolling (desktop only) ---
	useEffect(() => {
		if (!isDesktop) return;

		let cancelled = false;

		// Imported on demand: Lenis is ~30KB and never needed on mobile.
		(async () => {
			const { default: Lenis } = await import('@studio-freight/lenis');
			if (cancelled) return;

			const instance = new Lenis({
				duration: 1.2,
				easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
				smoothWheel: true,
			});
			lenis.current = instance;

			function raf(time: number) {
				instance.raf(time);
				lenisRafId.current = requestAnimationFrame(raf);
			}
			lenisRafId.current = requestAnimationFrame(raf);
		})();

		return () => {
			cancelled = true;
			if (lenisRafId.current) cancelAnimationFrame(lenisRafId.current);
			lenis.current?.destroy();
			lenis.current = null;
		};
	}, [isDesktop]);

	// --- Custom cursor (desktop only) ---
	useEffect(() => {
		if (!isDesktop) return;

		// Hide the native pointer only while the custom cursor is mounted.
		document.body.style.cursor = 'none';

		const moveCursor = (e: MouseEvent) => {
			cursorX.set(e.clientX);
			cursorY.set(e.clientY);
		};

		cursorX.set(window.innerWidth / 2);
		cursorY.set(window.innerHeight / 2);

		window.addEventListener('mousemove', moveCursor, { passive: true });

		return () => {
			window.removeEventListener('mousemove', moveCursor);
			document.body.style.cursor = '';
		};
	}, [cursorX, cursorY, isDesktop]);

	return isDesktop ? (
		<>
			<motion.div
				style={{
					x: dotX,
					y: dotY,
					pointerEvents: 'none',
					left: 0,
					top: 0,
					position: 'fixed',
					zIndex: 9999,
					transform: 'translate(-50%, -50%)',
					width: '8px',
					height: '8px',
					borderRadius: '50%',
					backgroundColor: '#06b6d4',
					boxShadow: '0 0 10px 4px rgba(6, 182, 212, 0.7)',
				}}
			/>
			<motion.div
				style={{
					x: outlineX,
					y: outlineY,
					pointerEvents: 'none',
					left: 0,
					top: 0,
					position: 'fixed',
					zIndex: 9998,
					transform: 'translate(-50%, -50%)',
					width: '30px',
					height: '30px',
					borderRadius: '50%',
					border: '2px solid #0891b2',
					opacity: 0.5,
				}}
			/>
		</>
	) : null;
}