// Re-export all components and services for easy importing
export { default as Layout } from './components/Layout';
export { default as Navigation } from './components/Navigation';

// Re-export pages
export { default as InventoryDashboard } from './pages/InventoryDashboard';
export { default as ProductsPage } from './pages/ProductsPage';
export { default as SuppliersPage } from './pages/SuppliersPage';
export { default as LocationsPage } from './pages/LocationsPage';
export { default as ReportsPage } from './pages/ReportsPage';
export { default as SettingsPage } from './pages/SettingsPage';

// Re-export services
export { InventoryService } from './services/inventory';

// Re-export contexts
export { AuthProvider } from './contexts/AuthContext';

// Re-export utilities
export { supabase } from './lib/supabase';
