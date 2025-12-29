import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  reactCompiler: true,
  images: {
    unoptimized: true,
  },
  // API rewrites are not supported in export mode. 
  // When served by the backend, requests to /api will naturally go to the backend.
};

export default nextConfig;
