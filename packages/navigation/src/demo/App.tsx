import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { 
  NavigationProvider, 
  useNavigation, 
  useBreadcrumbs, 
  useGlobalSearch, 
  useCommandPalette,
  useNavigationHistory,
  Breadcrumbs,
  GlobalSearch,
  CommandPalette,
  NavigationHistory,
  SearchTrigger,
  CommandTrigger,
} from '../index';

// Sample navigation items
const navigationItems = [
  {
    id: 'home',
    path: '/',
    label: 'Dashboard',
    icon: '🏠',
    metadata: {
      description: 'Main dashboard',
      keywords: ['dashboard', 'home', 'main'],
      shortcut: 'home',
    },
  },
  {
    id: 'products',
    path: '/products',
    label: 'Products',
    icon: '📦',
    children: [
      {
        id: 'product-list',
        path: '/products',
        label: 'Product List',
        metadata: {
          description: 'View all products',
          keywords: ['products', 'list', 'inventory'],
        },
      },
      {
        id: 'product-create',
        path: '/products/create',
        label: 'Create Product',
        metadata: {
          description: 'Add new product',
          keywords: ['create', 'add', 'new'],
        },
      },
    ],
  },
  {
    id: 'customers',
    path: '/customers',
    label: 'Customers',
    icon: '👥',
    metadata: {
      description: 'Customer management',
      keywords: ['customers', 'clients', 'users'],
    },
  },
  {
    id: 'settings',
    path: '/settings',
    label: 'Settings',
    icon: '⚙️',
    metadata: {
      description: 'Application settings',
      keywords: ['settings', 'config', 'preferences'],
    },
  },
];

// Demo pages
const HomePage = () => {
  const { breadcrumbs } = useBreadcrumbs(navigationItems);
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome to the KiTS Hub Navigation Demo</p>
      
      <div className="mt-8 grid grid-cols-2 gap-4">
        <Link to="/products" className="p-4 border rounded hover:bg-gray-50">
          <h3 className="font-semibold">Products</h3>
          <p className="text-sm text-gray-600">Manage your product inventory</p>
        </Link>
        <Link to="/customers" className="p-4 border rounded hover:bg-gray-50">
          <h3 className="font-semibold">Customers</h3>
          <p className="text-sm text-gray-600">View and manage customers</p>
        </Link>
      </div>
    </div>
  );
};

const ProductsPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      <p>Manage your product catalog</p>
      
      <div className="mt-4">
        <Link to="/products/create" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Create New Product
        </Link>
      </div>
    </div>
  );
};

const CreateProductPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create Product</h1>
      <p>Add a new product to your inventory</p>
    </div>
  );
};

const CustomersPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Customers</h1>
      <p>View and manage customer information</p>
    </div>
  );
};

const SettingsPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <p>Configure application preferences</p>
    </div>
  );
};

// Layout component
const Layout = () => {
  const { navigate } = useNavigation();
  const { breadcrumbs } = useBreadcrumbs(navigationItems);
  const { 
    query, 
    results, 
    isOpen: searchOpen, 
    setQuery, 
    setIsOpen 
  } = useGlobalSearch(navigationItems);
  
  const {
    isOpen: commandOpen,
    commands,
    filteredCommands,
    groupedCommands,
    query: commandQuery,
    selectedCommand,
    setIsOpen: setCommandOpen,
    setQuery: setCommandQuery,
    setSelectedCommand,
    executeCommand,
    registerCommand,
  } = useCommandPalette();

  const {
    history,
    currentIndex,
    canGoBack,
    canGoForward,
    goBack,
    goForward,
    clearHistory,
  } = useNavigationHistory();

  // Register custom commands
  React.useEffect(() => {
    registerCommand({
      id: 'demo-action',
      title: 'Demo Action',
      description: 'This is a demo command',
      icon: '🎯',
      shortcut: 'demo',
      category: 'actions',
      action: () => alert('Demo action executed!'),
      keywords: ['demo', 'test', 'action'],
    });
  }, [registerCommand]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">KiTS Hub Demo</h1>
            <Breadcrumbs items={breadcrumbs} />
          </div>
          
          <div className="flex items-center space-x-4">
            <SearchTrigger onClick={() => setIsOpen(true)} />
            <CommandTrigger onClick={() => setCommandOpen(true)} />
            
            <div className="flex items-center space-x-2">
              <button
                onClick={goBack}
                disabled={!canGoBack}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                ←
              </button>
              <button
                onClick={goForward}
                disabled={!canGoForward}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/create" element={<CreateProductPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>

      {/* Navigation History Sidebar */}
      <aside className="fixed right-0 top-20 w-80 h-96 bg-white border border-gray-200 rounded-lg shadow-lg m-4 overflow-hidden">
        <NavigationHistory
          history={history}
          currentIndex={currentIndex}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          onGoBack={goBack}
          onGoForward={goForward}
          onNavigateToItem={(item) => navigate(item.path)}
          onClearHistory={clearHistory}
          maxItems={8}
        />
      </aside>

      {/* Global Search */}
      <GlobalSearch
        isOpen={searchOpen}
        query={query}
        results={results}
        onQueryChange={setQuery}
        onSelect={(result) => {
          navigate(result.path);
          setIsOpen(false);
        }}
        onClose={() => setIsOpen(false)}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandOpen}
        commands={commands}
        filteredCommands={filteredCommands}
        groupedCommands={groupedCommands}
        query={commandQuery}
        selectedCommand={selectedCommand}
        onQueryChange={setCommandQuery}
        onSelectCommand={executeCommand}
        onClose={() => setCommandOpen(false)}
      />
    </div>
  );
};

// Main App component
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <NavigationProvider navigationItems={navigationItems}>
        <Layout />
      </NavigationProvider>
    </BrowserRouter>
  );
};

export default App;
