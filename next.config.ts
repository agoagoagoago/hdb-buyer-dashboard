import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project so an unrelated lockfile elsewhere on the
  // machine isn't mistaken for the root (also keeps Vercel builds unambiguous).
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
