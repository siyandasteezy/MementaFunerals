/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',      // static HTML/CSS/JS — no Node.js needed
  trailingSlash: true,   // /dashboard → /dashboard/index.html (works on Apache)
  images: {
    unoptimized: true,   // next/image optimization requires a server; skip it
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
  },
};

module.exports = nextConfig;
