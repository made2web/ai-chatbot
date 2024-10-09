/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  images: {
    remotePatterns: [],
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignora erros de lint durante a construção
  },
};

export default nextConfig;
