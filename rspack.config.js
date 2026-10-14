const path = require("path");
const {
  CopyRspackPlugin,
  SwcJsMinimizerRspackPlugin,
} = require("@rspack/core");

const mode =
  process.env.NODE_ENV === "production" ? "production" : "development";
const legacyLoader = path.resolve(
  __dirname,
  "loaders/closure-module-loader.js"
);

const legacyScript = (file, globals, exportExpression) => ({
  test: path.resolve(__dirname, file),
  use: {
    loader: legacyLoader,
    options: { globals, exportExpression },
  },
  type: "javascript/auto",
});

const moduleRules = [
  legacyScript("blockly_compressed.js", {}, "{Blockly, goog}"),
  legacyScript(
    "blocks_compressed.js",
    {
      goog: "require('./shim/blockly.goog')",
      Blockly: "require('./shim/blockly.Blockly')",
    },
    "Blockly"
  ),
  legacyScript(
    "msg/messages.js",
    {
      Blockly: "require('../shim/blocks')",
      goog: "require('../shim/blockly.goog')",
    },
    "Blockly"
  ),
  legacyScript(
    "msg/scratch_msgs.js",
    {
      Blockly: "require('../shim/blocks-blockly-messages')",
      goog: "require('../shim/blockly.goog')",
    },
    "Blockly"
  ),
];

const libraryConfig = (name, type, outputPath) => ({
  mode,
  entry: { blocks: "./shim/index.js" },
  output: {
    library: name ? { name, type } : { type },
    path: outputPath,
    filename: "[name].js",
  },
  module: { rules: moduleRules },
  optimization: {
    minimizer: [
      new SwcJsMinimizerRspackPlugin({
        minimizerOptions: { mangle: false },
      }),
    ],
  },
  performance: { hints: false },
});

module.exports = [
  libraryConfig(null, "commonjs2", path.resolve(__dirname, "dist")),
  libraryConfig("Blockly", "umd", path.resolve(__dirname, "dist/web")),
  {
    mode,
    entry: "./shim/gh-pages.js",
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "gh-pages"),
    },
    optimization: { minimize: false },
    performance: { hints: false },
    plugins: [
      new CopyRspackPlugin({
        patterns: [
          {
            from: "node_modules/google-closure-library",
            to: "playgrounds/node_modules/google-closure-library",
          },
          { from: "blocks_common", to: "playgrounds/blocks_common" },
          { from: "blocks", to: "playgrounds/blocks" },
          { from: "core", to: "playgrounds/core" },
          { from: "media", to: "playgrounds/media" },
          { from: "msg", to: "playgrounds/msg" },
          { from: "tests", to: "playgrounds/tests" },
          {
            from: "*.js",
            to: "playgrounds",
            globOptions: { ignore: ["**/rspack.config.js"] },
          },
        ],
      }),
    ],
  },
];
