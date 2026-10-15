// app/page.tsx

"use client"

import React from "react";
import dynamic from "next/dynamic";

// Above-the-fold components — imported eagerly (visible immediately)
import BlurText from "@/blocks/TextAnimations/BlurText/BlurText";
import TrueFocus from "@/blocks/TextAnimations/TrueFocus/TrueFocus";
import SkillTag from '@/components/SkillTag';
import { useIsDesktop } from '@/lib/useIsDesktop';

// Below-the-fold components — lazy loaded (only loaded when scrolled into view)
const TiltedCard = dynamic(() => import("@/blocks/Components/TiltedCard/TiltedCard"), { ssr: false });
const ExperienceTimeline = dynamic(() => import("@/components/ExperienceTimeline"), { ssr: false });
const ProjectCard = dynamic(() => import("@/components/ProjectCard"), { ssr: false });
const ScrollVelocity = dynamic(() => import("@/blocks/TextAnimations/ScrollVelocity/ScrollVelocity"), { ssr: false });
const AboutMe = dynamic(() => import("@/components/AboutMe"), { ssr: false });

// Threads pulls in ogl + a WebGL context. It is desktop-only, so it is also
// lazy loaded — mobile never downloads the chunk at all.
const Threads = dynamic(() => import("@/blocks/Backgrounds/Threads/Threads"), { ssr: false });

// Define your projects array.
//
// Only projects with a real screenshot of the live site are listed — a preview
// is the whole point of the card, so anything without one (no deployed build,
// only source) is left out rather than shown with a placeholder.
//
// `imageSrc` must be a 1200x750 laptop-frame WebP in public/proj/. Drop a
// screenshot in and run `node scripts/normalize-previews.mjs` to produce it.
// `link` points at the deployment, `repo` at the source. Icons are optional
// because public/techstack/ has no asset for every technology in use yet.
const projects = [
  {
    id: 1,
    number: '01',
    title: 'Foton',
    description: 'Physics Study Platform',
    role: 'Full Stack Developer',
    year: '2026',
    type: 'Web App',
    detailedDescription:
      'Platform belajar fisika untuk persiapan TKA: 15 materi lengkap dengan penjelasan, rumus, keterangan simbol, serta 75 soal latihan beserta pembahasan.',
    tech: [
      { label: 'Next.js', icon: '/techstack/nextjs.svg' },
      { label: 'TypeScript' },
      { label: 'Tailwind CSS', icon: '/techstack/tailwind.svg' },
    ],
    imageSrc: '/proj/foton.webp',
    link: 'https://foton-six.vercel.app',
    repo: 'https://github.com/xynnthincc/Foton',
  },
  {
    id: 2,
    number: '02',
    title: 'Hive',
    description: 'School Forum & Management',
    role: 'Full Stack Developer',
    year: '2026',
    type: 'Web App',
    detailedDescription:
      'Platform diskusi dan belajar yang dirancang khusus untuk sekolah: kelas digital yang interaktif, forum, dan manajemen pembelajaran dalam satu tempat.',
    tech: [
      { label: 'Next.js', icon: '/techstack/nextjs.svg' },
      { label: 'TypeScript' },
      { label: 'Express' },
    ],
    imageSrc: '/proj/hive.webp',
    link: 'https://hive-tawny-eight.vercel.app',
    repo: 'https://github.com/xynnthincc/Hive',
  },
  {
    id: 3,
    number: '03',
    title: 'Haneul',
    description: 'Jastip & Pre-Order Platform',
    role: 'Full Stack Developer',
    year: '2026',
    type: 'Web App',
    detailedDescription:
      'Platform jastip dan pre-order: belanja dan pre-order apa saja, dari luar negeri sampai toko lokal, dengan status yang transparan dari DP sampai resi. Dilengkapi katalog, batch pre-order, dan fitur gacha photocard.',
    tech: [
      { label: 'Next.js', icon: '/techstack/nextjs.svg' },
      { label: 'React', icon: '/techstack/react.svg' },
      { label: 'Tailwind CSS', icon: '/techstack/tailwind.svg' },
      { label: 'TypeScript' },
    ],
    imageSrc: '/proj/haneul.webp',
    link: 'https://haneulid.vercel.app',
    repo: 'https://github.com/xynnthincc/haneulid',
  },
  {
    id: 4,
    number: '04',
    title: 'Pactra',
    description: 'Verifiable Work Record',
    role: 'Full Stack Developer',
    year: '2026',
    type: 'AI + Blockchain',
    detailedDescription:
      'Ruang kerja terverifikasi: sepakati ruang lingkup, periksa buktinya, dan biarkan keputusan akhir tetap di tangan manusia. Dibangun di atas BOT Chain untuk menyimpan serta memverifikasi rekam kerja secara transparan.',
    tech: [
      { label: 'Next.js', icon: '/techstack/nextjs.svg' },
      { label: 'TypeScript' },
      { label: 'Blockchain' },
    ],
    imageSrc: '/proj/pactra.webp',
    repo: 'https://github.com/xynnthincc/CredChain',
  },
  {
    id: 5,
    number: '05',
    title: 'SMP Plus YPP Darussurur',
    description: 'School Website',
    role: 'Full Stack Developer',
    year: '2026',
    type: 'Web App',
    detailedDescription:
      'Website resmi SMP Plus YPP Darussurur: profil sekolah, halaman akademik, berita, galeri, dan penerimaan siswa baru dalam satu situs.',
    tech: [
      { label: 'Next.js', icon: '/techstack/nextjs.svg' },
      { label: 'TypeScript' },
      { label: 'Tailwind CSS', icon: '/techstack/tailwind.svg' },
    ],
    imageSrc: '/proj/darussurur.webp',
    repo: 'https://github.com/xynnthincc/spmb-darussurur',
  },
];

// Define your skill arrays
const devSkills = [
  'TypeScript', 'Next.js', 'React', 'Tailwind CSS', 'Node.js', 'Express',
  'Laravel', 'MySQL', 'Kotlin', 'C#', 'Unity', 'Firebase'
];

const contentSkills = [
  'Figma', 'Canva', 'Capcut', 'Adobe Premiere Pro', 'Adobe Illustrator'
];

export default function Home() {
  // Skip WebGL entirely on mobile — saves a full WebGL context + shader pipeline
  const isDesktop = useIsDesktop();

  return (
    <>
      {/* Main content area */}
      <main className="flex-grow flex flex-col items-center h-full relative pt-20">
        {/* Threads only on desktop — mobile gets a lightweight CSS fallback */}
        {isDesktop ? (
          <div style={{ width: '100%', height: '600px', position: 'absolute', bottom: '50'}}>
            <Threads
              amplitude={2.5}
              distance={0}
              enableMouseInteraction={false}
            />
          </div>
        ) : (
          <div style={{ width: '100%', height: '600px', position: 'absolute', bottom: '50', opacity: 0.08 }}
               className="bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        )}

        {/* ... other main content elements ... */}
        <div className="w-full flex justify-center items-center my-4 md:mt-15 text-center font-bold relative px-4 md:px-0">
          <BlurText
            text="Hi, I'm Zakii"
            delay={150}
            animateBy="letters"
            direction="top"
            className="lg:text-9xl md:text-7xl text-4xl text-center"
          />
        </div>

        <div className="font-bold text-center opacity-0 animate-fadeIn mt-1 md:mt-3">
          <TrueFocus
            sentence="Developer   Creator   Student"
            manualMode={true}
            blurAmount={5}
            borderColor="cyan"
            animationDuration={0.3}
            pauseBetweenAnimations={1}
            />
          </div>

        <div className="w-full items-center mt-60 mb-4 relative h-[300px] hidden md:block">
          <ScrollVelocity
            texts={['Zakii Maalik', 'Developer Creator Student']}
          />
        </div>

        <div className="flex-grow flex flex-col md:flex-row items-center justify-center w-full md:w-9xl md:mt-35 mt-10 md:space-x-50 space-x-0">
          {/* Tech Stack Section Start */}
          <div className="flex flex-col w-full max-w-lg px-4 md:px-0 mt-10 mb-20 space-y-8">
            {/* DEVELOP Card */}
            <div className="relative p-6 rounded-lg transition-transform duration-300 ease-in-out hover:scale-105 custom-corner-border">
              <h3 className="text-white font-bold md:text-2xl text-lg tracking-wide mb-3">
                DEVELOP
              </h3>
              <p className="text-gray-400 md:text-md text-sm mt-2 leading-relaxed mb-5">
                Started creating mobile applications using Flutter, FlutterFlow, and Firebase and eventually switched to Web Development using NextJS, React, and Tailwind
              </p>
              <h4 className="text-cyan-300 font-semibold mb-3 text-base">
                Skillset &amp; tools
              </h4>
              <div className="flex flex-wrap gap-2">
                {devSkills.map(skill => (
                  <SkillTag key={skill} skillName={skill} />
                ))}
              </div>
            </div>

            {/* CREATE Card */}
            <div className="relative p-6 rounded-lg transition-transform duration-300 ease-in-out hover:scale-105 custom-corner-border">
              <h3 className="text-white font-bold md:text-2xl text:lg tracking-wide mb-3">
                CREATE
              </h3>
              <p className="text-gray-400 md:text-md text-sm mt-2 leading-relaxed mb-5">
                My content creation journey evolved from a side hustle to serving other creators, achieving an average reach of 15 million within 90 days.
              </p>
              <h4 className="text-cyan-300 font-semibold mb-3 text-base">
                Skillset &amp; Tools
              </h4>
              <div className="flex flex-wrap gap-2">
                {contentSkills.map(skill => (
                  <SkillTag key={skill} skillName={skill} />
                ))}
              </div>
            </div>
          </div>
          {/* Tech Stack Section End */}

          {/* What I do Section */}
          <div className="flex flex-col">
            <BlurText
              text="What I do"
              delay={150}
              animateBy="words"
              direction="top"
              className="md:text-7xl text-3xl font-extrabold"
            />

            <div className="hidden md:block mt-10 mb-20">
              <TiltedCard
                imageSrc="/photos/me.jpg"
                altText="Zakii"
                captionText="Zakii Maalik"
                containerHeight="600px"
                containerWidth="500px"
                imageHeight="600px"
                imageWidth="500px"
                rotateAmplitude={10}
                scaleOnHover={1.1}
                showMobileWarning={false}
                showTooltip={false}
                displayOverlayContent={true}
                overlayContent={
                  <p className="bg-transparent px-4 py-2 border-1 border-dashed rounded-lg opacity-50 font-bold m-5 absolute top-5 left-85">
                    Zakii
                  </p>
                }
              />
            </div>

            <div className="md:hidden mt-10 mb-20">
              <TiltedCard
                imageSrc="/photos/me.jpg"
                altText="Zakii"
                captionText="Zakii Maalik"
                containerHeight="400px"
                containerWidth="300px"
                imageHeight="400px"
                imageWidth="300px"
                rotateAmplitude={10}
                scaleOnHover={1.1}
                showMobileWarning={false}
                showTooltip={false}
                displayOverlayContent={true}
                overlayContent={
                  <p className="bg-transparent px-4 py-2 border-1 border-dashed rounded-lg opacity-50 font-bold m-5 absolute">
                    Zakii
                  </p>
                }
              />
            </div>
          </div>
        </div>

        {/* About Me Section */}
        <AboutMe />

        {/* Experience Section */}
        <div className="flex w-full items-center justify-center p-4 md:mt-25 mt-5">
          <BlurText
            text=" My Experience"
            delay={150}
            animateBy="words"
            direction="top"
            className="md:text-7xl text-3xl font-extrabold"
          />
        </div>
        <ExperienceTimeline />

        <div className="flex w-full items-center justify-center p-4 md:mt-25 mt-5 font-extrabold">
          <BlurText
            text=" My Projects"
            delay={150}
            animateBy="letters"
            direction="top"
            className="md:text-7xl text-3xl font-extrabold"
          />
        </div>

        {/* Projects Section Start */}
        <div className="grid grid-cols-1 md:grid-cols-3 w-full max-w-[1400px] mx-auto mt-10">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
        {/* Projects Section End */}
      </main>

      {/* Footer Section */}
      <footer className="flex w-full items-center justify-center p-4 border-t border-white/[.15] text-white/50 text-sm font-light mt-20">
        <p>&copy; {new Date().getFullYear()} Zakii Maalik. All rights reserved.</p>
      </footer>
    </>
  );
}