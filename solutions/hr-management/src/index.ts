// Re-export all components and services for easy importing
export { default as Layout } from "./components/Layout";
export { Navigation } from "./components/Navigation";

// Re-export pages
export { default as HrDashboard } from "./pages/HrDashboard";
export { default as EmployeesPage } from "./pages/EmployeesPage";
export { default as AttendancePage } from "./pages/AttendancePage";
export { default as PayrollPage } from "./pages/PayrollPage";
export { default as ReportsPage } from "./pages/ReportsPage";
export { default as SettingsPage } from "./pages/SettingsPage";

// Re-export services
export { default as InventoryService } from "./services/inventory";

// Re-export contexts
export { AuthProvider } from "./contexts/AuthContext";

// Re-export utilities
export { supabase } from "./lib/supabase";

