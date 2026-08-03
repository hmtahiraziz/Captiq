const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const projectRoot = __dirname;

const packagesUsingCompiledLib = {
  'react-native-vision-camera': path.join(
    projectRoot,
    'node_modules/react-native-vision-camera/lib/index.js',
  ),
  'react-native-nitro-modules': path.join(
    projectRoot,
    'node_modules/react-native-nitro-modules/lib/commonjs/index.js',
  ),
  'react-native-nitro-image': path.join(
    projectRoot,
    'node_modules/react-native-nitro-image/lib/commonjs/index.js',
  ),
};

const defaultConfig = getDefaultConfig(projectRoot);

const config = {
  resolver: {
    resolveRequest: (context, moduleName, platform) => {
      const compiledEntry = packagesUsingCompiledLib[moduleName];

      if (compiledEntry) {
        return {
          type: 'sourceFile',
          filePath: compiledEntry,
        };
      }

      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
