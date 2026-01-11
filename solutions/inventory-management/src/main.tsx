import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize Supabase
import { supabase } from './lib/supabase-client';

// Set up tenant context
console.log('🚀 KiTS Inventory Management - Starting with real Supabase');

// Initialize the application
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
