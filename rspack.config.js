// patch 'fs' to fix EMFILE errors, for example on WSL
var realFs = require('fs');
var gracefulFs = require('graceful-fs');
gracefulFs.gracefulify(realFs);

var rspack = require('@rspack/core');
var path = require('path');



module.exports = [{
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: {
    vertical: './shim/vertical.js'
  },
  output: {
    library: 'ScratchBlocks',
    libraryTarget: 'commonjs2',
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  optimization: {
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin({
        minimizerOptions: {
          mangle: false
        }
      })
    ]
  },
  performance: {
    hints: false
  }
}, {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: {
    vertical: './shim/vertical.js'
  },
  output: {
    library: 'Blockly',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist', 'web'),
    filename: '[name].js'
  },
  optimization: {
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin({
        minimizerOptions: {
          mangle: false
        }
      })
    ]
  },
  plugins: []
},
{
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './shim/gh-pages.js',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'gh-pages')
  },
  optimization: {
    minimize: false
  },
  performance: {
    hints: false
  },
  plugins: [
    new rspack.CopyRspackPlugin({patterns: [{
        from: 'node_modules/google-closure-library',
        to: 'closure-library'
      }, {
        from: 'blocks_common',
        to: 'playgrounds/blocks_common',
      }, {
        from: 'blocks_vertical',
        to: 'playgrounds/blocks_vertical',
      }, {
        from: 'core',
        to: 'playgrounds/core'
      }, {
        from: 'media',
        to: 'playgrounds/media'
      }, {
        from: 'msg',
        to: 'playgrounds/msg'
      }, {
        from: 'tests',
        to: 'playgrounds/tests'
      }, {
        from: '*.js',
        ignore: 'rspack.config.js',
        to: 'playgrounds'
  }]})
  ]
}];
