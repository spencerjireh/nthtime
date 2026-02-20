//@ts-check
const webpack = require('webpack');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  webpack(config, { isServer }) {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };

    // Resolve .js imports to .ts files (needed for libs using moduleResolution: nodenext)
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js'],
      '.jsx': ['.tsx', '.jsx'],
    };

    // The verification library (grammar-loader) uses dynamic import('node:fs') etc.
    // behind a runtime isBrowser() guard. These never execute in the browser, but
    // webpack still statically resolves them. Rewrite node: scheme to bare names,
    // then stub them out with fallbacks.
    if (!isServer) {
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
          resource.request = resource.request.replace(/^node:/, '');
        }),
      );

      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        'fs/promises': false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;
