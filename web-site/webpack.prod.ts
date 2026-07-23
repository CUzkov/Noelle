import type {Configuration, Module} from 'webpack';
import {merge} from 'webpack-merge';

import common from './webpack.common.ts';

const webpackDev: Configuration = {
    mode: 'production',
    optimization: {
        runtimeChunk: 'single',
        splitChunks: {
            chunks: 'all',
            maxInitialRequests: Infinity,
            minSize: 0,
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name(module: Module) {
                        // get the name. E.g. node_modules/packageName/not/this/part.js
                        // or node_modules/packageName
                        const packageName = module?.context?.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)?.[1];

                        // npm package names are URL-safe, but some servers don't like @ symbols
                        return `npm.${(packageName ?? 'unknown').replace('@', '')}`;
                    },
                },
            },
        },
    },
    output: {
        filename: '[name].[fullhash:8].js',
        sourceMapFilename: '[name].[fullhash:8].map',
        chunkFilename: '[id].[fullhash:8].js',
    },
};

export default merge(common, webpackDev);
