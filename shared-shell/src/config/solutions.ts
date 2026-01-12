// Solution metadata and configuration for KiTS Hub micro-frontend architecture

export interface SolutionConfig {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  port: number;
  remoteEntry: string;
  module: string;
  route: string;
  color: string;
  features: string[];
  dependencies: string[];
  requiredPermissions: string[];
  healthCheckEndpoint?: string;
  fallbackComponent?: string;
  preloadPriority: 'high' | 'medium' | 'low';
  status: 'active' | 'beta' | 'maintenance' | 'disabled';
  version: string;
  lastUpdated: string;
}

// Complete solution registry
export const SOLUTIONS: Record<string, SolutionConfig> = {
  inventoryManagement: {
    id: 'inventoryManagement',
    name: 'inventory-management',
    displayName: 'Inventory Management',
    description: 'Complete inventory tracking, stock management, and product catalog system',
    icon: 'Package',
    port: 4177,
    remoteEntry: 'http://localhost:4177/remoteEntry.js',
    module: './InventoryApp',
    route: '/inventory',
    color: '#3B82F6',
    features: [
      'Product catalog management',
      'Stock level tracking',
      'Supplier management',
      'Batch tracking',
      'Low stock alerts',
      'Inventory reports',
      'Barcode scanning',
      'Multi-location support'
    ],
    dependencies: ['@supabase/supabase-js', 'react-router-dom', 'lucide-react'],
    requiredPermissions: ['inventory.read', 'inventory.write'],
    healthCheckEndpoint: '/api/health',
    fallbackComponent: 'InventoryDashboard',
    preloadPriority: 'high',
    status: 'active',
    version: '1.0.0',
    lastUpdated: '2024-01-12'
  },

  pointOfSale: {
    id: 'pointOfSale',
    name: 'point-of-sale',
    displayName: 'Point of Sale',
    description: 'Modern POS system with payment processing, receipts, and sales analytics',
    icon: 'CreditCard',
    port: 4178,
    remoteEntry: 'http://localhost:4178/remoteEntry.js',
    module: './PosApp',
    route: '/pos',
    color: '#10B981',
    features: [
      'Sales processing',
      'Payment integration',
      'Receipt generation',
      'Customer management',
      'Tax calculations',
      'Discount management',
      'Cash drawer control',
      'Offline mode support'
    ],
    dependencies: ['@supabase/supabase-js', 'react-router-dom', 'stripe'],
    requiredPermissions: ['pos.read', 'pos.write', 'payments.process'],
    healthCheckEndpoint: '/api/health',
    fallbackComponent: 'PosDashboard',
    preloadPriority: 'high',
    status: 'active',
    version: '1.0.0',
    lastUpdated: '2024-01-12'
  },

  crmSystem: {
    id: 'crmSystem',
    name: 'crm-system',
    displayName: 'CRM System',
    description: 'Customer relationship management with communication tracking and analytics',
    icon: 'Users',
    port: 4179,
    remoteEntry: 'http://localhost:4179/remoteEntry.js',
    module: './CrmApp',
    route: '/crm',
    color: '#8B5CF6',
    features: [
      'Customer database',
      'Communication tracking',
      'Lead management',
      'Sales pipeline',
      'Email integration',
      'Customer segmentation',
      'Loyalty programs',
      'Activity tracking'
    ],
    dependencies: ['@supabase/supabase-js', 'react-router-dom', '@kits-hub/ui'],
    requiredPermissions: ['crm.read', 'crm.write', 'customers.manage'],
    healthCheckEndpoint: '/api/health',
    fallbackComponent: 'CrmDashboard',
    preloadPriority: 'medium',
    status: 'active',
    version: '1.0.0',
    lastUpdated: '2024-01-12'
  },

  hrManagement: {
    id: 'hrManagement',
    name: 'hr-management',
    displayName: 'HR Management',
    description: 'Human resources system for employee management, payroll, and performance tracking',
    icon: 'UserCheck',
    port: 4180,
    remoteEntry: 'http://localhost:4180/remoteEntry.js',
    module: './HrApp',
    route: '/hr',
    color: '#F59E0B',
    features: [
      'Employee records',
      'Attendance tracking',
      'Payroll management',
      'Performance reviews',
      'Leave management',
      'Document storage',
      'Training programs',
      'Compliance tracking'
    ],
    dependencies: ['@supabase/supabase-js', 'react-router-dom', 'date-fns'],
    requiredPermissions: ['hr.read', 'hr.write', 'employees.manage'],
    healthCheckEndpoint: '/api/health',
    fallbackComponent: 'HrDashboard',
    preloadPriority: 'medium',
    status: 'active',
    version: '1.0.0',
    lastUpdated: '2024-01-12'
  },

  accountingSystem: {
    id: 'accountingSystem',
    name: 'accounting-system',
    displayName: 'Accounting System',
    description: 'Comprehensive accounting with invoicing, financial reporting, and tax management',
    icon: 'FileText',
    port: 4181,
    remoteEntry: 'http://localhost:4181/remoteEntry.js',
    module: './AccountingApp',
    route: '/accounting',
    color: '#EF4444',
    features: [
      'General ledger',
      'Invoicing',
      'Expense tracking',
      'Financial reports',
      'Tax management',
      'Bank reconciliation',
      'Budget tracking',
      'Audit trails'
    ],
    dependencies: ['@supabase/supabase-js', 'react-router-dom', 'jspdf'],
    requiredPermissions: ['accounting.read', 'accounting.write', 'financial.reports'],
    healthCheckEndpoint: '/api/health',
    fallbackComponent: 'AccountingDashboard',
    preloadPriority: 'medium',
    status: 'active',
    version: '1.0.0',
    lastUpdated: '2024-01-12'
  },

  analyticsDashboard: {
    id: 'analyticsDashboard',
    name: 'analytics-dashboard',
    displayName: 'Analytics Dashboard',
    description: 'Business intelligence and analytics with real-time insights and reporting',
    icon: 'BarChart3',
    port: 4182,
    remoteEntry: 'http://localhost:4182/remoteEntry.js',
    module: './AnalyticsApp',
    route: '/analytics',
    color: '#06B6D4',
    features: [
      'Real-time dashboards',
      'Custom reports',
      'Data visualization',
      'KPI tracking',
      'Trend analysis',
      'Export capabilities',
      'Scheduled reports',
      'Predictive analytics'
    ],
    dependencies: ['@supabase/supabase-js', 'react-router-dom', 'recharts'],
    requiredPermissions: ['analytics.read', 'reports.view', 'data.export'],
    healthCheckEndpoint: '/api/health',
    fallbackComponent: 'AnalyticsDashboard',
    preloadPriority: 'low',
    status: 'active',
    version: '1.0.0',
    lastUpdated: '2024-01-12'
  }
};

// Solution categories for organization
export const SOLUTION_CATEGORIES = {
  OPERATIONS: ['inventoryManagement', 'pointOfSale'],
  CUSTOMERS: ['crmSystem'],
  PEOPLE: ['hrManagement'],
  FINANCE: ['accountingSystem'],
  INSIGHTS: ['analyticsDashboard']
};

// Helper functions
export const getSolutionById = (id: string): SolutionConfig | undefined => {
  return SOLUTIONS[id];
};

export const getSolutionByRoute = (route: string): SolutionConfig | undefined => {
  return Object.values(SOLUTIONS).find(solution => solution.route === route);
};

export const getSolutionByPort = (port: number): SolutionConfig | undefined => {
  return Object.values(SOLUTIONS).find(solution => solution.port === port);
};

export const getActiveSolutions = (): SolutionConfig[] => {
  return Object.values(SOLUTIONS).filter(solution => solution.status === 'active');
};

export const getSolutionsByCategory = (category: keyof typeof SOLUTION_CATEGORIES): SolutionConfig[] => {
  const solutionIds = SOLUTION_CATEGORIES[category];
  return solutionIds.map(id => SOLUTIONS[id]).filter((solution): solution is SolutionConfig => Boolean(solution));
};

export const getSolutionsByPriority = (priority: 'high' | 'medium' | 'low'): SolutionConfig[] => {
  return Object.values(SOLUTIONS).filter(solution => solution.preloadPriority === priority);
};

// Development mode helpers
export const isDevelopmentMode = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

export const getDevelopmentUrls = (): Record<string, string> => {
  return Object.fromEntries(
    Object.entries(SOLUTIONS).map(([key, solution]) => [
      key,
      `http://localhost:${solution.port}/remoteEntry.js`
    ])
  );
};

export const getProductionUrls = (): Record<string, string> => {
  return Object.fromEntries(
    Object.entries(SOLUTIONS).map(([key, solution]) => [
      key,
      `https://${solution.name}.kits-hub.com/remoteEntry.js`
    ])
  );
};

// Health check utilities
export const checkSolutionHealth = async (solution: SolutionConfig): Promise<boolean> => {
  if (!solution.healthCheckEndpoint) {
    return true; // Assume healthy if no endpoint defined
  }

  try {
    const response = await fetch(`http://localhost:${solution.port}${solution.healthCheckEndpoint}`);
    return response.ok;
  } catch {
    return false;
  }
};

export const checkAllSolutionsHealth = async (): Promise<Record<string, boolean>> => {
  const results: Record<string, boolean> = {};
  
  for (const [id, solution] of Object.entries(SOLUTIONS)) {
    results[id] = await checkSolutionHealth(solution);
  }
  
  return results;
};

// Permission utilities
export const hasPermission = (userPermissions: string[], requiredPermissions: string[]): boolean => {
  return requiredPermissions.every(permission => 
    userPermissions.includes(permission) || userPermissions.includes('*')
  );
};

export const canAccessSolution = (userPermissions: string[], solution: SolutionConfig): boolean => {
  return hasPermission(userPermissions, solution.requiredPermissions);
};

// Loading strategy utilities
export const getPreloadOrder = (): SolutionConfig[] => {
  return [
    ...getSolutionsByPriority('high'),
    ...getSolutionsByPriority('medium'),
    ...getSolutionsByPriority('low')
  ];
};

export const getCriticalSolutions = (): SolutionConfig[] => {
  return Object.values(SOLUTIONS).filter(solution => 
    solution.preloadPriority === 'high' && solution.status === 'active'
  );
};

// Type guards
export const isValidSolutionId = (id: string): id is keyof typeof SOLUTIONS => {
  return id in SOLUTIONS;
};

export const isValidRoute = (route: string): boolean => {
  return Object.values(SOLUTIONS).some(solution => solution.route === route);
};

// Export default configuration
export default SOLUTIONS;
