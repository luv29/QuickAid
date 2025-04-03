// Learn more: https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

// Get default Metro config
const defaultConfig = getDefaultConfig(__dirname);

// Fix Prisma client resolution issue and add tanstack/react-query
const extraNodeModules = {
  ".prisma/client/index-browser": path.resolve(
    __dirname,
    "node_modules/@prisma/client/index.js"
  ),
  ".prisma/client/default": path.resolve(
    __dirname,
    "node_modules/@prisma/client/index.js"
  ),
  "@tanstack/react-query": path.resolve(
    __dirname,
    "node_modules/@tanstack/react-query"
  ),
};

// Conditionally ignore Prisma for iOS bundling
defaultConfig.resolver = {
  ...defaultConfig.resolver,
  extraNodeModules,
  platforms: ["ios", "android", "native", ""],
  sourceExts: [
    "jsx",
    "js",
    "ts",
    "tsx",
    "json",
    "native",
    "ios.jsx",
    "ios.js",
    "ios.ts",
    "ios.tsx",
  ],
  blacklistRE: /node_modules\/@prisma\/client\/index-browser\.js|node_modules\/@prisma\/client\/default\.js/,
};

// Apply NativeWind support
module.exports = withNativeWind(defaultConfig, { input: "./global.css" });
