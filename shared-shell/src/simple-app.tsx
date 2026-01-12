import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

console.log('=== SCRIPT STARTING ===');

// Create a simple element using createElement
const element = createElement('div', {
  style: {
    padding: '20px',
    backgroundColor: '#1e40af',
    color: 'white',
    fontFamily: 'Arial, sans-serif',
    minHeight: '100vh'
  }
}, createElement('h1', null, 'Simple App Working!'),
  createElement('p', null, 'This is a minimal test component.'),
  createElement('p', null, `Time: ${new Date().toLocaleString()}`));

console.log('=== ELEMENT CREATED ===');

// Initialize app
const init = () => {
  console.log('=== INITIALIZING APP ===');
  
  const container = document.getElementById('root');
  if (!container) {
    console.error('No container');
    document.body.innerHTML = '<div style="background:red;color:white;padding:20px;">NO CONTAINER</div>';
    return;
  }
  
  console.log('Container found');
  
  try {
    const root = createRoot(container);
    console.log('Root created, rendering...');
    root.render(element);
    console.log('=== APP RENDERED ===');
  } catch (error) {
    console.error('Render failed:', error);
    document.body.innerHTML = `<div style="background:red;color:white;padding:20px;">ERROR: ${error}</div>`;
  }
};

// Multiple initialization attempts
console.log('=== SETTING UP INIT ===');

if (document.readyState === 'complete') {
  console.log('Document complete, init now');
  setTimeout(init, 0);
} else {
  console.log('Document not complete, waiting');
  document.addEventListener('DOMContentLoaded', init);
}

// Force init after 2 seconds
setTimeout(init, 2000);

console.log('=== SCRIPT END ===');
