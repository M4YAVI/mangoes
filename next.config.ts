import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "http://192.168.1.2:4309",
    "http://192.168.1.2:4300",
    "ws://192.168.1.2:4309",
    "ws://192.168.1.2:4300",
    "127.0.0.1:4309",
    "127.0.0.1:4300",
    "localhost:4309",
    "localhost:4300"
  ],
};

export default nextConfig;