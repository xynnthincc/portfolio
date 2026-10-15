import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import SiteChrome from '@/components/SiteChrome';
import { gilroy } from '@/fonts/fonts';

import './globals.css';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

const TITLE = 'Zakii Maalik — Developer, Creator, Student';
const DESCRIPTION =
	'Portfolio of Zakii Maalik: web and mobile developer, content creator, and competition winner. Projects, awards, experience, and contact.';

export const metadata: Metadata = {
	title: { default: TITLE, template: `%s — ${TITLE.split(' — ')[1]}` },
	description: DESCRIPTION,
	keywords: [
		'Zakii Maalik',
		'portfolio',
		'web developer',
		'Next.js',
		'React',
		'Tailwind CSS',
		'content creator',
	],
	authors: [{ name: 'Zakii Maalik' }],
	creator: 'Zakii Maalik',
	openGraph: {
		type: 'website',
		title: TITLE,
		description: DESCRIPTION,
		siteName: 'lauv-portfolio',
	},
	twitter: {
		card: 'summary_large_image',
		title: TITLE,
		description: DESCRIPTION,
	},
	robots: { index: true, follow: true },
};

export const viewport: Viewport = {
	themeColor: '#0a0a0a',
	colorScheme: 'dark',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${gilroy.variable} antialiased bg-black`}
			>
				{/* Header, mobile menu, social rail, custom cursor, Lenis smooth scroll */}
				<SiteChrome />
				{children}
			</body>
		</html>
	);
}