import type { NextConfig } from "next";

// Server-rendered app (accounts, database). Deployed on Vercel; needs DATABASE_URL in production.
const nextConfig: NextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  serverExternalPackages: ["postgres"],
};

export default nextConfig;
