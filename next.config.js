/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    // Disable SWC to avoid WebAssembly memory issues
    swcMinify: false,
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
};

module.exports = nextConfig;