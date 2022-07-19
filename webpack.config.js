const path = require('path')
const webpack = require('webpack')

module.exports = {
    entry: {
        index: {
          import: path.resolve(__dirname,'js', 'scripts', 'index.js'),
          //dependOn: 'shared',
        },
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js'
    },
    mode: process.env.NODE_ENV || 'development',
    resolve: {
        modules: [path.resolve(__dirname), 'node_modules']
    },
    module: {
        rules: [
            {
                test: /.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                  loader: "babel-loader"
                }
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
    ]
};