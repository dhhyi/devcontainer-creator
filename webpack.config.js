// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = () => ({
  entry: "./create.js",
  target: "node",
  mode: "production",
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: "bundle.js",
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
          mangle: true,
        },
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.gomplate$/i,
        use: "raw-loader",
      },
      {
        test: /\.json$/i,
        type: "javascript/auto",
        use: "raw-loader",
      },
    ],
  },
  plugins: [
    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/
  ],
});
