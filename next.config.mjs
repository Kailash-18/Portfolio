import { fileURLToPath } from "node:url";

export default {
  outputFileTracingIncludes: { "/api/resume/file": ["./private/Kailash-Ambadipudi-Resume.pdf"] },
  images: { unoptimized: true },
  devIndicators: false,
  turbopack: { root: fileURLToPath(new URL(".", import.meta.url)) },
};
