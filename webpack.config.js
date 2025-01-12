const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); // Импорт плагина

module.exports = {
  entry: "./src/index.tsx", // Точка входа
  output: {
    path: path.resolve(__dirname, "build"), // Папка сборки
    filename: "static/js/[name].[contenthash].js", // Хэшированный файл
    publicPath: "/", // Для роутинга
    clean: true, // Очистка build-папки перед сборкой
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"], // Расширения файлов
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: "babel-loader", // Лоадер для JS/TSX
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader, // Вместо style-loader
          "css-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|eot|ttf|otf|webp)$/,
        type: "asset/resource",
        generator: {
          filename: "static/media/[name].[hash][ext]", // Файлы медиа
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html", // HTML-шаблон
    }),
    new MiniCssExtractPlugin({
      filename: "static/css/[name].[contenthash].css",
    }),
  ],
  devServer: {
    static: "./build", // Статические файлы
    historyApiFallback: true, // React Router
    port: 3000, // Порт для локальной разработки
    hot: true, // Горячая перезагрузка
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
  },
  mode: "development", // Установлено для разработки
};
