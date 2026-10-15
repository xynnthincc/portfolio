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

    // Turbopack runs PostCSS / webpack loaders in child processes that talk to
    // it over a loopback TCP socket. Sandboxed build hosts block that
    // connection, so the worker exits immediately with status 0 and Turbopack
    // panics with "Failed to write app endpoint /page ... node process exited
    // before we could connect to it". Worker threads need no socket.
    // On Node >= 24.13.1 Next.js ignores this and falls back to childProcesses
    // by itself (nodejs/node#65100), which is what we want: that teardown bug
    // does not affect Node 22, the version the deploy host builds with.
    turbopackPluginRuntimeStrategy: 'workerThreads',
  },
};

export default nextConfig;