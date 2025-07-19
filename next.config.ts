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
    ],
    minimumCacheTTL: 25200, // 일주일간 캐시 유지
  }
}

const nextConfig: NextConfig = {
  /* config options here */
  compiler: {
    emotion: true
  }
};

export default nextConfig;
