const path = require('path')
const webpack = require('webpack')

const config = {
    entry: {
        gtm: path.join(__dirname, 'src', 'entry', 'gtm.js'),
        iframe: path.join(__dirname, 'src', 'entry', 'iframe.js'),
        top: path.join(__dirname, 'src', 'entry', 'top.js'),
    },
    output: {
        filename: '[name].js',
        path: __dirname,
    },
    devtool: '#sourcemap',
    mode: process.env.ENV || 'production',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['es2015', 'stage-2'],
                        comments: false,
                    },
                },
            },
        ],
    },
    plugins: [
            new webpack.DefinePlugin({
                'process.env.BRAND': JSON.stringify(process.env.BRAND || 'Renault'),
            }),
    ],
}

module.exports = config
