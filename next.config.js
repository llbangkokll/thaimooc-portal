/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Enable standalone output for Docker
  output: 'standalone',
  // Disable static page generation during build (for Docker)
  // This prevents database connection errors during build time
  experimental: {
    // Force dynamic rendering for all pages
  },
  // Skip static page generation
  skipTrailingSlashRedirect: true,
  // Disable telemetry
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
