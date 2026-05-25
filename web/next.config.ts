import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Future-proof: tighten when Phase 1 wires SSE.
  poweredByHeader: false,
};

export default nextConfig;
