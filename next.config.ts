import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["pdfkit"],
  outputFileTracingIncludes: {
    "/api/scans/\\[id\\]/export": ["./node_modules/pdfkit/**/*"],
  },
};

export default nextConfig;
