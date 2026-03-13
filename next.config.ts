import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // c2pa-node はネイティブバインディングを持つため、サーバーサイドのみで動作させる
  serverExternalPackages: ['c2pa-node'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
}

export default nextConfig
