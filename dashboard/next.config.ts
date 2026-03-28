import type { NextConfig } from "next";
import webpack from "webpack";

const nextConfig: NextConfig = {
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        os: false,
        path: false,
      };
    }
    config.plugins.push(
      new webpack.IgnorePlugin({ resourceRegExp: /^pino-pretty$/ })
    );
    return config;
  },
};

export default nextConfig;
