import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  // Add empty turbopack config to acknowledge we're using webpack config
  turbopack: {},
};

export default withPWA({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
