import type { NextConfig } from "next";
const withPWA = require("@ducanh2912/next-pwa").default;

const nextConfig: NextConfig = {};

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
