// Configuration for all remote applications
export const REMOTE_CONFIGS = {
  inventoryManagement: {
    url: 'http://localhost:4177',
    components: {
      app: './InventoryApp',
      dashboard: './InventoryDashboard',
      products: './ProductsPage',
      suppliers: './SuppliersPage',
      locations: './LocationsPage',
      reports: './ReportsPage',
      settings: './SettingsPage',
    },
  },
  pointOfSale: {
    url: 'http://localhost:4178',
    components: {
      app: './PosApp',
      dashboard: './PosDashboard',
      checkout: './CheckoutPage',
      transactions: './TransactionsPage',
      receipts: './ReceiptsPage',
      settings: './SettingsPage',
    },
  },
  crmSystem: {
    url: 'http://localhost:4179',
    components: {
      app: './CrmApp',
      dashboard: './CrmDashboard',
      customers: './CustomersPage',
      communications: './CommunicationsPage',
      sales: './SalesPage',
      settings: './SettingsPage',
    },
  },
  hrManagement: {
    url: 'http://localhost:4180',
    components: {
      app: './HrApp',
      dashboard: './HrDashboard',
      employees: './EmployeesPage',
      attendance: './AttendancePage',
      payroll: './PayrollPage',
      settings: './SettingsPage',
    },
  },
  accountingSystem: {
    url: 'http://localhost:4181',
    components: {
      app: './AccountingApp',
      dashboard: './AccountingDashboard',
      transactions: './TransactionsPage',
      invoices: './InvoicesPage',
      reports: './ReportsPage',
      settings: './SettingsPage',
    },
  },
  analyticsDashboard: {
    url: 'http://localhost:4182',
    components: {
      app: './AnalyticsApp',
      dashboard: './AnalyticsDashboard',
      reports: './ReportsPage',
      kpi: './KpiPage',
      trends: './TrendsPage',
      settings: './SettingsPage',
    },
  },
} as const;

// Helper function to get remote component path
export const getRemoteComponentPath = (
  remoteName: keyof typeof REMOTE_CONFIGS,
  componentKey: string
): string => {
  const config = REMOTE_CONFIGS[remoteName];
  if (!config) {
    throw new Error(`Remote configuration not found for ${remoteName}`);
  }
  
  const componentPath = config.components[componentKey as keyof typeof config.components];
  if (!componentPath) {
    throw new Error(`Component ${componentKey} not found in ${remoteName} configuration`);
  }
  
  return componentPath;
};
