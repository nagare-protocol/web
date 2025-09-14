import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["randomuser.me"],
  },
  serverExternalPackages: ["@reclaimprotocol/zk-fetch"],
};

export default nextConfig;
