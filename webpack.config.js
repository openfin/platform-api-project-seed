const path = require('path');
const { launch } = require('hadouken-js-adapter');

module.exports = {
    mode: 'development',
    entry: {
        provider: './src/provider/provider.ts',
        window: './src/window/window.ts',
        'color-view': './src/color-view/color-view.js'
    },
    module: {
        rules: [
            {
                test: /\.[t|j]sx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: '[name].bundle.js',
    },
    devServer: {
        contentBase: path.join(__dirname, 'static'),
        compress: true,
        port: 5555,
        onListening: function () {
            launch({ manifestUrl: 'http://localhost:5555/app.json' })
        }
    }
}