import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      }
    ],
  },
  outputFileTracingIncludes: {
    "/api/info": ["./bin/**"],
    "/api/convert": ["./bin/**"],
  },
  outputFileTracingExcludes: {
    "*": [
      "./.git/**",
      "./.vercel/**",
      "./.claude/**",
      "./.env*",
      "./*.md",
      "./Dockerfile",
      "./.dockerignore",
      "./tsconfig.tsbuildinfo",
    ],
  },
};

export default nextConfig;
