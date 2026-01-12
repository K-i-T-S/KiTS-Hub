import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';

// Components
import { Layout } from './components/Layout';

// Pages
import AccountingDashboard from './pages/AccountingDashboard';
import TransactionsPage from './pages/TransactionsPage';
import InvoicesPage from './pages/InvoicesPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import AccountsPage from './pages/AccountsPage';

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

// Check if running in remote context (Module Federation)
// More reliable detection by checking for Module Federation container
const isRemoteContext = !!(window.__webpack_share_scopes__?.default);

function App() {
  const content = (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        {isRemoteContext ? (
          // Remote mode - just return routes without Router
          <Routes>
            <Route path="/" element={<AccountingDashboard />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/accounts" element={<AccountsPage />} />
          </Routes>
        ) : (
          // Standalone mode - include Router
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<AccountingDashboard />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/invoices" element={<InvoicesPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/accounts" element={<AccountsPage />} />
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
