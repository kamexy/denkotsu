import type { NextConfig } from "next";

const appVersion = process.env.npm_package_version ?? "0.1.0";
const appBuild = (
  process.env.CF_PAGES_COMMIT_SHA ??
  process.env.GITHUB_SHA ??
  ""
).slice(0, 7);

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion,
    NEXT_PUBLIC_APP_BUILD: appBuild,
  },
};

export default nextConfig;
