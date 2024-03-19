module.exports = {
  module: {
    rules: [
      {
        test: /\.glsl$/,
        use: 'asset/source',
      },
    ],
  },
};