'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import GooeyNav from '@/blocks/Components/GooeyNav/GooeyNav';
import ScrollEffectsLoader from '@/components/ScrollEffectsLoader';

// Nav data for GooeyNav, including the nested dropdown structure.
// The Projects dropdown mirrors the featured projects in src/app/page.tsx.
const items = [
	{ label: 'Home', href: '/' },
	{
		label: 'Projects',
		href: '#',
		dropdown: [
			{
				label: 'Live',
				items: [
					{ label: 'Foton', href: 'https://foton-six.vercel.app' },
					{ label: 'Hive', href: 'https://hive-tawny-eight.vercel.app' },
					{ label: 'Haneul', href: 'https://haneulid.store' },
					{ label: 'Pactra', href: 'https://pactra.my.id' },
					{ label: 'Darussurur', href: 'https://smpplusdarussururcimahi.sch.id' },
				],
			},
			{
				label: 'Source Code',
				items: [{ label: 'GitHub', href: 'https://github.com/xynnthincc' }],
			},
		],
	},
	{ label: 'Awards', href: '/Awards' },
	{ label: 'Contact', href: '/Contact' },
];

// The old handle was "xynnthinc", which is a different (empty) GitHub account.
const socialLinks = [
	{
		platform: 'GitHub',
		href: 'https://github.com/xynnthincc',
		iconPath: '/icons/github_icon.svg',
	},
	{
		platform: 'Instagram',
		href: 'https://www.instagram.com/xynnthinc',
		iconPath: '/icons/instagram_icon.svg',
	},
	{ platform: 'Gmail', href: 'mailto:zakiimaalik@gmail.com', iconPath: '/icons/gmail_icon.svg' },
];

export default function SiteChrome() {
	const pathname = usePathname();

	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [mobileDropdownOpen, setMobileDropdownOpen] = useState<string | null>(null);
	const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState<string | null>(null);

	const activeIndex = items.findIndex((item) => {
		if (item.href === pathname) return true;
		if (item.dropdown) {
			return item.dropdown.some((group) =>
				group.items.some((subItem) => subItem.href === pathname),
			);
		}
		return false;
	});

	const closeMobileMenu = () => {
		setMobileMenuOpen(false);
		setMobileDropdownOpen(null);
		setMobileSubmenuOpen(null);
	};

	return (
		<>
			{/* Desktop-only cursor + Lenis smooth scroll */}
			<ScrollEffectsLoader />

			<header className="sticky top-0 z-50 flex w-full items-center justify-between px-4 py-2 md:px-8 md:py-3 bg-transparent backdrop-blur-[3px]">
				<Link href="/" aria-label="Home">
					<Image
						src="/logo/lauv-logo2.svg"
						alt="Lauv Logo"
						width={35}
						height={35}
						className="m-4 md:m-10 transition-all duration-300 hover:scale-150 hover:rotate-10 hover:brightness-125"
					/>
				</Link>

				{/* Desktop navigation - hidden on small screens */}
				<div
					className="hidden lg:block font-medium"
					style={{ height: '70px', width: '500px', position: 'relative' }}
				>
					<GooeyNav
						items={items}
						particleCount={15}
						particleDistances={[90, 10]}
						particleR={100}
						initialActiveIndex={activeIndex !== -1 ? activeIndex : 0}
						animationTime={600}
						timeVariance={300}
						colors={[1, 2, 3, 1, 2, 3, 1, 4]}
					/>
				</div>

				{/* Hamburger button - visible on small and medium screens */}
				<button
					className="lg:hidden text-white p-2 focus:outline-none"
					onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					aria-label="Toggle mobile menu"
					aria-expanded={mobileMenuOpen}
				>
					<div className="w-6 h-0.5 bg-white mb-1.5 transition-all duration-300 ease-in-out" />
					<div className="w-6 h-0.5 bg-white mb-1.5 transition-all duration-300 ease-in-out" />
					<div className="w-6 h-0.5 bg-white transition-all duration-300 ease-in-out" />
				</button>
			</header>

			{/* Mobile menu - only visible when mobileMenuOpen is true */}
			{mobileMenuOpen && (
				<div className="lg:hidden bg-transparent backdrop-blur-[10px] pt-10 fixed top-[72px] sm:top-[80px] md:top-[96px] right-0 left-0 z-40 p-4 sm:p-5 overflow-y-auto h-[calc(100vh-72px)] sm:h-[calc(100vh-80px)] md:h-[calc(100vh-96px)]">
					<nav className="flex flex-col space-y-4">
						{items.map((item, index) => (
							<div key={index}>
								{item.dropdown ? (
									<div>
										<button
											className="text-white hover:text-gray-300 py-2 px-4 font-medium text-base sm:text-lg w-full text-left flex justify-between items-center"
											onClick={() =>
												setMobileDropdownOpen(
													mobileDropdownOpen === item.label ? null : item.label,
												)
											}
										>
											{item.label}
											<svg
												className={`w-4 h-4 transition-transform duration-200 ${
													mobileDropdownOpen === item.label ? 'rotate-180' : ''
												}`}
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M19 9l-7 7-7-7"
												/>
											</svg>
										</button>
										{mobileDropdownOpen === item.label && (
											<div className="ml-4 mt-2 space-y-2">
												{item.dropdown.map((group, groupIndex) => (
														<div key={groupIndex}>
															<button
																className="text-cyan-400 text-sm font-semibold mb-2 px-4 w-full text-left flex justify-between items-center"
																onClick={() =>
																	setMobileSubmenuOpen(
																		mobileSubmenuOpen === group.label
																			? null
																			: group.label,
																	)
																}
															>
																{group.label}
																<svg
																	className={`w-3 h-3 transition-transform duration-200 ${
																		mobileSubmenuOpen === group.label
																			? 'rotate-180'
																			: ''
																	}`}
																	fill="none"
																	stroke="currentColor"
																	viewBox="0 0 24 24"
																>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		strokeWidth={2}
																		d="M19 9l-7 7-7-7"
																	/>
																</svg>
															</button>
															{mobileSubmenuOpen === group.label && (
																<div className="ml-4 space-y-1 border-l-2 border-cyan-400/30 pl-3">
																	{group.items.map((subItem, subIndex) => (
																		<Link
																			key={subIndex}
																			href={subItem.href}
																			className="text-white hover:text-cyan-400 py-2 px-4 block text-sm transition-colors"
																			onClick={closeMobileMenu}
																		>
																			{subItem.label}
																		</Link>
																	))}
																</div>
															)}
														</div>
													))}
											</div>
										)}
									</div>
								) : (
									<Link
										href={item.href}
										className="text-white hover:text-gray-300 py-2 px-4 font-medium text-base sm:text-lg block"
										onClick={closeMobileMenu}
									>
										{item.label}
									</Link>
								)}
							</div>
						))}
					</nav>
				</div>
			)}

			{/* Sticky Social Media Container */}
			<div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 bg-black/60 border border-white/[.30] border-dashed rounded-full p-2 md:p-4 flex flex-col items-center space-y-7 md:space-y-5">
				{socialLinks.map((link) => (
					<Link
						key={link.platform}
						href={link.href}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={link.platform}
						className="transition-transform duration-200 hover:scale-110"
					>
						<Image
							src={link.iconPath}
							alt={`${link.platform} icon`}
							width={20}
							height={20}
							className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 object-contain"
						/>
					</Link>
				))}
			</div>
		</>
	);
}