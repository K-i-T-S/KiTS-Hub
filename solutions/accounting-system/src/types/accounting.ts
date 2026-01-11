// KiTS Accounting System Types
// Standalone SaaS solution with integration capabilities

export interface Account {
  id: string;
  tenant_id: string;
  account_number: string;
  account_name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  account_subtype: string;
  parent_id?: string;
  description?: string;
  opening_balance: number;
  current_balance: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  parent_name?: string;
  children?: Account[];
}

export interface Transaction {
  id: string;
  tenant_id: string;
  transaction_number: string;
  transaction_date: string;
  reference?: string;
  description: string;
  transaction_type: 'invoice' | 'payment' | 'expense' | 'journal' | 'adjustment';
  status: 'draft' | 'posted' | 'voided';
  total_amount: number;
  currency: string;
  exchange_rate?: number;
  attachments?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  lines?: TransactionLine[];
  contacts?: Contact[];
}

export interface TransactionLine {
  id: string;
  transaction_id: string;
  account_id: string;
  account_name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  debit_amount: number;
  credit_amount: number;
  description?: string;
  created_at: string;
}

export interface Contact {
  id: string;
  tenant_id: string;
  contact_type: 'customer' | 'vendor' | 'employee';
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  tax_id?: string;
  payment_terms?: string;
  opening_balance: number;
  current_balance: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  tenant_id: string;
  invoice_number: string;
  customer_id: string;
  invoice_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'voided';
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  balance_due: number;
  currency: string;
  notes?: string;
  terms?: string;
  attachments?: string[];
  created_at: string;
  updated_at: string;
  // Joined fields
  customer_name?: string;
  lines?: InvoiceLine[];
  payments?: Payment[];
}

export interface InvoiceLine {
  id: string;
  invoice_id: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  tax_rate: number;
  tax_amount: number;
  created_at: string;
}

export interface Payment {
  id: string;
  tenant_id: string;
  payment_number: string;
  payment_date: string;
  contact_id: string;
  contact_type: 'customer' | 'vendor';
  payment_method: string;
  amount: number;
  currency: string;
  reference?: string;
  description?: string;
  status: 'pending' | 'completed' | 'failed';
  applied_to_invoices?: Array<{
    invoice_id: string;
    amount: number;
  }>;
  created_at: string;
  updated_at: string;
}

export interface AccountingStats {
  total_accounts: number;
  total_transactions: number;
  total_contacts: number;
  outstanding_invoices: number;
  overdue_invoices: number;
  total_revenue: number;
  total_expenses: number;
  net_income: number;
  cash_balance: number;
  accounts_receivable: number;
  accounts_payable: number;
  recent_transactions: Transaction[];
  overdue_invoices_list: Invoice[];
}

export interface AccountingFilters {
  account_type?: string;
  date_range?: {
    start: string;
    end: string;
  };
  contact_id?: string;
  transaction_type?: string;
  status?: string;
  search?: string;
}

// Form types
export interface CreateAccountForm {
  account_number: string;
  account_name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  account_subtype: string;
  parent_id?: string;
  description?: string;
  opening_balance: number;
  currency: string;
}

export interface CreateTransactionForm {
  transaction_date: string;
  reference?: string;
  description: string;
  transaction_type: 'invoice' | 'payment' | 'expense' | 'journal' | 'adjustment';
  lines: Array<{
    account_id: string;
    debit_amount: number;
    credit_amount: number;
    description?: string;
  }>;
  attachments?: string[];
  notes?: string;
}

export interface CreateInvoiceForm {
  customer_id: string;
  invoice_date: string;
  due_date: string;
  notes?: string;
  terms?: string;
  lines: Array<{
    product_id?: string;
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
  }>;
}

export interface CreatePaymentForm {
  payment_date: string;
  contact_id: string;
  contact_type: 'customer' | 'vendor';
  payment_method: string;
  amount: number;
  reference?: string;
  description?: string;
  applied_to_invoices?: Array<{
    invoice_id: string;
    amount: number;
  }>;
}

// Integration API
export interface AccountingIntegrationAPI {
  getAccounts(): Promise<Account[]>;
  createAccount(account: CreateAccountForm): Promise<Account>;
  getTransactions(filters?: AccountingFilters): Promise<Transaction[]>;
  createTransaction(transaction: CreateTransactionForm): Promise<Transaction>;
  getContacts(): Promise<Contact[]>;
  getInvoices(filters?: AccountingFilters): Promise<Invoice[]>;
  createInvoice(invoice: CreateInvoiceForm): Promise<Invoice>;
  getPayments(filters?: AccountingFilters): Promise<Payment[]>;
  createPayment(payment: CreatePaymentForm): Promise<Payment>;
  getAccountingStats(dateRange?: { start: string; end: string }): Promise<AccountingStats>;
}

export interface AccountingSettings {
  chart_of_accounts: {
    default_accounts: Array<{
      account_type: string;
      account_subtype: string;
      default_name: string;
    }>;
  };
  tax_settings: {
    default_tax_rate: number;
    tax_inclusive: boolean;
    tax_number?: string;
  };
  payment_methods: Array<{
    id: string;
    name: string;
    is_active: boolean;
  }>;
  invoice_settings: {
    prefix: string;
    next_number: number;
    default_terms: string;
    default_due_days: number;
  };
  currency_settings: {
    base_currency: string;
    enabled_currencies: string[];
    auto_update_rates: boolean;
  };
}
