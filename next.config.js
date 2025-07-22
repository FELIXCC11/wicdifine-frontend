/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  
  
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082',
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'WICFIN',
    NEXT_PUBLIC_APP_ENVIRONMENT: process.env.NEXT_PUBLIC_APP_ENVIRONMENT || 'development',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002',
    PYTHON_SERVICE_URL: process.env.PYTHON_SERVICE_URL || 'http://localhost:8082',
    PYTHON_BACKEND_URL: process.env.PYTHON_BACKEND_URL || 'http://localhost:8082',
  },
  
  
  poweredByHeader: false,
  generateEtags: false,
  reactStrictMode: true,
  
  // Experimental settings (PRESERVED)
  experimental: {
    esmExternals: true,
    serverComponentsExternalPackages: ['@prisma/client', 'bcrypt'],
    typedRoutes: false,
    optimizePackageImports: ['@radix-ui', 'lucide-react'],
  },

  // Webpack configuration (OPTIMIZED FOR BUNDLE SIZE)
  webpack: (config, { isServer }) => {
    config.ignoreWarnings = [
      { module: /node_modules\/next\/dist\/build\/webpack\/loaders\/css-loader/ },
      { module: /node_modules\/next\/dist\/build\/webpack\/loaders\/postcss-loader/ },
      { message: /Critical dependency/ }
    ];

    // Bundle size optimization
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            enforce: true,
          },
          ai: {
            test: /[\\/]node_modules[\\/](@ai-sdk|openai|ai)[\\/]/,
            name: 'ai-libs',
            priority: 20,
            enforce: true,
          },
          editor: {
            test: /[\\/]node_modules[\\/](codemirror|prosemirror|@codemirror)[\\/]/,
            name: 'editor-libs',
            priority: 20,
            enforce: true,
          },
        },
      },
    };

    if (isServer) {
      const originalExternals = config.externals;
      config.externals = [
        ({ context, request }, callback) => {
          if (/^(axios|orderedmap|diff-match-patch|prosemirror-model)/.test(request)) {
            return callback(null, `commonjs ${request}`);
          }
          if (typeof originalExternals === 'function') {
            return originalExternals({ context, request }, callback);
          } else if (Array.isArray(originalExternals)) {
            return callback();
          }
          return callback();
        },
        ...(Array.isArray(originalExternals) ? originalExternals : [])
      ];
    }

    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      path: false,
      os: false,
      crypto: false
    };

    
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');

    return config;
  },

  // Modular imports for tree shaking
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },

  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    unoptimized: true,
  },
  
  // API rewrites (PRESERVED + ENHANCED with safer fallbacks)
  async rewrites() {
    const backendUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:8082';
    
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`
      },
      {
        source: '/chat/api/document',
        destination: `${backendUrl}/api/document-upload`
      },
      {
        source: '/api/files/upload',
        destination: `${backendUrl}/api/document-upload`
      },
      {
        source: '/api/chat',
        destination: `${backendUrl}/api/chat`
      },
      {
        source: '/api/history',
        destination: `${backendUrl}/api/history`
      },
      {
        source: '/health',
        destination: `${backendUrl}/health`
      }
    ];
  },

  // Security headers (PRESERVED)
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
      ]
    }
  ],
  
  
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;