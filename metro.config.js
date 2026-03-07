const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Fix: "watcher.unstable_workerThreads" is an unknown option in newer Metro versions
if (config.watcher) {
  const { unstable_workerThreads, ...watcherRest } = config.watcher;
  config.watcher = watcherRest;
}

module.exports = config;
