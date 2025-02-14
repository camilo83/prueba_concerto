import React from 'react';
import ReactDOM from 'react-dom/client';
import './main.scss';
/* import { store } from './store/store.ts';
 */ /* import { Provider } from 'react-redux'; */
import { BrowserRouter as Router } from 'react-router-dom';
import { App } from './components/core/app/app.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      {/*   <Provider store={store}> */}
      <App />
      {/* </Provider> */}
    </Router>
  </React.StrictMode>
);
