const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');

var config = {
  output: {
    path: path.resolve(__dirname + '/dist/')
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        include: __dirname,
        exclude: /node_modules/
      },
      {
        test: /\.vue$/,
        loader: 'vue'
      },
      {
        test: /\.css$/,
        loader: 'style!less!css'
      }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin( {
      minimize : true,
      sourceMap : false,
      mangle: true,
      compress: {
        warnings: false
      }
    })
  ],
  resolveLoader: {
    moduleExtensions: ['-loader']
  }
}

module.exports = [
  // Config 1: For browser environment
  merge(config, {
    entry: path.resolve(__dirname + '/src/components/plugin.js'),
    output: {
      filename: 'multi-select.min.js',
      libraryTarget: 'window',
      library: 'MultiSelect',
    }
  }),

  // Config 2: For Node-based development environments
  merge(config, {
    entry: path.resolve(__dirname + '/src/components/MultiSelect.vue'),
    output: {
      filename: 'multi-select.js',
      libraryTarget: 'umd',
      library: 'multi-select',
      umdNamedDefine: true
    }
  })
]
