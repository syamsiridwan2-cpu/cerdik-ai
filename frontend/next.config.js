/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/favicon.ico',
        destination: '/favicon.svg',
      },
      {
        source: '/api/:path*',
        destination: `${process.env.API_BACKEND_URL || 'http://100.85.152.98:8082'}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
