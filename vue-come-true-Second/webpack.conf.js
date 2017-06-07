var path = require('path');
var htmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
    entry: './src/vue/MVVM.js',
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'js/[name].bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: path.resolve(__dirname, './src/js'),
                exclude: [path.resolve(__dirname,'./node_modules'), path.resolve(__dirname,'./src/js/util.js')],
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env','stage-2']
                    }
                }
            }
        ]
    }
/*    plugins: [
        new htmlWebpackPlugin({
            filename: 'index.html',
            template: 'MVVM.html',
            title: '双向绑定',
            inject: 'head',
            minify: {
                removeComments: true
            }
        }),
    ]*/

}