import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  transpilePackages: [
    "@tracebench/ui",
    "@tracebench/schemas",
    "@tracebench/fixtures",
    "@tracebench/evals",
    "@tracebench/domain",
    "@tracebench/agent-runtime",
  ],
  experimental: {
    externalDir: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@tracebench/ui": path.resolve(__dirname, "../../packages/ui/src"),
      "@tracebench/schemas": path.resolve(__dirname, "../../packages/schemas/src"),
      "@tracebench/fixtures": path.resolve(__dirname, "../../packages/fixtures/src"),
      "@tracebench/evals": path.resolve(__dirname, "../../packages/evals/src"),
      "@tracebench/domain": path.resolve(__dirname, "../../packages/domain/src"),
      "@tracebench/agent-runtime": path.resolve(
        __dirname,
        "../../packages/agent-runtime/src",
      ),
    };
    return config;
  },
};

export default nextConfig;
