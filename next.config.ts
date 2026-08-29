import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@modelcontextprotocol/server",
    "@modelcontextprotocol/core",
    "mcp-handler",
  ],
};

export default nextConfig;
