//@ts-check
const webpack = require('webpack');
const path = require('path');

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

    // monaco-emacs requires('monaco-editor') which resolves to the AMD bundle
    // (min/vs/editor/editor.main.js) containing internal loaders that webpack can't handle.
    // Redirect the bare import to a shim that re-exports window.monaco at runtime.
    // Applied to BOTH server and client builds because Next.js processes 'use client'
    // modules in the server compilation as well.
    const shimPath = path.resolve(__dirname, 'src/lib/monaco-editor-shim.js');
    config.resolve.alias = {
      ...config.resolve.alias,
      'monaco-editor$': shimPath,
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
