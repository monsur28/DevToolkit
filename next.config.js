/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    // Disable SWC to avoid WebAssembly memory issues
    swcMinify: false,
    // Disable Google Fonts optimization to prevent AbortError during build
    fontLoaders: [
      { loader: '@next/font/google', options: { subsets: ['latin'] } },
    ],
  },
  // Disable Google Fonts optimization at build time
  env: {
    NEXT_FONT_GOOGLE_OPTIMIZED: 'false',
  },
  webpack: (config, { dev, isServer }) => {
    // Optimize webpack for memory usage
    if (dev) {
      config.cache = false;
      config.optimization = {
        ...config.optimization,
        minimize: false,
      };
    }
    
    // Reduce memory usage
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    return config;
  },
  // Important: Remove the static export to enable API routes
  // output: 'export', // This line should be removed
};

module.exports = nextConfig;