/*
	Installed from https://reactbits.dev/ts/tailwind/
*/

import React, { useRef, useEffect, useState } from "react";
import Link from 'next/link';

interface GooeyNavSubItem {
	label: string;
	href: string;
}

interface GooeyNavDropdownGroup {
	label: string;
	items: GooeyNavSubItem[];
}

interface GooeyNavItem {
	label: string;
	href: string;
	dropdown?: GooeyNavDropdownGroup[];
}

export interface GooeyNavProps {
	items: GooeyNavItem[];
	animationTime?: number;
	particleCount?: number;
	particleDistances?: [number, number];
	particleR?: number;
	timeVariance?: number;
	colors?: number[];
	initialActiveIndex?: number;
}

// Particle helpers live at module scope, not inside the component: they call
// Math.random(), which must never run during render (react-hooks/purity).
// They are only ever invoked from event handlers.
const noise = (n = 1) => n / 2 - Math.random() * n;
const getXY = (
	distance: number,
	pointIndex: number,
	totalPoints: number,
): [number, number] => {
	const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
	return [distance * Math.cos(angle), distance * Math.sin(angle)];
};
const createParticle = (
	i: number,
	t: number,
	d: [number, number],
	r: number,
	particleCount: number,
	colors: number[],
) => {
	const rotate = noise(r / 10);
	return {
		start: getXY(d[0], particleCount - i, particleCount),
		end: getXY(d[1] + noise(7), particleCount - i, particleCount),
		time: t,
		scale: 1 + noise(0.2),
		color: colors[Math.floor(Math.random() * colors.length)],
		rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10,
	};
};

const GooeyNav: React.FC<GooeyNavProps> = ({
	items,
	animationTime = 600,
	particleCount = 15,
	particleDistances = [90, 10],
	particleR = 100,
	timeVariance = 300,
	colors = [1, 2, 3, 1, 2, 3, 1, 4],
	initialActiveIndex = 0,
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const navRef = useRef<HTMLUListElement>(null);
	const filterRef = useRef<HTMLSpanElement>(null);
	const textRef = useRef<HTMLSpanElement>(null);
	const [activeIndex, setActiveIndex] = useState<number>(initialActiveIndex);
	const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
	const [submenuOpen, setSubmenuOpen] = useState<string | null>(null);
	const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const submenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	
	const makeParticles = (element: HTMLElement) => {
	const d: [number, number] = particleDistances;
		const r = particleR;
		const bubbleTime = animationTime * 2 + timeVariance;
		element.style.setProperty("--time", `${bubbleTime}ms`);
		for (let i = 0; i < particleCount; i++) {
			const t = animationTime * 2 + noise(timeVariance * 2);
			const p = createParticle(i, t, d, r, particleCount, colors);
			element.classList.remove("active");
			setTimeout(() => {
				const particle = document.createElement("span");
				const point = document.createElement("span");
				particle.classList.add("particle");
				particle.style.setProperty("--start-x", `${p.start[0]}px`);
				particle.style.setProperty("--start-y", `${p.start[1]}px`);
				particle.style.setProperty("--end-x", `${p.end[0]}px`);
				particle.style.setProperty("--end-y", `${p.end[1]}px`);
				particle.style.setProperty("--time", `${p.time}ms`);
				particle.style.setProperty("--scale", `${p.scale}`);
				particle.style.setProperty("--color", `var(--color-${p.color}, white)`);
				particle.style.setProperty("--rotate", `${p.rotate}deg`);
				point.classList.add("point");
				particle.appendChild(point);
				element.appendChild(particle);
				requestAnimationFrame(() => {
					element.classList.add("active");
				});
				setTimeout(() => {
					try {
						element.removeChild(particle);
					} catch {}
				}, t);
			}, 30);
		}
	};
	const updateEffectPosition = (element: HTMLElement) => {
		if (!containerRef.current || !filterRef.current || !textRef.current) return;
		const containerRect = containerRef.current.getBoundingClientRect();
		const pos = element.getBoundingClientRect();
		const styles = {
			left: `${pos.x - containerRect.x}px`,
			top: `${pos.y - containerRect.y}px`,
			width: `${pos.width}px`,
			height: `${pos.height}px`,
		};
		Object.assign(filterRef.current.style, styles);
		Object.assign(textRef.current.style, styles);
		textRef.current.innerText = element.innerText;
	};
	const handleClick = (e: React.MouseEvent<HTMLLIElement>, index: number) => {
		const liEl = e.currentTarget;
		const item = items[index];
		
		// If item has dropdown, don't do anything on click (handled by hover)
		if (item.dropdown) {
			return;
		}
		
		if (activeIndex === index) return;
		setActiveIndex(index);
		updateEffectPosition(liEl);
		if (filterRef.current) {
			const particles = filterRef.current.querySelectorAll(".particle");
			particles.forEach((p) => filterRef.current!.removeChild(p));
		}
		if (textRef.current) {
			textRef.current.classList.remove("active");
			void textRef.current.offsetWidth;
			textRef.current.classList.add("active");
		}
		if (filterRef.current) {
			makeParticles(filterRef.current);
		}
	};
	
	const handleMouseEnter = (index: number) => {
		const item = items[index];
		
		// Clear any existing timeout
		if (dropdownTimeoutRef.current) {
			clearTimeout(dropdownTimeoutRef.current);
			dropdownTimeoutRef.current = null;
		}
		
		// If item has dropdown, open it
		if (item.dropdown) {
			setDropdownOpen(index);
		} else {
			// Close dropdown if hovering over non-dropdown item
			setDropdownOpen(null);
			setSubmenuOpen(null);
		}
	};
	
	const handleMouseLeave = () => {
		// Delay closing to allow mouse to move to dropdown
		dropdownTimeoutRef.current = setTimeout(() => {
			setDropdownOpen(null);
			setSubmenuOpen(null);
		}, 150);
	};
	
	const handleDropdownMouseEnter = () => {
		// Cancel closing if mouse enters dropdown
		if (dropdownTimeoutRef.current) {
			clearTimeout(dropdownTimeoutRef.current);
			dropdownTimeoutRef.current = null;
		}
	};
	
	const handleDropdownMouseLeave = () => {
		// Close dropdown when mouse leaves
		setDropdownOpen(null);
		setSubmenuOpen(null);
	};
	
	const handleSubmenuMouseEnter = (groupLabel: string) => {
		// Clear any existing timeout
		if (submenuTimeoutRef.current) {
			clearTimeout(submenuTimeoutRef.current);
			submenuTimeoutRef.current = null;
		}
		setSubmenuOpen(groupLabel);
	};
	
	const handleSubmenuMouseLeave = () => {
		// Delay closing submenu
		submenuTimeoutRef.current = setTimeout(() => {
			setSubmenuOpen(null);
		}, 100);
	};
	const handleKeyDown = (
		e: React.KeyboardEvent<HTMLAnchorElement>,
		index: number,
	) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			const liEl = e.currentTarget.parentElement;
			if (liEl) {
				handleClick(
					{ currentTarget: liEl } as React.MouseEvent<HTMLLIElement>,
					index,
				);
			}
		}
	};
	
	useEffect(() => {
		if (!navRef.current || !containerRef.current) return;
		const activeLi = navRef.current.querySelectorAll("li")[
			activeIndex
		] as HTMLElement;
		if (activeLi) {
			updateEffectPosition(activeLi);
			textRef.current?.classList.add("active");
		}
		const resizeObserver = new ResizeObserver(() => {
			const currentActiveLi = navRef.current?.querySelectorAll("li")[
				activeIndex
			] as HTMLElement;
			if (currentActiveLi) {
				updateEffectPosition(currentActiveLi);
			}
		});
		resizeObserver.observe(containerRef.current);
		
		// Cleanup timeouts
		return () => {
			resizeObserver.disconnect();
			if (dropdownTimeoutRef.current) {
				clearTimeout(dropdownTimeoutRef.current);
			}
			if (submenuTimeoutRef.current) {
				clearTimeout(submenuTimeoutRef.current);
			}
		};
	}, [activeIndex]);

	return (
		<>
			<style>
				{`
          :root {
            --linear-ease: linear(0, 0.068, 0.19 2.7%, 0.804 8.1%, 1.037, 1.199 13.2%, 1.245, 1.27 15.8%, 1.274, 1.272 17.4%, 1.249 19.1%, 0.996 28%, 0.949, 0.928 33.3%, 0.926, 0.933 36.8%, 1.001 45.6%, 1.013, 1.019 50.8%, 1.018 54.4%, 1 63.1%, 0.995 68%, 1.001 85%, 1);
          }
          .effect {
            position: absolute;
            opacity: 1;
            pointer-events: none;
            display: grid;
            place-items: center;
            z-index: 1;
          }
          .effect.text {
            color: white;
            transition: color 0.3s ease;
          }
          .effect.text.active {
            color: black;
          }
          .effect.filter {
            filter: blur(7px) contrast(100) blur(0);
            mix-blend-mode: lighten;
          }
          .effect.filter::before {
            content: "";
            position: absolute;
            inset: -75px;
            z-index: -1;
            background: none;	
          }
          .effect.filter::after {
            content: "";
            position: absolute;
            inset: 0;
            background: white;
            transform: scale(0);
            opacity: 0;
            z-index: -1;
            border-radius: 9999px;
          }
          .effect.active::after {
          }
          @keyframes pill {
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
          .particle,
          .point {
            display: block;
            opacity: 0;
            width: 20px;
            height: 20px;
            border-radius: 9999px;
            transform-origin: center;
          }
          .particle {
            --time: 5s;
            position: absolute;
            top: calc(50% - 8px);
            left: calc(50% - 8px);
            animation: particle calc(var(--time)) ease 1 -350ms;
          }
          .point {
            background: var(--color);
            opacity: 1;
            animation: point calc(var(--time)) ease 1 -350ms;
          }
          @keyframes particle {
            0% {
              transform: rotate(0deg) translate(calc(var(--start-x)), calc(var(--start-y)));
              opacity: 1;
              animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45);
            }
            70% {
              transform: rotate(calc(var(--rotate) * 0.5)) translate(calc(var(--end-x) * 1.2), calc(var(--end-y) * 1.2));
              opacity: 1;
              animation-timing-function: ease;
            }
            85% {
              transform: rotate(calc(var(--rotate) * 0.66)) translate(calc(var(--end-x)), calc(var(--end-y)));
              opacity: 1;
            }
            100% {
              transform: rotate(calc(var(--rotate) * 1.2)) translate(calc(var(--end-x) * 0.5), calc(var(--end-y) * 0.5));
              opacity: 1;
            }
          }
          @keyframes point {
            0% {
              transform: scale(0);
              opacity: 0;
              animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45);
            }
            25% {
              transform: scale(calc(var(--scale) * 0.25));
            }
            38% {
              opacity: 1;
            }
            65% {
              transform: scale(var(--scale));
              opacity: 1;
              animation-timing-function: ease;
            }
            85% {
              transform: scale(var(--scale));
              opacity: 1;
            }
            100% {
              transform: scale(0);
              opacity: 0;
            }
          }
          li.active {
            color: black;
            text-shadow: none;
          }
          li.active::after {
            opacity: 1;
            transform: scale(1);
          }
          li::after {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: 8px;
            background: white;
            opacity: 0;
            transform: scale(0);
            transition: all 0.3s ease;
            z-index: -1;
          }
          .dropdown-menu {
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            margin-top: 0.5rem;
            background: rgba(0, 0, 0, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            padding: 0.75rem;
            min-width: 220px;
            z-index: 1000;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
          }
          .dropdown-group {
            margin-bottom: 0.5rem;
            position: relative;
          }
          .dropdown-group:last-child {
            margin-bottom: 0;
          }
          .dropdown-group-title {
            color: #06b6d4;
            font-size: 0.8rem;
            font-weight: 600;
            padding: 0.5rem 0.75rem;
            border-radius: 6px;
            transition: all 0.2s ease;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .dropdown-group-title:hover {
            background: rgba(6, 182, 212, 0.1);
          }
          .dropdown-submenu {
            margin-top: 0.25rem;
            margin-left: 0.5rem;
            border-left: 2px solid rgba(6, 182, 212, 0.3);
            padding-left: 0.5rem;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
          }
          .dropdown-submenu.open {
            max-height: 500px;
          }
          .dropdown-item {
            display: block;
            padding: 0.5rem 0.75rem;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            transition: all 0.2s ease;
            font-size: 0.875rem;
          }
          .dropdown-item:hover {
            background: rgba(6, 182, 212, 0.2);
            color: #06b6d4;
          }
        `}
			</style>
			<div className="relative" ref={containerRef}>
				<nav
					className="flex relative"
					style={{ transform: "translate3d(0,0,0.01px)" }}
				>
					<ul
						ref={navRef}
						className="flex gap-4 list-none p-0 px-4 m-0 relative z-[3]"
						style={{
							color: "white",
							textShadow: "0 1px 1px hsl(205deg 30% 10% / 0.2)",
						}}
					>
						{items.map((item, index) => (
							<li
								key={index}
								className={`py-[0.5em] px-[0.85em] rounded-full relative transition-[background-color_color_box-shadow] duration-300 ease shadow-[0_0_0.5px_1.5px_transparent] text-white text-[0.95rem] ${
									activeIndex === index ? "active" : ""
								}`}
								onClick={(e) => handleClick(e, index)}
								onMouseEnter={() => handleMouseEnter(index)}
								onMouseLeave={handleMouseLeave}
								style={{ cursor: item.dropdown ? 'pointer' : 'default' }}
							>
								{item.dropdown ? (
									<>
										<span className="outline-none flex items-center gap-1">
											{item.label}
											<svg 
												className={`w-3 h-3 transition-transform duration-200 ${dropdownOpen === index ? 'rotate-180' : ''}`} 
												fill="none" 
												stroke="currentColor" 
												viewBox="0 0 24 24"
											>
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
											</svg>
										</span>
										{dropdownOpen === index && (
											<div 
												className="dropdown-menu"
												onMouseEnter={handleDropdownMouseEnter}
												onMouseLeave={handleDropdownMouseLeave}
											>
												{item.dropdown.map((group, groupIndex) => (
													<div key={groupIndex} className="dropdown-group">
														<div 
															className="dropdown-group-title"
															onMouseEnter={() => handleSubmenuMouseEnter(group.label)}
														>
															{group.label}
															<svg 
																className={`w-3 h-3 transition-transform duration-200 ${submenuOpen === group.label ? 'rotate-180' : ''}`} 
																fill="none" 
																stroke="currentColor" 
																viewBox="0 0 24 24"
															>
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
															</svg>
														</div>
														<div 
															className={`dropdown-submenu ${submenuOpen === group.label ? 'open' : ''}`}
															onMouseEnter={() => {
																if (submenuTimeoutRef.current) {
																	clearTimeout(submenuTimeoutRef.current);
																	submenuTimeoutRef.current = null;
																}
															}}
															onMouseLeave={handleSubmenuMouseLeave}
														>
															{group.items.map((subItem, subIndex) => (
																<Link
																	key={subIndex}
																	href={subItem.href}
																	className="dropdown-item"
																	onClick={(e) => {
																		e.stopPropagation();
																		setDropdownOpen(null);
																		setSubmenuOpen(null);
																	}}
																>
																	{subItem.label}
																</Link>
															))}
														</div>
													</div>
												))}
											</div>
										)}
									</>
								) : (
									<Link
										href={item.href}
										onKeyDown={(e) => handleKeyDown(e, index)}
										className="outline-none"
									>
										{item.label}
									</Link>
								)}
							</li>
						))}
					</ul>
				</nav>
				<span className="effect filter" ref={filterRef} />
				<span className="effect text" ref={textRef} />
			</div>
		</>
	);
};

export default GooeyNav;