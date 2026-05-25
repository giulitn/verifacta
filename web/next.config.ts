import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

const nextConfig: NextConfig = {
  // Treat .mdx files as routable pages alongside .tsx
  pageExtensions: ["ts", "tsx", "js", "jsx", "mdx"],
  poweredByHeader: false,
};

export default withMDX(nextConfig);
