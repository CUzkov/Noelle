import type {Configuration as DevServerConfiguration} from 'webpack-dev-server';
import {Configuration} from 'webpack';
import {merge} from 'webpack-merge';

import common from './webpack.common';

const devServer: DevServerConfiguration = {
    client: {
        logging: 'info',
        overlay: true,
    },
    compress: true,
    static: './build',
};

const webpackDev: Configuration = {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer,
    stats: {
        errorDetails: true,
    },
};

export default merge(common, webpackDev);
