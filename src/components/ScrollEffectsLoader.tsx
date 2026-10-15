'use client';

import dynamic from 'next/dynamic';

// The cursor + Lenis smooth scroll are cosmetic and desktop-only. Loading them
// lazily keeps the custom cursor and the scroll library out of the initial JS
// payload, and defers their mount until after hydration.
const ScrollEffects = dynamic(() => import('@/components/ScrollEffects'), {
	ssr: false,
});

export default function ScrollEffectsLoader() {
	return <ScrollEffects />;
}