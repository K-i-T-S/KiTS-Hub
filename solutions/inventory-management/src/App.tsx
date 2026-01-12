import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';

// Components
import { Layout } from './components/Layout';

// Pages
import InventoryDashboard from './pages/InventoryDashboard';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

// Check if running in remote context (Module Federation)
// More reliable detection by checking for Module Federation container
const isRemoteContext = !!(window.__webpack_share_scopes__?.default);

function App() {
  // If running in remote context, don't wrap with Router and Layout
  // as those will be provided by the host shell
  if (isRemoteContext) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <InventoryDashboard />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#7c3aed',
                color: '#ffffff',
              },
            }}
          />
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  // Standalone mode with full app structure
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<InventoryDashboard />} />
            </Routes>
          </Layout>
        </Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#7c3aed',
              color: '#ffffff',
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
