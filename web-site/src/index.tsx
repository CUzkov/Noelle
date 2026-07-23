import React from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import {QueryParamProvider} from 'use-query-params';
import {ReactRouter6Adapter} from 'use-query-params/adapters/react-router-6';

import {App} from './app';

import styles from './index.sss';

const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error('Root element was not found');
}

createRoot(rootElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <QueryParamProvider adapter={ReactRouter6Adapter}>
                <App />
                <div className={styles.dd}></div>
            </QueryParamProvider>
        </BrowserRouter>
    </React.StrictMode>,
);
