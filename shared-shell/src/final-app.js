console.log('WEBPACK SCRIPT LOADED!');

// Test basic React functionality
try {
  const React = require('react');
  const { createRoot } = require('react-dom/client');
  
  console.log('React loaded:', React);
  console.log('createRoot loaded:', createRoot);
  
  // Simple test component
  const App = () => {
    console.log('App component called');
    return React.createElement('div', {
      style: {
        padding: '20px',
        backgroundColor: '#1e40af',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        minHeight: '100vh'
      }
    }, [
      React.createElement('h1', null, 'KiTS Hub - Working Shell'),
      React.createElement('p', null, 'React is rendering successfully!'),
      React.createElement('p', null, `Time: ${new Date().toLocaleString()}`)
    ]);
  };
  
  console.log('App component created');
  
  // Initialize
  const init = () => {
    console.log('Initializing React app...');
    const container = document.getElementById('root');
    if (!container) {
      console.error('No container found');
      document.body.innerHTML = '<div style="background:red;color:white;padding:20px;">NO CONTAINER</div>';
      return;
    }
    
    const root = createRoot(container);
    console.log('Root created, rendering...');
    root.render(React.createElement(App));
    console.log('App rendered successfully!');
  };
  
  // Try multiple initialization methods
  if (document.readyState === 'complete') {
    console.log('Document complete, initializing...');
    init();
  } else {
    console.log('Document loading, waiting...');
    document.addEventListener('DOMContentLoaded', init);
  }
  
  // Fallback
  setTimeout(init, 1000);
  
} catch (error) {
  console.error('Error in React app:', error);
  document.body.innerHTML = `<div style="background:red;color:white;padding:20px;">ERROR: ${error.message}</div>`;
}
