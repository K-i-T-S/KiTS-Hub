/**
 * Mock Utilities for KiTS Hub Testing
 * Provides comprehensive mocking for external dependencies
 */

import { vi } from 'vitest';

// Supabase Mock
export const createSupabaseMock = () => ({
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        data: [],
        error: null,
        single: vi.fn(() => ({ data: null, error: null })),
        order: vi.fn(() => ({ data: [], error: null })),
        limit: vi.fn(() => ({ data: [], error: null })),
        in: vi.fn(() => ({ data: [], error: null })),
        ilike: vi.fn(() => ({ data: [], error: null })),
        gte: vi.fn(() => ({ data: [], error: null })),
        lte: vi.fn(() => ({ data: [], error: null })),
      })),
      order: vi.fn(() => ({ data: [], error: null })),
      limit: vi.fn(() => ({ data: [], error: null })),
      in: vi.fn(() => ({ data: [], error: null })),
      ilike: vi.fn(() => ({ data: [], error: null })),
      gte: vi.fn(() => ({ data: [], error: null })),
      lte: vi.fn(() => ({ data: [], error: null })),
    })),
    insert: vi.fn(() => ({
      data: null,
      error: null,
      select: vi.fn(() => ({ data: null, error: null })),
    })),
    update: vi.fn(() => ({
      data: null,
      error: null,
      eq: vi.fn(() => ({ data: null, error: null })),
      select: vi.fn(() => ({ data: null, error: null })),
    })),
    delete: vi.fn(() => ({
      data: null,
      error: null,
      eq: vi.fn(() => ({ data: null, error: null })),
    })),
  })),
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
    onAuthStateChange: vi.fn(),
    updateUser: vi.fn(),
    resetPasswordForEmail: vi.fn(),
  },
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(),
      download: vi.fn(),
      getPublicUrl: vi.fn(() => ({ data: { publicUrl: '' }, error: null })),
      remove: vi.fn(),
      list: vi.fn(),
    })),
  },
  functions: {
    invoke: vi.fn(),
  },
  realtime: {
    channel: vi.fn(() => ({
      on: vi.fn(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    })),
  },
});

// Tenant Manager Mock
export const tenantManagerMock = {
  getCurrentUserTenant: vi.fn(() => ({
    id: 'test-tenant-id',
    name: 'Test Tenant',
    slug: 'test-tenant',
    plan_type: 'basic',
    status: 'active',
  })),
  switchTenant: vi.fn(),
  validateTenantAccess: vi.fn(),
  getTenantSettings: vi.fn(),
  updateTenantSettings: vi.fn(),
};

// React Query Mock
export const createReactQueryMock = () => ({
  QueryClient: vi.fn(() => ({
    queryCache: { clear: vi.fn() },
    mutationCache: { clear: vi.fn() },
    clear: vi.fn(),
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
    invalidateQueries: vi.fn(),
    refetchQueries: vi.fn(),
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(() => ({
    queryCache: { clear: vi.fn() },
    mutationCache: { clear: vi.fn() },
    clear: vi.fn(),
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
    invalidateQueries: vi.fn(),
    refetchQueries: vi.fn(),
  })),
  useInfiniteQuery: vi.fn(),
  useIsFetching: vi.fn(() => 0),
  useIsMutating: vi.fn(() => 0),
});

// Next.js Router Mock
export const createNextRouterMock = () => ({
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
  route: '/',
  isFallback: false,
  basePath: '',
  isLocaleDomain: false,
  isReady: true,
  events: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
});

// Next.js Navigation Mock (App Router)
export const createNextNavigationMock = () => ({
  useRouter: () => createNextRouterMock(),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  useParams: () => ({}),
  useSelectedLayoutSegment: () => null,
  useSelectedLayoutSegments: () => [],
});

// Stripe Mock
export const createStripeMock = () => ({
  loadStripe: vi.fn(() => Promise.resolve({
    elements: vi.fn(() => ({
      create: vi.fn(() => ({
        mount: vi.fn(),
        destroy: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        clear: vi.fn(),
        focus: vi.fn(),
        blur: vi.fn(),
        update: vi.fn(),
      })),
      getElement: vi.fn(),
      submit: vi.fn(),
      update: vi.fn(),
    })),
    confirmPayment: vi.fn(),
    confirmCardPayment: vi.fn(),
    confirmSetup: vi.fn(),
    retrievePaymentIntent: vi.fn(),
    createPaymentMethod: vi.fn(),
  })),
  Elements: ({ children }: { children: React.ReactNode }) => children,
  PaymentElement: vi.fn(),
  CardElement: vi.fn(),
  CardNumberElement: vi.fn(),
  CardExpiryElement: vi.fn(),
  CardCvcElement: vi.fn(),
  useStripe: vi.fn(() => createStripeMock()),
  useElements: vi.fn(() => ({
    getElement: vi.fn(),
    submit: vi.fn(),
  })),
});

// Email Service Mock
export const createEmailServiceMock = () => ({
  sendEmail: vi.fn(),
  sendTemplateEmail: vi.fn(),
  sendBulkEmail: vi.fn(),
  getEmailStatus: vi.fn(),
  previewEmail: vi.fn(),
});

// SMS Service Mock
export const createSMSServiceMock = () => ({
  sendSMS: vi.fn(),
  sendBulkSMS: vi.fn(),
  getSMSStatus: vi.fn(),
  validatePhoneNumber: vi.fn(),
});

// File Upload Mock
export const createFileUploadMock = () => ({
  uploadFile: vi.fn(),
  uploadMultipleFiles: vi.fn(),
  deleteFile: vi.fn(),
  getFileUrl: vi.fn(),
  getFileMetadata: vi.fn(),
});

// Analytics Mock
export const createAnalyticsMock = () => ({
  track: vi.fn(),
  identify: vi.fn(),
  page: vi.fn(),
  group: vi.fn(),
  alias: vi.fn(),
  reset: vi.fn(),
});

// Logger Mock
export const createLoggerMock = () => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
  log: vi.fn(),
});

// Cache Mock
export const createCacheMock = () => ({
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn(),
  has: vi.fn(),
  keys: vi.fn(() => []),
  values: vi.fn(() => []),
});

// Webhook Mock
export const createWebhookMock = () => ({
  sendWebhook: vi.fn(),
  verifyWebhook: vi.fn(),
  retryWebhook: vi.fn(),
  getWebhookLogs: vi.fn(),
});

// Mock data generators
export const generateMockApiResponse = <T>(data: T, error = null) => ({
  data,
  error,
  status: error ? 'error' : 'success',
  timestamp: new Date().toISOString(),
});

export const generateMockPaginatedResponse = <T>(
  items: T[],
  page = 1,
  limit = 10,
  total?: number
) => ({
  data: items,
  pagination: {
    page,
    limit,
    total: total || items.length,
    totalPages: Math.ceil((total || items.length) / limit),
    hasNextPage: page * limit < (total || items.length),
    hasPreviousPage: page > 1,
  },
  status: 'success',
  timestamp: new Date().toISOString(),
});

// Error mock generators
export const generateMockError = (message: string, code?: string) => ({
  message,
  code,
  status: 'error',
  timestamp: new Date().toISOString(),
});

export const generateMockValidationError = (field: string, message: string) => ({
  field,
  message,
  code: 'VALIDATION_ERROR',
  status: 'error',
  timestamp: new Date().toISOString(),
});

// Test environment helpers
export const setupTestEnvironment = () => {
  // Mock console methods in tests
  const originalConsole = { ...console };
  
  beforeAll(() => {
    console.error = vi.fn();
    console.warn = vi.fn();
    console.info = vi.fn();
    console.log = vi.fn();
  });

  afterAll(() => {
    Object.assign(console, originalConsole);
  });

  return { originalConsole };
};

// Cleanup helpers
export const cleanupMocks = () => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
};

// Async test helpers
export const waitFor = (condition: () => boolean, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = () => {
      if (condition()) {
        resolve(true);
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'));
      } else {
        setTimeout(check, 100);
      }
    };
    
    check();
  });
};

export const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));
