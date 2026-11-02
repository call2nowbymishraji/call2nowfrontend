import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { SiteSettingsProvider } from './context/SiteSettingsContext.jsx';
import { RegionProvider } from './context/RegionContext.jsx';
import { LangProvider } from './context/LangContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <SiteSettingsProvider>
            <RegionProvider>
              <LangProvider>
                <App />
              </LangProvider>
            </RegionProvider>
          </SiteSettingsProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
