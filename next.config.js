/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force dynamic rendering for all pages
  output: 'standalone',
  // Disable static optimization for pages that use dynamic features
  trailingSlash: false,
};

module.exports = nextConfig;
