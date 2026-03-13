import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingIncludes: {
    "/api/scans/\\[id\\]/export": ["./node_modules/pdfkit/js/data/**/*"],
  },
};

export default nextConfig;
