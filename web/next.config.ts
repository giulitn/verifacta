import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    // Turbopack requires plugin references to be serializable, so we pass
    // the package name as a string rather than the imported function.
    // GFM enables pipe-tables, strikethrough, task lists, autolinks.
    remarkPlugins: [["remark-gfm"]],
  },
});

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "js", "jsx", "mdx"],
  poweredByHeader: false,
};

export default withMDX(nextConfig);
