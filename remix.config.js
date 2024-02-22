/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // publicPath: "/build/",
  // serverBuildPath: "build/index.js",
  browserNodeBuiltinsPolyfill: {
    modules: {
      events: true,
      crypto: true,
      dns: true,
      fs: true,
      net: true,
      assert: true,
      tls: true,
      path: true,
      stream: true,
      string_decoder: true,
      util: true,
      buffer: true,
      zlib: true,
      url: true,
    },
  },
};
