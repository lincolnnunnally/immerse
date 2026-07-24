import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.recreation.gov",
      },
      {
        protocol: "https",
        hostname: "ridb.recreation.gov",
      },
    ],
  },
};

export default nextConfig;
