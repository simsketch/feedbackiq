import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/c/:slug",
        destination: "/changelog/:slug",
        permanent: true,
      },
      {
        source: "/c/:slug/feed.xml",
        destination: "/changelog/:slug/feed.xml",
        permanent: true,
      },
      {
        source: "/r/:slug",
        destination: "/roadmap/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
