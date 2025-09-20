import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Configuração de imagens para permitir domínios externos
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'yt3.ggpht.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Permitir acesso de dispositivos na rede local
  allowedDevOrigins: ['192.168.0.101'],
  // Configurar variáveis de ambiente para desenvolvimento
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://prisma-backend-production-4c22.up.railway.app',
    API_URL: process.env.API_URL || 'https://prisma-backend-production-4c22.up.railway.app',
  },
  webpack: (config, { isServer }) => {
    // Resolver problema do canvas no build
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        'canvas-prebuilt': false,
      };
    }

    // Ignorar módulos problemáticos
    config.externals = config.externals || [];
    config.externals.push({
      canvas: 'canvas',
      'canvas-prebuilt': 'canvas-prebuilt',
    });

    return config;
  },
};

export default nextConfig;
