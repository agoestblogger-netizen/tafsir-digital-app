import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    skipWaiting: true,
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  reactStrictMode: false,
  /* config options here */
  experimental: {
    // next-pwa can struggle with server components in React 19;
    // optimizing package imports sometimes mitigates webpack errors
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  }
};

export default withPWA(nextConfig);
