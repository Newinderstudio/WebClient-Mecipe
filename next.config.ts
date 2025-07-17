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
  compiler:{
    emotion:true
  }
};

export default nextConfig;
