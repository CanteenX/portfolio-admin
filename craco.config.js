const path = require("path");

module.exports = {
  eslint: {
    enable: false,
  },
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@admin-platform/shared-types": path.resolve(__dirname, "src/shared/types/index.ts"),
      "@admin-platform/shared-sdk": path.resolve(__dirname, "src/shared/sdk/index.ts"),
      "@admin-platform/shared-rbac": path.resolve(__dirname, "src/shared/rbac/index.ts"),
    },
    configure: (webpackConfig) => {
      // Ensure .ts/.tsx are resolved for files within aliased paths
      const extensions = webpackConfig.resolve.extensions || [];
      if (!extensions.includes(".ts")) extensions.push(".ts");
      if (!extensions.includes(".tsx")) extensions.push(".tsx");
      webpackConfig.resolve.extensions = extensions;
      return webpackConfig;
    },
  },
};
