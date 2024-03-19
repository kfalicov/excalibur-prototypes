const { composePlugins, withNx } = require('@nx/webpack');
const path = require('path');

// Nx plugins for webpack.
module.exports = composePlugins((config) => {
  // Check if module.rules exists, if not, initialize it
  config.module = config.module || {};
  config.module.rules = config.module.rules || [];

  config.module.rules.push({
    test: /\.glsl$/,
    type: 'asset/source',
  });

  return config;
}, withNx({
  compiler: "swc",
  outputFileName: 'index',
  main: path.resolve(__dirname, './index.ts'),
  tsConfig: path.resolve(__dirname, 'tsconfig.json')
}));