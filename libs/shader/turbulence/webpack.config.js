const { composePlugins, withNx, withWeb } = require('@nx/webpack');

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), (config) => {
  // Update the webpack config as needed here.
  // e.g. `config.plugins.push(new MyPlugin())`
  config.module = {
    rules: [
      {
        test: /\.glsl$/,
        use: 'asset/source',
      },
    ],
  };
  return config;
});