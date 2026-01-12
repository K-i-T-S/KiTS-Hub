import { createRoot } from 'react-dom/client';
import App from './App';

// Type declaration for webpack share scopes
declare global {
  interface Window {
    __webpack_share_scopes__?: {
      default?: any;
    };
    __webpack_init_sharing__?: (scope: string) => Promise<void>;
  }
}

// Bootstrap function for Module Federation
const bootstrap = async () => {
  const container = document.getElementById('root');
  if (!container) {
    throw new Error('Root element not found');
  }
  
  // Wait for Module Federation to initialize if in remote context
  if (window.__webpack_share_scopes__?.default) {
    // Import and initialize shared modules
    await (globalThis as any).__webpack_init_sharing__('default');
  }
  
  const root = createRoot(container);
  root.render(<App />);
};

// Export for Module Federation
export { bootstrap };

// Auto-bootstrap if not in Module Federation context
if (!window.__webpack_share_scopes__?.default) {
  bootstrap();
}
