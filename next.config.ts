import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.recreation.gov" },
      { protocol: "https", hostname: "www.recreation.gov" },
      { protocol: "https", hostname: "**.recreation.gov" },
      { protocol: "https", hostname: "ridb.recreation.gov" },
    ],
  },
};

export default nextConfig;
