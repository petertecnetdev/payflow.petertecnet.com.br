import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';
import './styles/auth-fixes.css';
import './styles/company-context.css';
import './styles/commercial.css';
import './styles/brand.css';
import './styles/nexus-mobile-nav.css';
import App from './App';
import GlobalImageInputEnhancer from "./components/GlobalImageInputEnhancer";
import PeterAccountGateway from './components/PeterAccountGateway';
import { installGlobalImageFallbacks } from './utils/imageFallback';
import { installPasswordFieldEnhancer } from './utils/passwordFieldEnhancer';
import { installPeterWhatsappFallback } from './utils/peterWhatsappFallback';

document.documentElement.style.setProperty('--payflow-logo', `url(${process.env.PUBLIC_URL}/logo.png)`);

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.petertecnet.com.br/api';
const APP_SLUG = 'payflow';
const GOOGLE_CLIENT_ID = (process.env.REACT_APP_GOOGLE_CLIENT_ID || '').trim();

installGlobalImageFallbacks();
installPasswordFieldEnhancer();
installPeterWhatsappFallback();

function PayFlowRoot() {
  const app = (
    <BrowserRouter>
      <PeterAccountGateway apiBaseUrl={API_BASE_URL} appSlug={APP_SLUG}>
        <App />
        <GlobalImageInputEnhancer />
      </PeterAccountGateway>
    </BrowserRouter>
  );

  return GOOGLE_CLIENT_ID
    ? <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{app}</GoogleOAuthProvider>
    : app;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <PayFlowRoot />
  </React.StrictMode>
);
