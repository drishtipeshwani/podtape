import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Allow all HTTPS images — podcast cover art comes from many CDN domains */
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
