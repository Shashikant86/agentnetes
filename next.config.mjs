/** @type {import('next').NextConfig} */
const isStatic = process.env.NEXT_PUBLIC_STATIC_MODE === 'true';
const isStandalone = process.env.BUILD_STANDALONE === 'true';

const nextConfig = {
  serverExternalPackages: ['@vercel/sandbox', 'e2b', '@daytonaio/sdk'],
  ...(isStatic && {
    output: 'export',
    basePath: '/agentnetes',
    images: { unoptimized: true },
  }),
  ...(isStandalone && {
    output: 'standalone',
  }),
};

export default nextConfig;
