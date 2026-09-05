import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';
import './styles/auth-fixes.css';
import './styles/company-context.css';
import './styles/commercial.css';
import './styles/brand.css';
import './styles/nexus-mobile-nav.css';
import App from './App';
import PeterAccountGateway from './components/PeterAccountGateway';
import { installGlobalImageFallbacks } from './utils/imageFallback';
import { installPasswordFieldEnhancer } from './utils/passwordFieldEnhancer';

document.documentElement.style.setProperty('--payflow-logo', `url(${process.env.PUBLIC_URL}/logo.png)`);

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.petertecnet.com.br/api';
const APP_SLUG = 'payflow';

installGlobalImageFallbacks();
installPasswordFieldEnhancer();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <PeterAccountGateway apiBaseUrl={API_BASE_URL} appSlug={APP_SLUG}>
        <App />
      </PeterAccountGateway>
    </BrowserRouter>
  </React.StrictMode>
);
