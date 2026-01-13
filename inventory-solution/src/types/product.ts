/**
 * Product Management Types
 * TypeScript interfaces for the inventory management system
 */

// Core Product Types
export interface Product {
  id: string;
  name: string;
  description?: string;
  barcode: string;
  sku: string;
  category: ProductCategory;
  supplier: Supplier;
  variants: ProductVariant[];
  tags?: string[];
  status: ProductStatus;
  validityDate?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  attributes: VariantAttribute[];
  cost: number;
  costHistory: CostEntry[];
  price: number;
  stock: number;
  reorderLevel: number;
  minStockLevel: number;
  maxStockLevel: number;
  weight?: number;
  dimensions?: ProductDimensions;
  images?: ProductImage[];
  status: VariantStatus;
  batches?: Batch[];
  reorderRules?: ReorderRule[];
  createdAt: string;
  updatedAt: string;
}

export interface VariantAttribute {
  id: string;
  name: string;
  value: string;
  type: AttributeType;
}

export interface CostEntry {
  id: string;
  variantId: string;
  cost: number;
  quantity: number;
  supplier: string;
  date: string;
  reason?: string;
  createdBy: string;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in' | 'mm';
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

// Enums
export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCONTINUED = 'discontinued',
  OUT_OF_STOCK = 'out_of_stock'
}

export enum VariantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCONTINUED = 'discontinued'
}

export enum ProductCategory {
  ELECTRONICS = 'electronics',
  HARDWARE = 'hardware',
  SOFTWARE = 'software',
  GAMING = 'gaming',
  ACCESSORIES = 'accessories',
  POS_EQUIPMENT = 'pos_equipment',
  OTHER = 'other'
}

export enum AttributeType {
  COLOR = 'color',
  SIZE = 'size',
  CAPACITY = 'capacity',
  MATERIAL = 'material',
  MODEL = 'model',
  VERSION = 'version',
  OTHER = 'other'
}

// Supplier Types
export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: Address;
  taxId?: string;
  paymentTerms: PaymentTerms;
  status: SupplierStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export enum PaymentTerms {
  NET_15 = 'net_15',
  NET_30 = 'net_30',
  NET_60 = 'net_60',
  IMMEDIATE = 'immediate'
}

export enum SupplierStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

// Form Types
export interface ProductFormData {
  name: string;
  description: string;
  barcode: string;
  sku: string;
  category: ProductCategory;
  supplierId: string;
  tags: string[];
  validityDate?: string;
  variants: ProductVariantFormData[];
}

export interface ProductVariantFormData {
  id?: string;
  attributes: Record<string, string>;
  cost: string;
  price: string;
  stock: string;
  reorderLevel: string;
  minStockLevel: string;
  maxStockLevel: string;
  weight?: string;
  dimensions?: {
    length: string;
    width: string;
    height: string;
    unit: 'cm' | 'in' | 'mm';
  };
}

// Filter and Search Types
export interface ProductFilter {
  search?: string;
  category?: ProductCategory | 'all';
  supplier?: string;
  status?: ProductStatus | 'all';
  priceRange?: {
    min: number;
    max: number;
  };
  stockRange?: {
    min: number;
    max: number;
  };
  tags?: string[];
  sortBy?: ProductSortField;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export enum ProductSortField {
  NAME = 'name',
  SKU = 'sku',
  BARCODE = 'barcode',
  CATEGORY = 'category',
  PRICE = 'price',
  STOCK = 'stock',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt'
}

// API Response Types
export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ProductStats {
  totalProducts: number;
  totalVariants: number;
  totalStock: number;
  lowStockAlerts: number;
  outOfStock: number;
  expiringBatches: number;
  expiredBatches: number;
  pendingReorders: number;
  categories: CategoryStats[];
  suppliers: SupplierStats[];
  batchStats?: BatchStats;
  reorderStats?: ReorderStats;
}

export interface BatchStats {
  totalBatches: number;
  activeBatches: number;
  expiringBatches: number;
  expiredBatches: number;
  totalBatchValue: number;
  averageAge: number;
}

export interface ReorderStats {
  activeRules: number;
  pendingAlerts: number;
  criticalAlerts: number;
  avgLeadTime: number;
  monthlyReorders: number;
}

export interface CategoryStats {
  category: ProductCategory;
  count: number;
  totalStock: number;
  lowStock: number;
}

export interface SupplierStats {
  supplierId: string;
  supplierName: string;
  productCount: number;
  totalValue: number;
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Permission Types
export enum ProductPermission {
  READ = 'products:read',
  CREATE = 'products:create',
  UPDATE = 'products:update',
  DELETE = 'products:delete',
  MANAGE_VARIANTS = 'products:manage_variants',
  MANAGE_SUPPLIERS = 'products:manage_suppliers',
  BULK_OPERATIONS = 'products:bulk_operations',
  EXPORT = 'products:export',
  IMPORT = 'products:import'
}

// Component Props Types
export interface ProductListProps {
  products: Product[];
  loading?: boolean;
  error?: string;
  filter: ProductFilter;
  onFilterChange: (filter: ProductFilter) => void;
  onProductSelect: (product: Product) => void;
  onProductEdit: (product: Product) => void;
  onProductDelete: (productId: string) => void;
  onProductCreate: () => void;
  permissions: ProductPermission[];
  stats?: ProductStats;
}

export interface ProductFormProps {
  product?: Product;
  mode: 'create' | 'edit';
  loading?: boolean;
  error?: string;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  permissions: ProductPermission[];
  suppliers: Supplier[];
}

export interface ProductDetailsProps {
  product: Product;
  loading?: boolean;
  error?: string;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onVariantUpdate: (variant: ProductVariant) => void;
  permissions: ProductPermission[];
}

// Service Types
export interface ProductService {
  getProducts(filter?: ProductFilter): Promise<ProductListResponse>;
  getProductById(id: string): Promise<Product | null>;
  createProduct(data: ProductFormData): Promise<Product>;
  updateProduct(id: string, data: Partial<ProductFormData>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  bulkUpdateProducts(updates: BulkProductUpdate[]): Promise<Product[]>;
  exportProducts(filter?: ProductFilter): Promise<Blob>;
  importProducts(file: File): Promise<{ success: number; errors: string[] }>;
  getProductStats(): Promise<ProductStats>;
}

export interface BulkProductUpdate {
  id: string;
  updates: Partial<ProductFormData>;
}

// Hook Types
export interface UseProductListReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  filter: ProductFilter;
  stats: ProductStats | null;
  setFilter: (filter: Partial<ProductFilter>) => void;
  refresh: () => Promise<void>;
  createProduct: () => void;
  editProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
}

export interface UseProductFormReturn {
  formData: ProductFormData;
  validation: FormValidationResult;
  loading: boolean;
  error: string | null;
  setFormData: (data: Partial<ProductFormData>) => void;
  validateForm: () => FormValidationResult;
  submitForm: () => Promise<void>;
  resetForm: () => void;
}

// Utility Types
export type ProductWithVariants = Product & {
  totalStock: number;
  avgCost: number;
  avgPrice: number;
  lowStockVariants: number;
  isLowStock: boolean;
};

export type ProductSummary = Pick<Product, 'id' | 'name' | 'sku' | 'barcode' | 'category' | 'status'> & {
  totalStock: number;
  avgPrice: number;
  lowStock: boolean;
};

export type VariantSummary = Pick<ProductVariant, 'id' | 'attributes' | 'price' | 'stock' | 'reorderLevel'> & {
  productName: string;
  productSku: string;
  isLowStock: boolean;
  costTrend: 'up' | 'down' | 'stable';
};

// Error Types
export class ProductError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'ProductError';
  }
}

// Batch Tracking Types
export interface Batch {
  id: string;
  variantId: string;
  batchNumber: string;
  quantity: number;
  remainingQuantity: number;
  manufactureDate: string;
  expirationDate?: string;
  supplier: string;
  cost: number;
  location?: string;
  status: BatchStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export enum BatchStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  EXPIRING_SOON = 'expiring_soon',
  DEPLETED = 'depleted',
  QUARANTINE = 'quarantine'
}

// Automated Reorder Types
export interface ReorderRule {
  id: string;
  variantId: string;
  triggerType: ReorderTriggerType;
  triggerValue: number;
  reorderQuantity: number;
  supplierId: string;
  isActive: boolean;
  autoApprove: boolean;
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  leadTimeDays: number;
  lastTriggered?: string;
  createdAt: string;
  updatedAt: string;
}

export enum ReorderTriggerType {
  STOCK_LEVEL = 'stock_level',
  BATCH_EXPIRATION = 'batch_expiration',
  DEMAND_FORECAST = 'demand_forecast',
  MANUAL = 'manual'
}

export interface ReorderAlert {
  id: string;
  variantId: string;
  ruleId: string;
  alertType: ReorderAlertType;
  severity: AlertSeverity;
  message: string;
  isRead: boolean;
  createdAt: string;
  resolvedAt?: string;
}

export enum ReorderAlertType {
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  BATCH_EXPIRING = 'batch_expiring',
  BATCH_EXPIRED = 'batch_expired',
  REORDER_SUGGESTED = 'reorder_suggested'
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Report Types
export interface InventoryReport {
  id: string;
  name: string;
  type: ReportType;
  parameters: ReportParameters;
  generatedAt: string;
  generatedBy: string;
  data: ReportData;
  format: ReportFormat;
}

export enum ReportType {
  BATCH_TRACKING = 'batch_tracking',
  EXPIRATION_REPORT = 'expiration_report',
  REORDER_ANALYSIS = 'reorder_analysis',
  INVENTORY_VALUATION = 'inventory_valuation',
  SUPPLIER_PERFORMANCE = 'supplier_performance',
  STOCK_MOVEMENT = 'stock_movement'
}

export interface ReportParameters {
  dateRange?: {
    start: string;
    end: string;
  };
  categories?: ProductCategory[];
  suppliers?: string[];
  locations?: string[];
  includeExpired?: boolean;
  includeZeroStock?: boolean;
}

export interface ReportData {
  summary: ReportSummary;
  details: any[];
  charts?: ChartData[];
}

export interface ReportSummary {
  totalItems: number;
  totalValue: number;
  criticalAlerts: number;
  warnings: number;
  generatedAt: string;
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'area';
  title: string;
  data: any[];
  labels?: string[];
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json'
}

// Event Types
export interface ProductEvent {
  type: ProductEventType;
  productId: string;
  timestamp: string;
  userId: string;
  data?: Record<string, any>;
}

export enum ProductEventType {
  CREATED = 'product.created',
  UPDATED = 'product.updated',
  DELETED = 'product.deleted',
  VARIANT_ADDED = 'product.variant_added',
  VARIANT_UPDATED = 'product.variant_updated',
  VARIANT_DELETED = 'product.variant_deleted',
  STOCK_UPDATED = 'product.stock_updated',
  PRICE_UPDATED = 'product.price_updated',
  BATCH_CREATED = 'product.batch_created',
  BATCH_UPDATED = 'product.batch_updated',
  BATCH_EXPIRED = 'product.batch_expired',
  REORDER_TRIGGERED = 'product.reorder_triggered'
}
