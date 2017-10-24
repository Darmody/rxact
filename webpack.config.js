const webpack = require('webpack')
const path = require('path')
const srcPath = path.resolve(__dirname, 'src')

const env = process.env.NODE_ENV

const reactExternal = {
  root: 'React',
  commonjs2: 'react',
  commonjs: 'react',
  amd: 'react'
}

const config = {
  externals: {
    react: reactExternal,
  },
  entry: './src/index.js',
  resolve: {
    modules: [
      'node_modules',
      srcPath,
    ],
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      ],
      include: srcPath,
    }],
  },
  output: {
    library: 'rxcat',
    libraryTarget: 'umd',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env)
    }),
  ],
}

if (env === 'production') {
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false
      }
    })
  )
}

module.exports = config
