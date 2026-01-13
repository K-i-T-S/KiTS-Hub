/**
 * Multi-Location Inventory Types
 * TypeScript interfaces for multi-location inventory tracking
 */

import type { Product, ProductVariant } from './product';

// Location Types
export interface Location {
  id: string;
  name: string;
  code: string;
  type: LocationType;
  address: LocationAddress;
  contact: LocationContact;
  status: LocationStatus;
  settings: LocationSettings;
  metrics: LocationMetrics;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export enum LocationType {
  STORE = 'store',
  WAREHOUSE = 'warehouse',
  OFFICE = 'office',
  POP_UP = 'pop_up',
  ONLINE = 'online'
}

export enum LocationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  CLOSED = 'closed'
}

export interface LocationAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface LocationContact {
  phone: string;
  email: string;
  manager: string;
  alternateContact?: string;
}

export interface LocationSettings {
  timezone: string;
  currency: string;
  taxRate: number;
  businessHours: BusinessHours[];
  lowStockThreshold: number;
  autoReorder: boolean;
  enableNotifications: boolean;
}

export interface BusinessHours {
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface LocationMetrics {
  totalProducts: number;
  totalStock: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  recentTransfers: number;
  salesToday: number;
  ordersPending: number;
}

// Stock Transfer Types
export interface StockTransfer {
  id: string;
  transferNumber: string;
  fromLocationId: string;
  toLocationId: string;
  status: TransferStatus;
  priority: TransferPriority;
  items: StockTransferItem[];
  notes?: string;
  requestedBy: string;
  approvedBy?: string;
  pickedUpBy?: string;
  deliveredBy?: string;
  requestedAt: string;
  approvedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  estimatedArrival?: string;
  actualArrival?: string;
  trackingNumber?: string;
  carrier?: string;
  cost?: number;
  createdAt: string;
  updatedAt: string;
}

export enum TransferStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IN_TRANSIT = 'in_transit',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum TransferPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface StockTransferItem {
  id: string;
  productId: string;
  productVariantId: string;
  batchId?: string;
  quantity: number;
  unitCost?: number;
  notes?: string;
  serialNumbers?: string[];
  expiryDate?: string;
  condition: ItemCondition;
}

export enum ItemCondition {
  NEW = 'new',
  LIKE_NEW = 'like_new',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  DAMAGED = 'damaged'
}

// Location Staff Types
export interface LocationStaff {
  id: string;
  locationId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  role: StaffRole;
  permissions: StaffPermission[];
  isActive: boolean;
  hireDate: string;
  terminationDate?: string;
  hourlyRate?: number;
  salary?: number;
}

export enum StaffRole {
  MANAGER = 'manager',
  SUPERVISOR = 'supervisor',
  ASSOCIATE = 'associate',
  CASHIER = 'cashier',
  STOCK_CLERK = 'stock_clerk',
  DRIVER = 'driver'
}

export enum StaffPermission {
  READ_INVENTORY = 'read_inventory',
  WRITE_INVENTORY = 'write_inventory',
  TRANSFER_STOCK = 'transfer_stock',
  RECEIVE_STOCK = 'receive_stock',
  ADJUST_STOCK = 'adjust_stock',
  MANAGE_TRANSFERS = 'manage_transfers',
  APPROVE_TRANSFERS = 'approve_transfers',
  VIEW_REPORTS = 'view_reports',
  MANAGE_STAFF = 'manage_staff',
  LOCATION_SETTINGS = 'location_settings'
}

// Inventory Tracking Types
export interface LocationInventory {
  locationId: string;
  productId: string;
  productVariantId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lastUpdated: string;
  lastCountDate: string;
  lowStockAlert: boolean;
  reorderPoint: number;
  maxStock: number;
  minStock: number;
  cost: number;
  value: number;
}

export interface StockLevel {
  locationId: string;
  productId: string;
  productVariantId: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  lastUpdated: string;
  trend: StockTrend;
  daysOfStock: number;
  averageDailyUsage: number;
  projectedStockoutDate?: string;
}

export enum StockTrend {
  INCREASING = 'increasing',
  DECREASING = 'decreasing',
  STABLE = 'stable',
  FLUCTUATING = 'fluctuating'
}

// Real-time Update Types
export interface RealTimeUpdate {
  id: string;
  type: UpdateType;
  entityType: EntityType;
  entityId: string;
  locationId?: string;
  data: any;
  timestamp: string;
  userId: string;
  metadata?: Record<string, any>;
}

export enum UpdateType {
  STOCK_LEVEL_CHANGE = 'stock_level_change',
  TRANSFER_CREATED = 'transfer_created',
  TRANSFER_UPDATED = 'transfer_updated',
  TRANSFER_COMPLETED = 'transfer_completed',
  PRODUCT_CREATED = 'product_created',
  PRODUCT_UPDATED = 'product_updated',
  LOCATION_CREATED = 'location_created',
  LOCATION_UPDATED = 'location_updated',
  STAFF_ASSIGNED = 'staff_assigned',
  STAFF_REMOVED = 'staff_removed'
}

export enum EntityType {
  PRODUCT = 'product',
  VARIANT = 'product_variant',
  LOCATION = 'location',
  TRANSFER = 'transfer',
  STAFF = 'staff',
  INVENTORY = 'inventory'
}

// Validation Types
export interface TransferValidationRule {
  id: string;
  name: string;
  description: string;
  type: ValidationRuleType;
  conditions: ValidationCondition[];
  actions: ValidationAction[];
  isActive: boolean;
}

export enum ValidationRuleType {
  BUSINESS_RULE = 'business_rule',
  COMPLIANCE_RULE = 'compliance_rule',
  SECURITY_RULE = 'security_rule',
  INTEGRITY_RULE = 'integrity_rule'
}

export interface ValidationCondition {
  field: string;
  operator: ValidationOperator;
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export enum ValidationOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  GREATER_THAN_OR_EQUAL = 'greater_than_or_equal',
  LESS_THAN_OR_EQUAL = 'less_than_or_equal',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  IS_NULL = 'is_null',
  IS_NOT_NULL = 'is_not_null',
  REGEX = 'regex'
}

export interface ValidationAction {
  type: ActionType;
  message: string;
  severity: ActionSeverity;
}

export enum ActionType {
  WARNING = 'warning',
  ERROR = 'error',
  BLOCK = 'block',
  NOTIFY = 'notify',
  LOG = 'log'
}

export enum ActionSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Service Types
export interface LocationService {
  getLocations(filter?: LocationFilter): Promise<LocationListResponse>;
  getLocationById(id: string): Promise<Location | null>;
  createLocation(data: CreateLocationData): Promise<Location>;
  updateLocation(id: string, data: Partial<CreateLocationData>): Promise<Location>;
  deleteLocation(id: string): Promise<void>;
  getInventoryByLocation(locationId: string): Promise<LocationInventory[]>;
  getStockLevels(filter?: StockLevelFilter): Promise<StockLevel[]>;
  transferStock(transfer: CreateTransferData): Promise<StockTransfer>;
  approveTransfer(transferId: string, approvedBy: string): Promise<StockTransfer>;
  rejectTransfer(transferId: string, reason: string): Promise<StockTransfer>;
  completeTransfer(transferId: string, notes?: string): Promise<StockTransfer>;
  getTransfers(filter?: TransferFilter): Promise<TransferListResponse>;
  getTransferById(id: string): Promise<StockTransfer | null>;
  getTransferHistory(locationId: string, productId?: string): Promise<StockTransfer[]>;
}

export interface CreateLocationData {
  name: string;
  code: string;
  type: LocationType;
  address: LocationAddress;
  contact: LocationContact;
  settings: LocationSettings;
  status: LocationStatus;
}

export interface LocationFilter {
  search?: string;
  type?: LocationType;
  status?: LocationStatus;
  country?: string;
  state?: string;
  city?: string;
  sortBy?: LocationSortField;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export enum LocationSortField {
  NAME = 'name',
  CODE = 'code',
  TYPE = 'type',
  STATUS = 'status',
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at'
}

export interface LocationListResponse {
  locations: Location[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CreateTransferData {
  fromLocationId: string;
  toLocationId: string;
  items: StockTransferItem[];
  priority: TransferPriority;
  notes?: string;
  requestedBy: string;
  estimatedArrival?: string;
  carrier?: string;
}

export interface TransferFilter {
  search?: string;
  fromLocationId?: string;
  toLocationId?: string;
  status?: TransferStatus;
  priority?: TransferPriority;
  dateRange?: {
    from: string;
    to: string;
  };
  requestedBy?: string;
  sortBy?: TransferSortField;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export enum TransferSortField {
  TRANSFER_NUMBER = 'transfer_number',
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  ESTIMATED_ARRIVAL = 'estimated_arrival',
  PRIORITY = 'priority',
  STATUS = 'status'
}

export interface TransferListResponse {
  transfers: StockTransfer[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface StockLevelFilter {
  locationIds?: string[];
  productIds?: string[];
  variantIds?: string[];
  lowStockOnly?: boolean;
  outOfStockOnly?: boolean;
  sortBy?: StockLevelSortField;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export enum StockLevelSortField {
  CURRENT_STOCK = 'current_stock',
  AVAILABLE_STOCK = 'available_stock',
  LAST_UPDATED = 'last_updated',
  PRODUCT_NAME = 'product_name',
  LOCATION_NAME = 'location_name'
}

// Hook Types
export interface UseLocationInventoryReturn {
  locations: Location[];
  selectedLocation: Location | null;
  inventory: LocationInventory[];
  stockLevels: StockLevel[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  selectLocation: (location: Location) => void;
  getInventoryByLocation: (locationId: string) => Promise<LocationInventory[]>;
  getStockLevels: (filter?: StockLevelFilter) => Promise<StockLevel[]>;
  updateStockLevel: (locationId: string, productId: string, variantId: string, quantity: number) => Promise<void>;
}

export interface UseTransferManagementReturn {
  transfers: StockTransfer[];
  loading: boolean;
  error: string | null;
  createTransfer: (data: CreateTransferData) => Promise<StockTransfer>;
  approveTransfer: (transferId: string, approvedBy: string) => Promise<StockTransfer>;
  rejectTransfer: (transferId: string, reason: string) => Promise<StockTransfer>;
  completeTransfer: (transferId: string, notes?: string) => Promise<StockTransfer>;
  getTransfers: (filter?: TransferFilter) => Promise<TransferListResponse>;
  getTransferById: (id: string) => Promise<StockTransfer | null>;
  refresh: () => Promise<void>;
}

// Real-time Types
export interface RealTimeService {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  subscribe(entityType: EntityType, entityId: string, callback: (update: RealTimeUpdate) => void): () => void;
  unsubscribe: (subscriptionId: string) => void;
  publish(update: RealTimeUpdate): Promise<void>;
  subscribeToLocation(locationId: string, callback: (update: RealTimeUpdate) => void): () => void;
  subscribeToTransfer(callback: (update: RealTimeUpdate) => void): () => void;
}

// Error Types
export class MultiLocationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'MultiLocationError';
  }
}

export class TransferValidationError extends MultiLocationError {
  constructor(message: string, code: string, public validationErrors: ValidationError[] = []) {
    super(message, code);
  }
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

// Event Types
export interface MultiLocationEvent {
  type: MultiLocationEventType;
  locationId?: string;
  transferId?: string;
  data: any;
  timestamp: string;
  userId: string;
}

export enum MultiLocationEventType {
  LOCATION_CREATED = 'location.created',
  LOCATION_UPDATED = 'location.updated',
  LOCATION_DELETED = 'location.deleted',
  TRANSFER_CREATED = 'transfer.created',
  TRANSFER_UPDATED = 'transfer.updated',
  TRANSFER_COMPLETED = 'transfer.completed',
  TRANSFER_CANCELLED = 'transfer.cancelled',
  STOCK_LEVEL_CHANGED = 'stock.level_changed',
  INVENTORY_ADJUSTED = 'inventory.adjusted',
  STAFF_ASSIGNED = 'staff.assigned',
  STAFF_REMOVED = 'staff.removed'
}
