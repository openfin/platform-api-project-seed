const path = require("path");
  
const HtmlwebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: {
        example: './src/example.ts'
    },
    devtool: 'inline-source-map',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ]
    },
    plugins: [
        new HtmlwebpackPlugin({
            title: 'OpenFin Deployment Example',
            template: 'example.html',
            chunks: ['example'],
            filename: 'example.html'
        })
    ],
    devServer: {
        static : {
            directory : path.join(__dirname, 'build')
        },
        port: process.env.DEV_PORT,
        hot: 'only'
    }
};