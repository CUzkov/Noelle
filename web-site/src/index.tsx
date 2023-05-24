import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {CustomProvider} from 'rsuite';
import {BrowserRouter} from 'react-router-dom';
import {QueryParamProvider} from 'use-query-params';
import {ReactRouter6Adapter} from 'use-query-params/adapters/react-router-6';

import './index.less';

import {App} from './app';

ReactDOM.render(
    <React.StrictMode>
        <BrowserRouter>
            <QueryParamProvider adapter={ReactRouter6Adapter}>
                <CustomProvider theme="dark">
                    {/* <Provider store={{}}> */}
                    <App />
                    {/* </Provider> */}
                </CustomProvider>
            </QueryParamProvider>
        </BrowserRouter>
    </React.StrictMode>,
    document.getElementById('root'),
);
