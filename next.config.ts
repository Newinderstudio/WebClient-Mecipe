import type { NextConfig } from "next";

module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.imweb.me',
        port: '',
        pathname: '/upload/**',
      },
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_ROOTURL,
        port: '',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: '3nqndz90t07d5lyh.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '7iztxeokaeg105hm.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
    minimumCacheTTL: 100800, // 한달간 캐시 유지
  }
}

const nextConfig: NextConfig = {
  /* config options here */
  compiler: {
    emotion: true
  },
  transpilePackages: ['three'],
};

export default nextConfig;
