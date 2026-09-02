import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';
import './styles/auth-fixes.css';
import './styles/company-context.css';
import './styles/commercial.css';
import './styles/brand.css';
import App from './App';

document.documentElement.style.setProperty('--payflow-logo', `url(${process.env.PUBLIC_URL}/payflow-logo.png)`);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
