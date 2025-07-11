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
    ],
  }}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
