/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  // youtubei.js is Node-only; keep it out of the server bundle so Next
  // doesn't try to trace/bundle its native dependencies.
  experimental: { serverComponentsExternalPackages: ["youtubei.js"] },
};
module.exports = nextConfig;
