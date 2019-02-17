const path = require('path')
// const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  // devtool: 'eval',
  mode: 'production',
  entry: './main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd',
    library: 'SliderX',
    filename: 'slider-x.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: { presets: ['@babel/preset-env'] }
        }
      }
    ]
  },
  // optimization: {
  //   minimizer: [
  //     new TerserPlugin({
  //       cache: true,
  //       parallel: true,
  //       sourceMap: true, // Must be set to true if using source-maps in production
  //     }),
  //   ],
  // },
  mode: 'production',
  // watch : true,
}