/** @type {import('next').NextConfig} */

const API_URL = process.env.API_URL;

const nextConfig = {
  reactStrictMode: false,
  // productionBrowserSourceMpas: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8888',
        pathname: '/uploaded/**',
      },
    ],
  },
  async rewrites() {
    return {
      fallback: [
        {
          source: '/api/:path*',
          destination: `http://${API_URL}/:path*/`,
        },
      ],
    };
  },
};

module.exports = nextConfig;
