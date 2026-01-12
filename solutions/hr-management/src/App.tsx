import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';

// Components
import { Layout } from './components/Layout';

// Pages
import HrDashboard from './pages/HrDashboard';
import EmployeesPage from './pages/EmployeesPage';
import AttendancePage from './pages/AttendancePage';
import PayrollPage from './pages/PayrollPage';
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
            <Route path="/" element={<HrDashboard />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/payroll" element={<PayrollPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        ) : (
          // Standalone mode - include Router
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<HrDashboard />} />
                <Route path="/employees" element={<EmployeesPage />} />
                <Route path="/attendance" element={<AttendancePage />} />
                <Route path="/payroll" element={<PayrollPage />} />
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
