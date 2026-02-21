/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@perf-patrol/database'],
    output: 'standalone',
};

module.exports = nextConfig;
