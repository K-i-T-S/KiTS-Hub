import React from 'react';
import AppRouter from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { ToastContainer } from './components/Notifications';
import ErrorBoundary from './components/ErrorBoundary';

console.log('🎨 App component loading...');

function App() {
  console.log('🎨 App component rendering...');
  
  try {
    return (
      <ErrorBoundary>
        <AuthProvider>
          <AppProvider>
            <div className="min-h-screen" style={{ backgroundColor: 'rgb(var(--background))' }}>
              <ToastContainer />
              <AppRouter />
            </div>
          </AppProvider>
        </AuthProvider>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('❌ Error in App component render:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">App Component Error</h1>
          <p className="text-red-500">{error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    );
  }
}

console.log('✅ App component defined');
export default App;
