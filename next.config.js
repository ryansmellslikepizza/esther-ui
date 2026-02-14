/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      { source: "/api/:path*", destination: "http://localhost:3000/api/:path*" },
      { source: "/outputs/:path*", destination: "http://localhost:3000/outputs/:path*" },
    ];
  },
  devIndicators: false,
};

module.exports = nextConfig;
