import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';

// Components
import { Layout } from './components/Layout';

// Pages
import CrmDashboard from './pages/CrmDashboard';
import CustomersPage from './pages/CustomersPage';
import CommunicationsPage from './pages/CommunicationsPage';
import SalesPage from './pages/SalesPage';
import SettingsPage from './pages/SettingsPage';
import LeadsPage from './pages/LeadsPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import ReportsPage from './pages/ReportsPage';

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
            <Route path="/" element={<CrmDashboard />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/communications" element={<CommunicationsPage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/opportunities" element={<OpportunitiesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Routes>
        ) : (
          // Standalone mode - include Router
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<CrmDashboard />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/communications" element={<CommunicationsPage />} />
                <Route path="/sales" element={<SalesPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/leads" element={<LeadsPage />} />
                <Route path="/opportunities" element={<OpportunitiesPage />} />
                <Route path="/reports" element={<ReportsPage />} />
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
