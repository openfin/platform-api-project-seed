const path = require('path');
const { launch } = require('hadouken-js-adapter');
const CopyPlugin = require('copy-webpack-plugin');
const fs = require('fs');

const appJson = 'app.json';
const localJson = 'local.json';
const localJsonPath = './static/local.json';

const manifestFile = fs.existsSync(localJsonPath) ? localJson : appJson;

console.log(`Using file at ./static/${manifestFile}`);

module.exports = {
    mode: 'development',
    entry: {
        'provider': './src/provider/provider.ts',
        'window': './src/window/window.ts',
        'color-view': './src/color-view/color-view.js'
    },
    module: {
        rules: [
            {
                test: /\.[t|j]sx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        filename: '[name].bundle.js'
    },
    plugins: [
        new CopyPlugin({
            patterns: [{ from: 'static', to: '' }]
        })
    ],
    devServer: {
        contentBase: path.join(__dirname, 'static'),
        compress: true,
        port: 5555,
        onListening() {
            launch({ manifestUrl: `http://localhost:5555/${manifestFile}` });
        }
    }
};
