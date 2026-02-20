//@ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };

    // Resolve .js imports to .ts files (needed for libs using moduleResolution: nodenext)
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js'],
      '.jsx': ['.tsx', '.jsx'],
    };

    return config;
  },
};

module.exports = nextConfig;
