import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RemoteLoading, RemoteLoadingStates, DevelopmentModeHelper } from './components/RemoteLoading';
import { loadRemote, preloadRemotes } from './utils/loadRemote';
import { SOLUTIONS, getSolutionByRoute, getPreloadOrder, isDevelopmentMode } from './config/solutions';

// Lazy load remote components
const RemoteInventory = lazy(() => loadRemote('inventoryManagement', './InventoryApp'));
const RemotePOS = lazy(() => loadRemote('pointOfSale', './PosApp'));
const RemoteCRM = lazy(() => loadRemote('crmSystem', './CrmApp'));
const RemoteHR = lazy(() => loadRemote('hrManagement', './HrApp'));
const RemoteAccounting = lazy(() => loadRemote('accountingSystem', './AccountingApp'));
const RemoteAnalytics = lazy(() => loadRemote('analyticsDashboard', './AnalyticsApp'));

// Local components
const Dashboard = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 mb-6">KiTS Hub Dashboard</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.values(SOLUTIONS).map((solution) => (
        <Link
          key={solution.id}
          to={solution.route}
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
        >
          <div className="flex items-center mb-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: solution.color }}
            >
              {solution.displayName.charAt(0)}
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{solution.displayName}</h3>
              <p className="text-sm text-gray-600">{solution.description}</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Status: <span className="text-green-600 font-medium">{solution.status}</span>
          </div>
        </Link>
      ))}
    </div>
  </div>
);

const Settings = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">System Configuration</h2>
      <p className="text-gray-600">Configure your KiTS Hub instance here.</p>
    </div>
  </div>
);

// Navigation component
const Navigation = () => {
  const location = useLocation();
  
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-blue-600">KiTS Hub</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location.pathname === '/'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Dashboard
              </Link>
              {Object.values(SOLUTIONS).map((solution) => (
                <Link
                  key={solution.id}
                  to={solution.route}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    location.pathname === solution.route
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {solution.displayName}
                </Link>
              ))}
              <Link
                to="/settings"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location.pathname === '/settings'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Remote component wrapper with error boundary
const RemoteWrapper: React.FC<{
  children: React.ReactNode;
  solutionId: string;
}> = ({ children, solutionId }) => {
  const solution = SOLUTIONS[solutionId];
  
  return (
    <ErrorBoundary
      customMessage={`Failed to load ${solution?.displayName || 'application'}`}
      showRetry={true}
      showHome={true}
    >
      {isDevelopmentMode() && <DevelopmentModeHelper solutionName={solution?.displayName || solutionId} />}
      <Suspense
        fallback={
          <RemoteLoading
            solutionName={solution?.displayName}
            solutionType={solutionId as any}
            message={`Loading ${solution?.displayName}...`}
            showProgress={true}
          />
        }
      >
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

// Main App component
const App: React.FC = () => {
  const [preloadStatus, setPreloadStatus] = useState<string>('idle');

  // Preload critical solutions on app startup
  useEffect(() => {
    const preloadCriticalSolutions = async () => {
      setPreloadStatus('loading');
      
      try {
        const criticalSolutions = getPreloadOrder().slice(0, 3); // Preload first 3 solutions
        const remotes = criticalSolutions.map(solution => ({
          remoteName: solution.id,
          module: solution.module
        }));
        
        await preloadRemotes(remotes);
        setPreloadStatus('completed');
      } catch (error) {
        console.warn('Failed to preload some solutions:', error);
        setPreloadStatus('error');
      }
    };

    if (isDevelopmentMode()) {
      preloadCriticalSolutions();
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        {/* Preload status indicator (development only) */}
        {isDevelopmentMode() && preloadStatus !== 'idle' && (
          <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
            <div className="text-sm text-blue-800">
              Preloading critical solutions: {preloadStatus}
            </div>
          </div>
        )}

        <main>
          <Routes>
            {/* Local routes */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* Remote routes */}
            <Route
              path="/inventory/*"
              element={
                <RemoteWrapper solutionId="inventoryManagement">
                  <RemoteInventory />
                </RemoteWrapper>
              }
            />
            <Route
              path="/pos/*"
              element={
                <RemoteWrapper solutionId="pointOfSale">
                  <RemotePOS />
                </RemoteWrapper>
              }
            />
            <Route
              path="/crm/*"
              element={
                <RemoteWrapper solutionId="crmSystem">
                  <RemoteCRM />
                </RemoteWrapper>
              }
            />
            <Route
              path="/hr/*"
              element={
                <RemoteWrapper solutionId="hrManagement">
                  <RemoteHR />
                </RemoteWrapper>
              }
            />
            <Route
              path="/accounting/*"
              element={
                <RemoteWrapper solutionId="accountingSystem">
                  <RemoteAccounting />
                </RemoteWrapper>
              }
            />
            <Route
              path="/analytics/*"
              element={
                <RemoteWrapper solutionId="analyticsDashboard">
                  <RemoteAnalytics />
                </RemoteWrapper>
              }
            />
            
            {/* Fallback route */}
            <Route
              path="*"
              element={
                <div className="p-6 text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
                  <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
                  <Link
                    to="/"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
