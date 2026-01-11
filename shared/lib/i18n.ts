export interface Translation {
  // Common
  loading: string;
  error: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  view: string;
  search: string;
  filter: string;
  refresh: string;
  back: string;
  next: string;
  previous: string;
  page: string;
  of: string;
  results: string;
  noResults: string;
  retry: string;
  
  // Navigation
  dashboard: string;
  inventory: string;
  pos: string;
  crm: string;
  hr: string;
  accounting: string;
  analytics: string;
  settings: string;
  
  // Inventory
  products: string;
  product: string;
  productName: string;
  sku: string;
  productDescription: string;
  category: string;
  supplier: string;
  location: string;
  stock: string;
  stockQuantity: string;
  unitPrice: string;
  costPrice: string;
  minStock: string;
  maxStock: string;
  reorderPoint: string;
  barcode: string;
  weight: string;
  dimensions: string;
  images: string;
  tags: string;
  status: string;
  active: string;
  inactive: string;
  discontinued: string;
  outOfStock: string;
  lowStock: string;
  inStock: string;
  addProduct: string;
  editProduct: string;
  deleteProduct: string;
  generateBarcode: string;
  generateSKU: string;
  
  // POS
  cart: string;
  checkout: string;
  payment: string;
  paymentMethod: string;
  cash: string;
  card: string;
  mobileMoney: string;
  bankTransfer: string;
  check: string;
  credit: string;
  subtotal: string;
  tax: string;
  total: string;
  completeSale: string;
  receipt: string;
  addToCart: string;
  removeFromCart: string;
  quantity: string;
  emptyCart: string;
  
  // CRM
  customers: string;
  customer: string;
  customerName: string;
  customerNumber: string;
  customerEmail: string;
  customerPhone: string;
  company: string;
  industry: string;
  source: string;
  website: string;
  referral: string;
  socialMedia: string;
  emailSource: string;
  phoneSource: string;
  prospect: string;
  churned: string;
  addCustomer: string;
  editCustomer: string;
  deleteCustomer: string;
  notes: string;
  
  // HR
  employees: string;
  employee: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  manager: string;
  hireDate: string;
  salary: string;
  emergencyContact: string;
  relationship: string;
  onLeave: string;
  terminated: string;
  suspended: string;
  addEmployee: string;
  editEmployee: string;
  terminateEmployee: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  
  // Accounting
  accounts: string;
  account: string;
  accountNumber: string;
  accountType: string;
  asset: string;
  liability: string;
  equity: string;
  revenue: string;
  expense: string;
  balance: string;
  transactions: string;
  transaction: string;
  amount: string;
  transactionDate: string;
  transactionDescription: string;
  completed: string;
  pending: string;
  failed: string;
  cancelled: string;
  draft: string;
  posted: string;
  reversed: string;
  createInvoice: string;
  recordPayment: string;
  payBills: string;
  generateReport: string;
  profitLoss: string;
  balanceSheet: string;
  cashFlowReport: string;
  agingReport: string;
  trialBalance: string;
  generalLedger: string;
  budgetVsActual: string;
  
  // Analytics
  totalRevenue: string;
  totalExpenses: string;
  netIncome: string;
  totalOrders: string;
  averageOrderValue: string;
  totalCustomers: string;
  newCustomersThisMonth: string;
  activeCustomers: string;
  churnedCustomersThisMonth: string;
  totalProducts: string;
  lowStockItems: string;
  receivables: string;
  payables: string;
  cashFlowAnalytics: string;
  revenueGrowth: string;
  customerGrowth: string;
  topProducts: string;
  revenueTrend: string;
  customerOverview: string;
  quickActions: string;
  generateReportEmail: string;
  configureAlerts: string;
  
  // Forms
  required: string;
  selectOption: string;
  allOptions: string;
  allStatuses: string;
  allSources: string;
  allDepartments: string;
  allTypes: string;
  
  // Time ranges
  last7Days: string;
  last30Days: string;
  last90Days: string;
  lastYear: string;
  
  // Messages
  confirmDelete: string;
  confirmTerminate: string;
  cartEmpty: string;
  saleCompleted: string;
  failedToLoad: string;
  failedToSave: string;
  processing: string;
  saving: string;
}

export const translations: Record<string, Translation> = {
  en: {
    // Common
    loading: 'Loading...',
    error: 'Error',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    search: 'Search',
    filter: 'Filter',
    refresh: 'Refresh',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    page: 'Page',
    of: 'of',
    results: 'results',
    noResults: 'No results found',
    retry: 'Retry',
    
    // Navigation
    dashboard: 'Dashboard',
    inventory: 'Inventory',
    pos: 'Point of Sale',
    crm: 'CRM',
    hr: 'HR',
    accounting: 'Accounting',
    analytics: 'Analytics',
    settings: 'Settings',
    
    // Inventory
    products: 'Products',
    product: 'Product',
    productName: 'Product Name',
    sku: 'SKU',
    description: 'Description',
    category: 'Category',
    supplier: 'Supplier',
    location: 'Location',
    stock: 'Stock',
    stockQuantity: 'Stock Quantity',
    unitPrice: 'Unit Price',
    costPrice: 'Cost Price',
    minStock: 'Min Stock Level',
    maxStock: 'Max Stock Level',
    reorderPoint: 'Reorder Point',
    barcode: 'Barcode',
    weight: 'Weight',
    dimensions: 'Dimensions',
    images: 'Images',
    tags: 'Tags',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    discontinued: 'Discontinued',
    outOfStock: 'Out of Stock',
    lowStock: 'Low Stock',
    inStock: 'In Stock',
    addProduct: 'Add Product',
    editProduct: 'Edit Product',
    deleteProduct: 'Delete Product',
    generateBarcode: 'Generate Barcode',
    generateSKU: 'Generate SKU',
    
    // POS
    cart: 'Cart',
    checkout: 'Checkout',
    payment: 'Payment',
    paymentMethod: 'Payment Method',
    cash: 'Cash',
    card: 'Card',
    mobileMoney: 'Mobile Money',
    bankTransfer: 'Bank Transfer',
    check: 'Check',
    credit: 'Credit',
    subtotal: 'Subtotal',
    tax: 'Tax',
    total: 'Total',
    completeSale: 'Complete Sale',
    receipt: 'Receipt',
    addToCart: 'Add to Cart',
    removeFromCart: 'Remove from Cart',
    quantity: 'Quantity',
    emptyCart: 'Cart is empty',
    
    // CRM
    customers: 'Customers',
    customer: 'Customer',
    customerName: 'Customer Name',
    customerNumber: 'Customer Number',
    email: 'Email',
    phone: 'Phone',
    company: 'Company',
    industry: 'Industry',
    source: 'Source',
    website: 'Website',
    referral: 'Referral',
    socialMedia: 'Social Media',
    prospect: 'Prospect',
    churned: 'Churned',
    addCustomer: 'Add Customer',
    editCustomer: 'Edit Customer',
    deleteCustomer: 'Delete Customer',
    notes: 'Notes',
    
    // HR
    employees: 'Employees',
    employee: 'Employee',
    employeeNumber: 'Employee Number',
    firstName: 'First Name',
    lastName: 'Last Name',
    department: 'Department',
    position: 'Position',
    manager: 'Manager',
    hireDate: 'Hire Date',
    salary: 'Salary',
    emergencyContact: 'Emergency Contact',
    relationship: 'Relationship',
    onLeave: 'On Leave',
    terminated: 'Terminated',
    suspended: 'Suspended',
    addEmployee: 'Add Employee',
    editEmployee: 'Edit Employee',
    terminateEmployee: 'Terminate Employee',
    address: 'Address',
    city: 'City',
    country: 'Country',
    postalCode: 'Postal Code',
    
    // Accounting
    accounts: 'Accounts',
    account: 'Account',
    accountNumber: 'Account Number',
    accountType: 'Account Type',
    asset: 'Asset',
    liability: 'Liability',
    equity: 'Equity',
    revenue: 'Revenue',
    expense: 'Expense',
    balance: 'Balance',
    transactions: 'Transactions',
    transaction: 'Transaction',
    amount: 'Amount',
    date: 'Date',
    description: 'Description',
    completed: 'Completed',
    pending: 'Pending',
    failed: 'Failed',
    cancelled: 'Cancelled',
    draft: 'Draft',
    posted: 'Posted',
    reversed: 'Reversed',
    createInvoice: 'Create Invoice',
    recordPayment: 'Record Payment',
    payBills: 'Pay Bills',
    generateReport: 'Generate Report',
    profitLoss: 'Profit & Loss',
    balanceSheet: 'Balance Sheet',
    cashFlow: 'Cash Flow',
    agingReport: 'Aging Report',
    trialBalance: 'Trial Balance',
    generalLedger: 'General Ledger',
    budgetVsActual: 'Budget vs Actual',
    
    // Analytics
    totalRevenue: 'Total Revenue',
    totalExpenses: 'Total Expenses',
    netIncome: 'Net Income',
    totalOrders: 'Total Orders',
    averageOrderValue: 'Average Order Value',
    totalCustomers: 'Total Customers',
    newCustomersThisMonth: 'New This Month',
    activeCustomers: 'Active Customers',
    churnedCustomersThisMonth: 'Churned This Month',
    totalProducts: 'Total Products',
    lowStockItems: 'Low Stock Items',
    receivables: 'Receivables',
    payables: 'Payables',
    cashFlow: 'Cash Flow',
    revenueGrowth: 'Revenue Growth',
    customerGrowth: 'Customer Growth',
    topProducts: 'Top Products',
    revenueTrend: 'Revenue Trend',
    customerOverview: 'Customer Overview',
    quickActions: 'Quick Actions',
    generateReportEmail: 'Email Report',
    configureAlerts: 'Configure Alerts',
    
    // Forms
    required: 'Required',
    selectOption: 'Select an option',
    allOptions: 'All Options',
    allStatuses: 'All Statuses',
    allSources: 'All Sources',
    allDepartments: 'All Departments',
    allTypes: 'All Types',
    
    // Time ranges
    last7Days: 'Last 7 days',
    last30Days: 'Last 30 days',
    last90Days: 'Last 90 days',
    lastYear: 'Last year',
    
    // Messages
    confirmDelete: 'Are you sure you want to delete',
    confirmTerminate: 'Are you sure you want to terminate',
    cartEmpty: 'Cart is empty',
    saleCompleted: 'Sale completed successfully!',
    failedToLoad: 'Failed to load data',
    failedToSave: 'Failed to save. Please try again.',
    processing: 'Processing...',
    saving: 'Saving...',
  },
  
  ar: {
    // Common
    loading: 'جاري التحميل...',
    error: 'خطأ',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    view: 'عرض',
    search: 'بحث',
    filter: 'تصفية',
    refresh: 'تحديث',
    back: 'رجوع',
    next: 'التالي',
    previous: 'السابق',
    page: 'صفحة',
    of: 'من',
    results: 'نتيجة',
    noResults: 'لا توجد نتائج',
    retry: 'إعادة المحاولة',
    
    // Navigation
    dashboard: 'لوحة القيادة',
    inventory: 'المخزون',
    pos: 'نقطة البيع',
    crm: 'إدارة العملاء',
    hr: 'الموارد البشرية',
    accounting: 'المحاسبة',
    analytics: 'التحليلات',
    settings: 'الإعدادات',
    
    // Inventory
    products: 'المنتجات',
    product: 'المنتج',
    productName: 'اسم المنتج',
    sku: 'رمز المنتج',
    description: 'الوصف',
    category: 'الفئة',
    supplier: 'المورد',
    location: 'الموقع',
    stock: 'المخزون',
    stockQuantity: 'الكمية',
    unitPrice: 'سعر الوحدة',
    costPrice: 'سعر التكلفة',
    minStock: 'الحد الأدنى للمخزون',
    maxStock: 'الحد الأقصى للمخزون',
    reorderPoint: 'نقطة إعادة الطلب',
    barcode: 'الباركود',
    weight: 'الوزن',
    dimensions: 'الأبعاد',
    images: 'الصور',
    tags: 'الوسوم',
    status: 'الحالة',
    active: 'نشط',
    inactive: 'غير نشط',
    discontinued: 'متوقف',
    outOfStock: 'نفد المخزون',
    lowStock: 'مخزون منخفض',
    inStock: 'متوفر',
    addProduct: 'إضافة منتج',
    editProduct: 'تعديل المنتج',
    deleteProduct: 'حذف المنتج',
    generateBarcode: 'إنشاء باركود',
    generateSKU: 'إنشاء رمز المنتج',
    
    // POS
    cart: 'عربة التسوق',
    checkout: 'الدفع',
    payment: 'الدفع',
    paymentMethod: 'طريقة الدفع',
    cash: 'نقدي',
    card: 'بطاقة',
    mobileMoney: 'محفظة إلكترونية',
    bankTransfer: 'تحويل بنكي',
    check: 'شيك',
    credit: 'ائتمان',
    subtotal: 'المجموع الفرعي',
    tax: 'الضريبة',
    total: 'الإجمالي',
    completeSale: 'إتمام البيع',
    receipt: 'إيصال',
    addToCart: 'إضافة للعربة',
    removeFromCart: 'إزالة من العربة',
    quantity: 'الكمية',
    emptyCart: 'العربة فارغة',
    
    // CRM
    customers: 'العملاء',
    customer: 'العميل',
    customerName: 'اسم العميل',
    customerNumber: 'رقم العميل',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    company: 'الشركة',
    industry: 'الصناعة',
    source: 'المصدر',
    website: 'الموقع الإلكتروني',
    referral: 'إحالة',
    socialMedia: 'وسائل التواصل الاجتماعي',
    prospect: 'عميل محتمل',
    churned: 'فقد',
    addCustomer: 'إضافة عميل',
    editCustomer: 'تعديل العميل',
    deleteCustomer: 'حذف العميل',
    notes: 'ملاحظات',
    
    // HR
    employees: 'الموظفين',
    employee: 'الموظف',
    employeeNumber: 'رقم الموظف',
    firstName: 'الاسم الأول',
    lastName: 'الاسم الأخير',
    department: 'القسم',
    position: 'المنصب',
    manager: 'المدير',
    hireDate: 'تاريخ التوظيف',
    salary: 'الراتب',
    emergencyContact: 'جهة اتصال طارئة',
    relationship: 'العلاقة',
    onLeave: 'في إجازة',
    terminated: 'مفصول',
    suspended: 'موقوف',
    addEmployee: 'إضافة موظف',
    editEmployee: 'تعديل الموظف',
    terminateEmployee: 'فصل الموظف',
    address: 'العنوان',
    city: 'المدينة',
    country: 'البلد',
    postalCode: 'الرمز البريدي',
    
    // Accounting
    accounts: 'الحسابات',
    account: 'الحساب',
    accountNumber: 'رقم الحساب',
    accountType: 'نوع الحساب',
    asset: 'الأصول',
    liability: 'الالتزامات',
    equity: 'الحقوق',
    revenue: 'الإيرادات',
    expense: 'المصروفات',
    balance: 'الرصيد',
    transactions: 'المعاملات',
    transaction: 'معاملة',
    amount: 'المبلغ',
    date: 'التاريخ',
    description: 'الوصف',
    completed: 'مكتمل',
    pending: 'معلق',
    failed: 'فشل',
    cancelled: 'ملغي',
    draft: 'مسودة',
    posted: 'مُدرج',
    reversed: 'ملغى',
    createInvoice: 'إنشاء فاتورة',
    recordPayment: 'تسجيل دفعة',
    payBills: 'دفع الفواتير',
    generateReport: 'إنشاء تقرير',
    profitLoss: 'الأرباح والخسائر',
    balanceSheet: 'الميزانية العمومية',
    cashFlow: 'التدفق النقدي',
    agingReport: 'تقرير التقادم',
    trialBalance: 'ميزان المراجعة',
    generalLedger: 'الدفتر العام',
    budgetVsActual: 'المقارنة بين الميزانية والفعلي',
    
    // Analytics
    totalRevenue: 'إجمالي الإيرادات',
    totalExpenses: 'إجمالي المصروفات',
    netIncome: 'صافي الدخل',
    totalOrders: 'إجمالي الطلبات',
    averageOrderValue: 'متوسط قيمة الطلب',
    totalCustomers: 'إجمالي العملاء',
    newCustomersThisMonth: 'جدد هذا الشهر',
    activeCustomers: 'العملاء النشطون',
    churnedCustomersThisMonth: 'فقدوا هذا الشهر',
    totalProducts: 'إجمالي المنتجات',
    lowStockItems: 'عناصر المخزون المنخفض',
    receivables: 'الذمم المدينة',
    payables: 'الذمم الدائنة',
    cashFlow: 'التدفق النقدي',
    revenueGrowth: 'نمو الإيرادات',
    customerGrowth: 'نمو العملاء',
    topProducts: 'أفضل المنتجات',
    revenueTrend: 'اتجاه الإيرادات',
    customerOverview: 'نظرة عامة على العملاء',
    quickActions: 'إجراءات سريعة',
    generateReportEmail: 'إرسال التقرير بالبريد',
    configureAlerts: 'تكوين التنبيهات',
    
    // Forms
    required: 'مطلوب',
    selectOption: 'اختر خيار',
    allOptions: 'كل الخيارات',
    allStatuses: 'كل الحالات',
    allSources: 'كل المصادر',
    allDepartments: 'كل الأقسام',
    allTypes: 'كل الأنواع',
    
    // Time ranges
    last7Days: 'آخر 7 أيام',
    last30Days: 'آخر 30 يوم',
    last90Days: 'آخر 90 يوم',
    lastYear: 'آخر سنة',
    
    // Messages
    confirmDelete: 'هل أنت متأكد من الحذف؟',
    confirmTerminate: 'هل أنت متأكد من الفصل؟',
    cartEmpty: 'العربة فارغة',
    saleCompleted: 'تم إتمام البيع بنجاح!',
    failedToLoad: 'فشل تحميل البيانات',
    failedToSave: 'فشل الحفظ. يرجى المحاولة مرة أخرى.',
    processing: 'جاري المعالجة...',
    saving: 'جاري الحفظ...',
  },
};

export const useTranslation = (language: string = 'en'): Translation => {
  return translations[language] || translations.en;
};

export const supportedLanguages = [
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'ar', name: 'العربية', dir: 'rtl' },
];

export const getLanguageDirection = (language: string): 'ltr' | 'rtl' => {
  const lang = supportedLanguages.find(l => l.code === language);
  return lang?.dir || 'ltr';
};
