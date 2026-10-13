import type { NextConfig } from "next";

// Static export so the site can be hosted anywhere (GitHub Pages included).
// On GitHub Pages the site lives under /<repo-name>, set through NEXT_PUBLIC_BASE_PATH.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
};

export default nextConfig;
