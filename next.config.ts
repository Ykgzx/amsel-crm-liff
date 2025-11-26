// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // แทนที่ mapbox-gl ด้วย maplibre-gl ตอน build client
      config.resolve = {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          'mapbox-gl': 'maplibre-gl',
        },
      };
    }
    return config;
  },
  // ช่วยให้ maplibre-gl ทำงานได้ดีใน Next.js
  transpilePackages: ['maplibre-gl'],
};

export default nextConfig;