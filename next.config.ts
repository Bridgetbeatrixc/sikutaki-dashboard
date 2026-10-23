import type { NextConfig } from "next";

// Runs on Cloudflare Workers through OpenNext (see wrangler.jsonc), or any Node host: the login middleware, the auth callback and the AI assistant's API route need a server.
// For hosting under a sub-path, set NEXT_PUBLIC_BASE_PATH (e.g. /sikutaki).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  basePath,
  images: { unoptimized: true },
};

export default nextConfig;

