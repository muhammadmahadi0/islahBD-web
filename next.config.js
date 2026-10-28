/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  // youtubei.js is Node-only; keep it out of the server bundle so Next
  // doesn't try to trace/bundle its native dependencies.
  experimental: { serverComponentsExternalPackages: ["youtubei.js"] },
  // Seerah Maps moved from the Hajj hub to the Others hub (site IA).
  async redirects() {
    return [
      { source: "/hajj-umrah/places", destination: "/seerah", permanent: false },
      { source: "/hajj-umrah/map", destination: "/seerah/map", permanent: false },
      // Munajat-e-Maqbul now lives on the production site.
      { source: "/munajate", destination: "https://islahbd.com/munajat", permanent: false },
    ];
  },
};
module.exports = nextConfig;
