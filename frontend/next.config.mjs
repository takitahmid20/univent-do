/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // BACKEND_API_URL: 'http://146.190.103.123:5656',
    BACKEND_API_URL: 'http://127.0.0.1:5656/',

  },
  output: 'standalone',
  // Disable ESLint during build (temporary fix)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable type checking during build (temporary fix)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Allow image domains
  images: {
    domains: ['146.190.103.123', 'res.cloudinary.com'],
  }
};

export default nextConfig;