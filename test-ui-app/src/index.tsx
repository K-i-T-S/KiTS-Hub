import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log('Starting React app...');

const container = document.getElementById('root');
if (!container) {
  console.error('Root container not found');
  throw new Error('Root container not found');
}

console.log('Root container found, creating root...');
const root = createRoot(container);

console.log('Rendering app...');
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('App rendered successfully!');
