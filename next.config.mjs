/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bodlensesportugal.com',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
}
export default nextConfig
