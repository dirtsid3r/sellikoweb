/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['sharp'],
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Performance optimizations for mobile-first
  compress: true,
  poweredByHeader: false,
  
  // Image optimization for responsive design
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [320, 420, 768, 1024, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/placeholder/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/api/placeholder/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3002',
        pathname: '/api/placeholder/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3003',
        pathname: '/api/placeholder/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3004',
        pathname: '/api/placeholder/**',
      },
      {
        protocol: 'https',
        hostname: 'selliko.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.selliko.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.vercel.app',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.vercel-storage.com',
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // PWA and mobile optimization
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
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
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Webpack optimizations for mobile performance
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize for mobile bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            chunks: 'all',
            reuseExistingChunk: true,
          },
        },
      };
    }

    // SVG support
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },

  // Environment variables for mobile-first development
  env: {
    NEXT_PUBLIC_APP_NAME: 'SELLIKO',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
    NEXT_PUBLIC_MOBILE_BREAKPOINT: '768',
    NEXT_PUBLIC_TABLET_BREAKPOINT: '1024',
  },

  // Redirects for mobile optimization
  async redirects() {
    return [
      {
        source: '/mobile',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Rewrites for API optimization
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: '/api/:path*',
      },
    ];
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Output configuration for deployment
  output: 'standalone',
  
  // Vercel-specific optimizations
  swcMinify: true,
  
  // Generate source maps in production for better debugging
  productionBrowserSourceMaps: process.env.NODE_ENV === 'development',
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Production source maps for debugging
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig; 