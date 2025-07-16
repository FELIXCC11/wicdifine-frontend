/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  // Experimental settings
  experimental: {
    esmExternals: true,
    serverComponentsExternalPackages: ['@prisma/client', 'bcrypt'],
    typedRoutes: false,
    optimizePackageImports: ['@radix-ui', 'lucide-react'],
  },

  webpack: (config, { isServer }) => {
  config.ignoreWarnings = [
    { module: /node_modules\/next\/dist\/build\/webpack\/loaders\/css-loader/ },
    { module: /node_modules\/next\/dist\/build\/webpack\/loaders\/postcss-loader/ },
    { message: /Critical dependency/ }
  ];

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

  // ✅ ADD THIS LINE
  config.resolve.alias['@'] = path.resolve(__dirname, 'src');

  return config;
},


  
  async rewrites() {
    return [

      {
        source: '/api/:path*',
        destination: process.env.PYTHON_BACKEND_URL || 'http://localhost:8082/api/:path*'
      },

      {
        source: '/chat/api/document',
        destination: process.env.PYTHON_BACKEND_URL || 'http://localhost:8082/api/document-upload'
      },

      {
        source: '/api/files/upload',
        destination: process.env.PYTHON_BACKEND_URL || 'http://localhost:8082/api/document-upload'
      },

      {
        source: '/api/chat',
        destination: process.env.PYTHON_BACKEND_URL || 'http://localhost:8082/api/chat'
      },

      {
        source: '/api/history',
        destination: process.env.PYTHON_BACKEND_URL || 'http://localhost:8082/api/history'
      },
      {
        source: '/health',
        destination: process.env.PYTHON_BACKEND_URL || 'http://localhost:8082/health'
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