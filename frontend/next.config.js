/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['api.cerdik-ai.my.id'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
