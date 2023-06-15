const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WebpackBuildNotifierPlugin = require("webpack-build-notifier");
const webpack = require("webpack");

module.exports = function override(config, env) {
  return {
    ...config,
    ignoreWarnings: [
      {
        // Change this to fit your needs
        module: /node_modules\/@walletconnect/,
      },
      {
        // Change this to fit your needs
        module: /node_modules\/@particle-network/,
      },
      {
        // Change this to fit your needs
        module: /node_modules\/@solana/,
      },
      {
        // Change this to fit your needs
        module: /node_modules\/eth-rpc-errors/,
      },
      {
        // Change this to fit your needs
        module: /node_modules/,
      },
    ],    
    module: {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          test: /\.(m?js|ts)$/,
          enforce: "pre",
          use: ["source-map-loader"],
        },
      ],
    },
    resolve: {
      ...config.resolve,
      fallback: {
        assert: require.resolve("assert"),
        buffer: require.resolve("buffer"),
        stream: require.resolve("stream-browserify"),
        "crypto": require.resolve("crypto-browserify"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "zlib": false,
        "url": false,
      },
    },
    output: {
      filename: "static/js/[name].min.js",
      chunkFilename: "static/js/[name].min.js",
      path: path.resolve(__dirname, "build"),
    },
    plugins: [
      ...config.plugins,
      new MiniCssExtractPlugin({
        filename: "static/css/[name].min.css",
      }),
      new WebpackBuildNotifierPlugin({
        title: "SolPress React",
        suppressSuccess: true,
      }),
      new webpack.ProvidePlugin({
        process: "process/browser",
      }),
    ],
  };
};
