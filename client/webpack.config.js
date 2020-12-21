require('dotenv').config();
const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: ['./src/index.js'],
  output: {
    path: path.resolve(__dirname, 'build'),
    publicPath: '/build/',
    'filename': 'bundle.js'
  },
  devServer: {
    contentBase: './build/',
    watchContentBase: true
  },
  module: {
    rules: [
      {
        test: [/\.vert$/, /\.frag$/],
        use: 'raw-loader'
      },
      {
        test: /\.js$/,
        use: { loader: 'babel-loader' },
        exclude: /node_modules/,
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'CANVAS_RENDER': JSON.stringify(true),
      'WEBGL_RENDER': JSON.stringify(true),
      'SERVER_URL': JSON.stringify(process.env.SERVER_URL),
      'TOKEN_INTERVAL': JSON.stringify(process.env.TOKEN_INTERVAL),
      'BYPASS_AUTH': JSON.stringify(process.env.BYPASS_AUTH),
    })
  ]
}
