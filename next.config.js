/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // Image configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatar.vercel.sh',
      },
    ],
  },

  // Experimental settings
  experimental: {
    esmExternals: true,
    serverComponentsExternalPackages: ['@prisma/client', 'bcrypt'],
    typedRoutes: false,
    optimizePackageImports: ['@radix-ui', 'lucide-react'],
  },

  // Webpack configuration 
  webpack: (config, { isServer }) => {
    // Warning suppression
    config.ignoreWarnings = [
      { module: /node_modules\/next\/dist\/build\/webpack\/loaders\/css-loader/ },
      { module: /node_modules\/next\/dist\/build\/webpack\/loaders\/postcss-loader/ },
      { message: /Critical dependency/ }
    ];

    // Handle problematic modules
    if (isServer) {
      const originalExternals = config.externals;
      
      config.externals = [
        ({ context, request }, callback) => {
          // Force these packages to be processed as CommonJS
          if (/^(axios|orderedmap|diff-match-patch|prosemirror-model)/.test(request)) {
            return callback(null, `commonjs ${request}`);
          }
          
          // Handle original externals
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

    // Add node polyfills
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      path: false,
      os: false,
      crypto: false,
    };

    return config;
  },


  // Optional: Python backend rewrites (only used if PYTHON_BACKEND_URL is set)
  // Most functionality is handled by Next.js API routes
  async rewrites() {
    const backendUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:8082';
    return [
      {
        source: '/chat/api/document',
        destination: `${backendUrl}/api/document-upload`
      },
      {
        source: '/api/files/upload',
        destination: `${backendUrl}/api/document-upload`
      },
      {
        source: '/python-api/chat',
        destination: `${backendUrl}/api/chat`
      },
      {
        source: '/python-api/history',
        destination: `${backendUrl}/api/history`
      },
      {
        source: '/python-api/loan-recommendation',
        destination: `${backendUrl}/api/loan-recommendation`
      },
      {
        source: '/python-api/estimate-rate',
        destination: `${backendUrl}/api/estimate-rate`
      },
      {
        source: '/health',
        destination: `${backendUrl}/health`
      }
    ];
  },

  // Headers - these remain the same
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
};

module.exports = nextConfig;