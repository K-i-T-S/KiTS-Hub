import { supabase } from '@/lib/supabase';
import { 
  Account,
  Transaction,
  TransactionLine,
  Contact,
  Invoice,
  InvoiceLine,
  Payment,
  AccountingStats,
  AccountingFilters,
  CreateAccountForm,
  CreateTransactionForm,
  CreateInvoiceForm,
  CreatePaymentForm,
  AccountingIntegrationAPI,
  AccountingSettings
} from '@/types/accounting';

class AccountingService implements AccountingIntegrationAPI {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  async getAccounts(): Promise<Account[]> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .eq('is_active', true)
      .order('account_number');

    if (error) throw error;
    return data || [];
  }

  async createAccount(account: CreateAccountForm): Promise<Account> {
    const { data, error } = await supabase
      .from('accounts')
      .insert({
        ...account,
        tenant_id: this.tenantId,
        current_balance: account.opening_balance,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getTransactions(filters?: AccountingFilters): Promise<Transaction[]> {
    let query = supabase
      .from('transactions')
      .select(`
        *,
        lines:transaction_lines(*),
        contacts:transaction_contacts(*)
      `)
      .eq('tenant_id', this.tenantId);

    if (filters?.account_type) {
      query = query.eq('lines.account_type', filters.account_type);
    }

    if (filters?.date_range) {
      query = query
        .gte('transaction_date', filters.date_range.start)
        .lte('transaction_date', filters.date_range.end);
    }

    if (filters?.transaction_type) {
      query = query.eq('transaction_type', filters.transaction_type);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      query = query.or(`transaction_number.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('transaction_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createTransaction(transaction: CreateTransactionForm): Promise<Transaction> {
    const transactionNumber = await this.generateTransactionNumber();

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        ...transaction,
        tenant_id: this.tenantId,
        transaction_number: transactionNumber,
        status: 'posted',
        total_amount: transaction.lines.reduce((sum, line) => sum + line.debit_amount + line.credit_amount, 0)
      })
      .select()
      .single();

    if (error) throw error;

    // Create transaction lines
    const { error: linesError } = await supabase
      .from('transaction_lines')
      .insert(
        transaction.lines.map(line => ({
          ...line,
          transaction_id: data.id
        }))
      );

    if (linesError) throw linesError;

    return data;
  }

  async getContacts(): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async getInvoices(filters?: AccountingFilters): Promise<Invoice[]> {
    let query = supabase
      .from('invoices')
      .select(`
        *,
        customer:contacts(name),
        lines:invoice_lines(*),
        payments:invoice_payments(*)
      `)
      .eq('tenant_id', this.tenantId);

    if (filters?.date_range) {
      query = query
        .gte('invoice_date', filters.date_range.start)
        .lte('invoice_date', filters.date_range.end);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('invoice_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createInvoice(invoice: CreateInvoiceForm): Promise<Invoice> {
    const invoiceNumber = await this.generateInvoiceNumber();

    let subtotal = 0;
    let taxAmount = 0;

    const invoiceLines = invoice.lines.map(line => {
      const lineTotal = line.quantity * line.unit_price;
      const lineTax = lineTotal * (line.tax_rate / 100);
      subtotal += lineTotal;
      taxAmount += lineTax;

      return {
        ...line,
        total_price: lineTotal,
        tax_amount: lineTax
      };
    });

    const totalAmount = subtotal + taxAmount;

    const { data, error } = await supabase
      .from('invoices')
      .insert({
        ...invoice,
        tenant_id: this.tenantId,
        invoice_number: invoiceNumber,
        status: 'sent',
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        paid_amount: 0,
        balance_due: totalAmount
      })
      .select()
      .single();

    if (error) throw error;

    // Create invoice lines
    const { error: linesError } = await supabase
      .from('invoice_lines')
      .insert(
        invoiceLines.map(line => ({
          ...line,
          invoice_id: data.id
        }))
      );

    if (linesError) throw linesError;

    return data;
  }

  async getPayments(filters?: AccountingFilters): Promise<Payment[]> {
    let query = supabase
      .from('payments')
      .select('*')
      .eq('tenant_id', this.tenantId);

    if (filters?.date_range) {
      query = query
        .gte('payment_date', filters.date_range.start)
        .lte('payment_date', filters.date_range.end);
    }

    const { data, error } = await query.order('payment_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createPayment(payment: CreatePaymentForm): Promise<Payment> {
    const paymentNumber = await this.generatePaymentNumber();

    const { data, error } = await supabase
      .from('payments')
      .insert({
        ...payment,
        tenant_id: this.tenantId,
        payment_number: paymentNumber,
        status: 'completed'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getAccountingStats(dateRange?: { start: string; end: string }): Promise<AccountingStats> {
    const { data, error } = await supabase.rpc('get_accounting_stats', {
      p_tenant_id: this.tenantId,
      p_start_date: dateRange?.start,
      p_end_date: dateRange?.end
    });

    if (error) throw error;
    
    return data[0] || {
      total_accounts: 0,
      total_transactions: 0,
      total_contacts: 0,
      outstanding_invoices: 0,
      overdue_invoices: 0,
      total_revenue: 0,
      total_expenses: 0,
      net_income: 0,
      cash_balance: 0,
      accounts_receivable: 0,
      accounts_payable: 0,
      recent_transactions: [],
      overdue_invoices_list: []
    };
  }

  private async generateTransactionNumber(): Promise<string> {
    const { data, error } = await supabase
      .from('transaction_numbers')
      .select('next_number')
      .single();

    if (error || !data) {
      await supabase
        .from('transaction_numbers')
        .insert({ next_number: 2 });
      return 'TXN000001';
    }

    const transactionNumber = `TXN${String(data.next_number).padStart(6, '0')}`;
    
    await supabase
      .from('transaction_numbers')
      .update({ next_number: data.next_number + 1 });

    return transactionNumber;
  }

  private async generateInvoiceNumber(): Promise<string> {
    const { data, error } = await supabase
      .from('invoice_numbers')
      .select('next_number')
      .single();

    if (error || !data) {
      await supabase
        .from('invoice_numbers')
        .insert({ next_number: 2 });
      return 'INV000001';
    }

    const invoiceNumber = `INV${String(data.next_number).padStart(6, '0')}`;
    
    await supabase
      .from('invoice_numbers')
      .update({ next_number: data.next_number + 1 });

    return invoiceNumber;
  }

  private async generatePaymentNumber(): Promise<string> {
    const { data, error } = await supabase
      .from('payment_numbers')
      .select('next_number')
      .single();

    if (error || !data) {
      await supabase
        .from('payment_numbers')
        .insert({ next_number: 2 });
      return 'PAY000001';
    }

    const paymentNumber = `PAY${String(data.next_number).padStart(6, '0')}`;
    
    await supabase
      .from('payment_numbers')
      .update({ next_number: data.next_number + 1 });

    return paymentNumber;
  }
}

export default AccountingService;
