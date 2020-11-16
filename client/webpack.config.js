const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  output:{
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/',
    filename: 'main-dev.js'
  },
  module:{
    rules: [
      {
      test:[/\.vert$/, /\.frag$/],
      use: 'raw-loader'
    },
      {
      test: /\.js$/,
      use: { loader: 'babel-loader'},
      exclude: /node_modules/,
    }
  ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'CANVAS_RENDER': JSON.stringify(true),
      'WEBGL_RENDER': JSON.stringify(true)
    })
  ]
}
