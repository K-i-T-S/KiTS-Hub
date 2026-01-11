import { BaseService } from './base-service';
import { supabase } from '../../lib/supabase';
import { Sale, SaleItem, Payment, PaymentMethod, PaymentStatus, SaleStatus } from '../../types';

export class PosService extends BaseService {
  constructor() {
    super('sales');
  }

  // Sale Management
  async getSales(
    page: number = 1,
    perPage: number = 20,
    filters?: {
      status?: SaleStatus;
      payment_method?: PaymentMethod;
      payment_status?: PaymentStatus;
      date_from?: string;
      date_to?: string;
      search?: string;
    }
  ) {
    const queryFilters: Record<string, any> = {};
    
    if (filters) {
      if (filters.status) queryFilters.status = filters.status;
      if (filters.payment_method) queryFilters.payment_method = filters.payment_method;
      if (filters.payment_status) queryFilters.payment_status = filters.payment_status;
      if (filters.date_from) queryFilters.date_from = filters.date_from;
      if (filters.date_to) queryFilters.date_to = filters.date_to;
      if (filters.search) {
        return this.search(filters.search, ['sale_number', 'notes'], page, perPage);
      }
    }

    return this.getAll<Sale>(page, perPage, queryFilters);
  }

  async getSaleById(id: string): Promise<Sale | null> {
    return this.getById<Sale>(id);
  }

  async createSale(saleData: Partial<Sale>): Promise<Sale> {
    // Generate sale number
    if (!saleData.sale_number) {
      saleData.sale_number = await this.generateSaleNumber();
    }

    // Set default status
    if (!saleData.status) {
      saleData.status = 'pending';
    }

    const sale = await this.create<Sale>(saleData);

    // Create sale items if provided
    if (saleData.items) {
      await this.createSaleItems(sale.id!, saleData.items);
    }

    return sale;
  }

  async updateSale(id: string, saleData: Partial<Sale>): Promise<Sale> {
    return this.update<Sale>(id, saleData);
  }

  async completeSale(id: string, paymentData: {
    method: PaymentMethod;
    amount: number;
    reference?: string;
  }): Promise<Sale> {
    // Update sale status
    const sale = await this.updateSale(id, {
      status: 'completed',
      payment_method: paymentData.method,
      payment_status: 'completed',
      total_amount: paymentData.amount,
    });

    // Create payment record
    await this.createPayment({
      sale_id: id,
      amount: paymentData.amount,
      method: paymentData.method,
      status: 'completed',
      transaction_id: paymentData.reference,
    });

    // Update inventory (reduce stock)
    await this.updateInventoryForSale(id);

    return sale;
  }

  async refundSale(id: string, reason: string): Promise<Sale> {
    const sale = await this.updateSale(id, {
      status: 'refunded',
      payment_status: 'refunded',
    });

    // Create refund payment record
    await this.createPayment({
      sale_id: id,
      amount: -sale.total_amount, // Negative for refund
      method: sale.payment_method,
      status: 'refunded',
    });

    // Restore inventory (add back stock)
    await this.restoreInventoryForSale(id);

    return sale;
  }

  // Sale Items Management
  async getSaleItems(saleId: string): Promise<SaleItem[]> {
    const { data, error } = await supabase
      .from('sale_items')
      .select('*')
      .eq('sale_id', saleId);

    if (error) {
      throw new Error(`Failed to fetch sale items: ${error.message}`);
    }

    return data || [];
  }

  async createSaleItems(saleId: string, items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
    discount_amount?: number;
  }>): Promise<void> {
    const saleItems = items.map(item => ({
      sale_id: saleId,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_amount: item.discount_amount || 0,
      total_price: (item.unit_price * item.quantity) - (item.discount_amount || 0),
      cost_price: 0, // Would be fetched from products table
      profit: (item.unit_price * item.quantity) - (item.discount_amount || 0),
    }));

    const { error } = await supabase
      .from('sale_items')
      .insert(saleItems);

    if (error) {
      throw new Error(`Failed to create sale items: ${error.message}`);
    }
  }

  // Payment Management
  async getPayments(
    page: number = 1,
    perPage: number = 20,
    filters?: {
      method?: PaymentMethod;
      status?: PaymentStatus;
      date_from?: string;
      date_to?: string;
    }
  ) {
    const queryFilters: Record<string, any> = {};
    
    if (filters) {
      if (filters.method) queryFilters.method = filters.method;
      if (filters.status) queryFilters.status = filters.status;
      if (filters.date_from) queryFilters.date_from = filters.date_from;
      if (filters.date_to) queryFilters.date_to = filters.date_to;
    }

    return this.getAll<Payment>(page, perPage, queryFilters, 'payments');
  }

  async createPayment(paymentData: Partial<Payment>): Promise<Payment> {
    return this.create<Payment>(paymentData);
  }

  // Reports and Analytics
  async getSalesSummary(
    dateFrom?: string,
    dateTo?: string,
    locationId?: string
  ): Promise<{
    totalSales: number;
    totalTransactions: number;
    averageSaleValue: number;
    paymentMethodBreakdown: Record<PaymentMethod, number>;
    topProducts: Array<{
      product_id: string;
      name: string;
      quantity: number;
      revenue: number;
    }>;
  }> {
    let query = supabase
      .from('sales')
      .select('total_amount, payment_method');

    if (dateFrom) query = query.gte('date', dateFrom);
    if (dateTo) query = query.lte('date', dateTo);
    if (locationId) query = query.eq('location_id', locationId);

    const { data: sales, error } = await query;

    if (error) {
      throw new Error(`Failed to generate sales summary: ${error.message}`);
    }

    const totalSales = sales?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;
    const totalTransactions = sales?.length || 0;
    const averageSaleValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;

    const paymentMethodBreakdown = sales?.reduce((breakdown, sale) => {
      breakdown[sale.payment_method] = (breakdown[sale.payment_method] || 0) + sale.total_amount;
      return breakdown;
    }, {} as Record<PaymentMethod, number>);

    // Get top products (would need to join with sale_items)
    const topProducts: any[] = []; // Placeholder implementation

    return {
      totalSales,
      totalTransactions,
      averageSaleValue,
      paymentMethodBreakdown,
      topProducts,
    };
  }

  async getDailySales(
    date: string,
    locationId?: string
  ): Promise<Array<{ hour: number; sales: number; revenue: number }>> {
    // This would typically query a view or use date functions
    // For now, return hourly breakdown
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      sales: Math.floor(Math.random() * 20), // Mock data
      revenue: Math.floor(Math.random() * 1000), // Mock data
    }));

    return hours;
  }

  // Utility Methods
  private async generateSaleNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(4, '0');
    
    return `SALE-${year}${month}${day}-${random}`;
  }

  private async updateInventoryForSale(saleId: string): Promise<void> {
    const saleItems = await this.getSaleItems(saleId);
    
    for (const item of saleItems) {
      // Update product stock (reduce quantity)
      await supabase.rpc('update_product_stock', {
        p_product_id: item.product_id,
        p_quantity_change: -item.quantity,
      });
    }
  }

  private async restoreInventoryForSale(saleId: string): Promise<void> {
    const saleItems = await this.getSaleItems(saleId);
    
    for (const item of saleItems) {
      // Restore product stock (add back quantity)
      await supabase.rpc('update_product_stock', {
        p_product_id: item.product_id,
        p_quantity_change: item.quantity,
      });
    }
  }

  async generateReceipt(saleId: string): Promise<string> {
    const sale = await this.getSaleById(saleId);
    if (!sale) {
      throw new Error('Sale not found');
    }

    const saleItems = await this.getSaleItems(saleId);
    
    let receipt = `
========================================
           KITS HUB - RECEIPT
========================================

Sale Number: ${sale.sale_number}
Date: ${new Date(sale.created_at).toLocaleDateString()}
Time: ${new Date(sale.created_at).toLocaleTimeString()}

----------------------------------------
ITEMS PURCHASED
----------------------------------------
`;

    let total = 0;
    for (const item of saleItems) {
      const itemTotal = item.total_price;
      total += itemTotal;
      
      receipt += `
${item.quantity}x ${item.unit_price}    ${itemTotal.toFixed(2)}
`;
    }

    receipt += `
----------------------------------------
SUBTOTAL: ${total.toFixed(2)}
TAX: ${sale.tax_amount.toFixed(2)}
TOTAL: ${sale.total_amount.toFixed(2)}

Payment Method: ${sale.payment_method}
Status: ${sale.status}
========================================
    `;

    return receipt;
  }

  async exportSalesToCSV(
    dateFrom?: string,
    dateTo?: string,
    locationId?: string
  ): Promise<string> {
    const sales = await this.getSales(1, 10000, {
      date_from: dateFrom,
      date_to: dateTo,
    });

    const headers = ['Sale Number', 'Date', 'Items', 'Subtotal', 'Tax', 'Total', 'Payment Method', 'Status'];
    const csvContent = [
      headers.join(','),
      ...sales.data.map(sale => [
        sale.sale_number,
        sale.created_at,
        sale.items?.length || 0,
        sale.subtotal?.toFixed(2) || '0',
        sale.tax_amount?.toFixed(2) || '0',
        sale.total_amount?.toFixed(2) || '0',
        sale.payment_method,
        sale.status,
      ].join(','))
    ].join('\n');

    return csvContent;
  }
}
