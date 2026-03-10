import type { NextConfig } from "next";

const RAILWAY_BACKEND_URL =
  process.env.RAILWAY_BACKEND_URL || process.env.BACKEND_URL;

const nextConfig: NextConfig = {
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
      {
        protocol: 'https',
        hostname: 'cdn.eadplataforma.app',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Permitir acesso de dispositivos na rede local
  allowedDevOrigins: ['192.168.0.101'],
  // Configurar variáveis de ambiente para desenvolvimento
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
    API_URL: process.env.API_URL || '/api',
  },
  async rewrites() {
    // Proxy reverso para esconder o domínio do backend no Railway
    if (!RAILWAY_BACKEND_URL) {
      throw new Error(
        'BACKEND_URL não definido.'
      );
    }

    return [
      {
        source: '/api/:path*',
        destination: `${RAILWAY_BACKEND_URL}/:path*`,
      },
    ];
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
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://s.ytimg.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: *.cloudinary.com *.ytimg.com; connect-src 'self' https: wss:; font-src 'self' data:; object-src 'none'; frame-src https://www.youtube.com https://www.youtube-nocookie.com; frame-ancestors 'none'; upgrade-insecure-requests"
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }
        ]
      }
    ]
  },
  turbopack: {},
};

export default nextConfig;
