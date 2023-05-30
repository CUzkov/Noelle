import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {BrowserRouter} from 'react-router-dom';
import {QueryParamProvider} from 'use-query-params';
import {ReactRouter6Adapter} from 'use-query-params/adapters/react-router-6';

import {App} from './app';

import styles from './index.sss';

ReactDOM.render(
    <React.StrictMode>
        <BrowserRouter>
            <QueryParamProvider adapter={ReactRouter6Adapter}>
                {/* <Provider store={{}}> */}
                <App />
                <div className={styles.dd}></div>
                {/* </Provider> */}
            </QueryParamProvider>
        </BrowserRouter>
    </React.StrictMode>,
    document.getElementById('root'),
);
