// next.config.js
module.exports = {
  serverExternalPackages: ["sharp", "onnxruntime-node"],
  webpack: (config: { resolve: { alias: any } }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false,
      "onnxruntime-node$": false,
    };
    return config;
  },
};
