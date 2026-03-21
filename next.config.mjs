/** @type {import('next').NextConfig} */
const isStatic = process.env.NEXT_PUBLIC_STATIC_MODE === 'true';

const nextConfig = {
  serverExternalPackages: ['@vercel/sandbox', 'e2b', '@daytonaio/sdk'],
  ...(isStatic && {
    output: 'export',
    basePath: '/agentnetes',
    images: { unoptimized: true },
  }),
};

export default nextConfig;
