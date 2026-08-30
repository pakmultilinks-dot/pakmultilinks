import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.8"],
  experimental: {
    cpus: 1,
    useTypeScriptCli: false,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2592000,
  },
  poweredByHeader: false,
};

export default nextConfig;
