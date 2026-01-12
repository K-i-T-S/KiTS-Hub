import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/shared.css';

console.log('🚀 Starting React app...');
console.log('🌐 Environment: development');

// Check if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

function initializeApp() {
  console.log('📄 DOM is ready, initializing React...');
  
  // Ensure the root element exists
  const container = document.getElementById('root');
  console.log('🔍 Looking for root container:', container);
  
  if (!container) {
    console.error('❌ Root container not found');
    console.error('📄 Available elements:', document.body.innerHTML.substring(0, 500));
    throw new Error('Root container not found');
  }
  
  console.log('✅ Root container found:', container);
  console.log('📄 Container HTML before mount:', container.innerHTML);
  console.log('📄 Container classes:', container.className);
  console.log('📄 Container children count:', container.children.length);
  
  // Create React root
  console.log('🔧 Creating React root...');
  const root = createRoot(container);
  console.log('✅ React root created');
  
  // Render app
  console.log('🎨 Rendering app...');
  try {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    console.log('✅ App rendered successfully!');
    
    // Check if React mounted
    setTimeout(() => {
      console.log('🔍 Checking React mount...');
      const renderedContent = container.innerHTML;
      console.log('📄 Rendered content length:', renderedContent.length);
      console.log('📄 Rendered content preview:', renderedContent.substring(0, 200) + '...');
      
      if (renderedContent.length > 100) {
        console.log('✅ React appears to be mounted successfully!');
      } else {
        console.log('❌ React does not appear to be mounted');
        console.log('📄 Full rendered content:', renderedContent);
      }
    }, 1000);
    
  } catch (error) {
    console.error('❌ Error rendering app:', error);
    console.error('📄 Error stack:', error instanceof Error ? error.stack : 'No stack available');
    throw error;
  }
}
