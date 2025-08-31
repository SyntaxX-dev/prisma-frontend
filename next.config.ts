import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Permitir acesso de dispositivos na rede local
  allowedDevOrigins: ['192.168.0.101'],
  // Configurar variáveis de ambiente para desenvolvimento
  env: {
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'production' 
      ? 'http://localhost:3333' 
      : 'http://192.168.0.101:3333',
    API_URL: process.env.NODE_ENV === 'production' 
      ? 'http://localhost:3333' 
      : 'http://192.168.0.101:3333',
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
