import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';

// Components
import { Layout } from './components/Layout';

// Pages
import PosDashboard from './pages/PosDashboard';
import CheckoutPage from './pages/CheckoutPage';
import TransactionsPage from './pages/TransactionsPage';
import ReceiptsPage from './pages/ReceiptsPage';
import SettingsPage from './pages/SettingsPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Check if running as remote in Module Federation
const isRemote = !!window.__webpack_share_scopes__?.default;

function App() {
  const content = (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        {isRemote ? (
          // Remote mode - just return routes without Router
          <Routes>
            <Route path="/" element={<PosDashboard />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/receipts" element={<ReceiptsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        ) : (
          // Standalone mode - include Router
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<PosDashboard />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/receipts" element={<ReceiptsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </Layout>
          </Router>
        )}
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

  return content;
}

export default App;
