// Main entry point for the database package
import DatabaseClientManager from './supabase-client';
export { getDatabaseClient } from './supabase-client';
export type { 
  Database,
  TenantContext,
  DatabaseConfig,
  // Multi-Tenant Foundation
  Tenant,
  TenantUser,
  UserProfile,
  // Role-Based Access Control
  Role,
  Permission,
  RolePermission,
  UserRole,
  // Inventory Management
  Product,
  Supplier,
  Location,
  ProductBatch,
  PurchaseOrder,
  PurchaseOrderItem,
  StockTransfer,
  StockTransferItem,
  ReorderPoint,
  InventoryMovement,
  // Point of Sale
  Sale,
  SaleItem,
  SplitPayment,
  Tip,
  DiscountCoupon,
  Promotion,
  LoyaltyProgram,
  CustomerLoyalty,
  LoyaltyTransaction,
  ReceiptTemplate,
  // CRM System
  Customer,
  CustomerCommunication,
  MarketingCampaign,
  CustomerSegment,
  CustomerSegmentMembership,
  CampaignDelivery,
  CustomerInteraction,
  CustomerPreference,
  // HR Management
  Employee,
  Attendance,
  Payroll,
  // Accounting System
  ChartOfAccounts,
  FinancialTransaction,
  Invoice,
  // Workflow Automation
  Workflow,
  WorkflowExecution,
  WorkflowSchedule,
  WorkflowTemplate,
  WorkflowAction,
  WorkflowTrigger,
  // Public API & Webhooks
  ApiKey,
  Webhook,
  WebhookDelivery,
  ApiUsageLog,
  ApiEndpoint,
  // Security & Audit
  UserSession,
  AuditLog,
  OnboardingStep,
  UserOnboardingProgress,
  Invitation,
  // Location Management
  LocationSetting,
  LocationUser,
  LocationReport,
  InventoryByLocation,
  // Utility Types
  Json
} from './types/database.types';

// Export the class as default
export default DatabaseClientManager;
