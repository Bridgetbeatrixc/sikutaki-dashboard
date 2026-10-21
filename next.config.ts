import type { NextConfig } from "next";

// Frontend-only version: a static export that runs anywhere (GitHub Pages, Vercel, any static host).
// Data is kept in the browser; the AI assistant calls the Gemini API from the browser.
// On GitHub Pages the site lives under /<repo-name>, set through NEXT_PUBLIC_BASE_PATH.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
};

export default nextConfig;
