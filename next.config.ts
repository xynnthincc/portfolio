import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Pinned explicitly so builds don't fail on type errors from vendored
  // react-bits JSX blocks. Remove once `npx tsc --noEmit` is clean.
  typescript: {
    ignoreBuildErrors: true,
  },

  turbopack: {
    // A package-lock.json exists one directory above this project, which makes
    // Next pick the wrong workspace root and print a warning on every build.
    root: process.cwd(),
  },

  poweredByHeader: false,

  images: {
    // WebP first, AVIF fallback. next/image already skips SVG optimization.
    formats: ['image/webp'],
  },

  // Tree-shake heavy libraries — hanya import yang dipakai yang di-bundle
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react', 'gsap'],
  },
};

export default nextConfig;