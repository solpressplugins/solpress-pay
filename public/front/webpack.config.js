const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const autoprefixer = require("autoprefixer");
const WebpackBuildNotifierPlugin = require("webpack-build-notifier");

module.exports = (env) => {
  const configs = {
    entry: {
      app: "./src/index.js",
    },
    output: {
      filename: "[name].min.js",
      path: path.resolve(__dirname, "build"),
      assetModuleFilename: "images/[name][ext]",
    },
    devServer: {
      port: 3000,
      hot: true,
    },
    module: {
      rules: [
        //JS
        {
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
              plugins: [
                "@babel/plugin-proposal-class-static-block",
                "@babel/plugin-proposal-class-properties",
                "@babel/transform-runtime",
              ],
            },
          },
        },
        // CSS
        {
          test: /\.css$/i,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            { loader: "css-loader", options: { importLoaders: 1 } },
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  plugins: [autoprefixer({ supports: false })],
                },
              },
            },
          ],
        },

        //SASS
        {
          test: /\.s[ac]ss$/i,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            { loader: "css-loader", options: { importLoaders: 1 } },
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  plugins: [autoprefixer({ supports: false })],
                },
              },
            },
            "sass-loader",
          ],
        },

        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: "asset/resource",
        },

        {
          test: /\.(woff|woff2|eot|ttf)$/i,
          use: [
            {
              loader: "file-loader",
              options: {
                name: "[name].[ext]",
                outputPath: "fonts/",
                publicPath: "fonts/",
              },
            },
          ],
        },

        // HTML
        {
          test: /\.html$/i,
          loader: "html-loader",
        },
      ],
    },
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
      }),
      new WebpackBuildNotifierPlugin({
        title: "Title Here",
        suppressSuccess: true,
      }),
      new MiniCssExtractPlugin({
        filename: "[name].min.css",
        chunkFilename: "[name].css",
      }),
      new HtmlWebpackPlugin({
        template: "./src/index.html",
        filename: "index.html",
        chunks: ["app"],
        inject: "body",
      }),
      new CleanWebpackPlugin(),
    ],
  };

  if (env.NODE_ENV !== "production") {
    console.log("Looks like we are in DEVELOPMENT mode!");
    configs.mode = "development";
    configs.devtool = "source-map";
    configs.watch = true;
  } else {
    console.log("Looks like we are in PRODUCTION mode!");
    configs.mode = "production";
    configs.optimization = {
      minimize: true,
      minimizer: [
        `...`, //extending `terser-webpack-plugin`
        new CssMinimizerPlugin(),
      ],
    };
  }

  return configs;
};
