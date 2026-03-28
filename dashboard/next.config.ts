import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  webpack: (config, { isServer, webpack }) => {
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
