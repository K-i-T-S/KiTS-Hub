import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize Supabase
import { supabase } from './lib/supabase';

// Set up tenant context (this would come from auth in production)
const tenantId = import.meta.env.VITE_TENANT_ID || '00000000-0000-0000-0000-000000000000';

// Initialize the application
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
