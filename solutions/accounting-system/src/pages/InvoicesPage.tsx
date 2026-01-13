import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Eye, Download, Send } from 'lucide-react';
import { Invoice, CreateInvoiceForm } from '../types/accounting';
import AccountingServiceClass from '../services/accounting';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui-components';

const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  
  const accountingService = new AccountingServiceClass('default-tenant');

  const [formData, setFormData] = useState<CreateInvoiceForm>({
    customer_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    terms: 'Net 30',
    lines: [
      { description: '', quantity: 1, unit_price: 0, tax_rate: 0 }
    ]
  });

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [invoices, searchTerm, filterStatus]);

  const loadInvoices = async () => {
    try {
      const data = await accountingService.getInvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    let filtered = invoices;

    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.customer_name && invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === filterStatus);
    }

    setFilteredInvoices(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await accountingService.createInvoice(formData);
      setIsCreateDialogOpen(false);
      resetForm();
      loadInvoices();
    } catch (error) {
      console.error('Error saving invoice:', error);
    }
  };

  const handleDelete = async (invoiceId: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      try {
        await accountingService.deleteInvoice(invoiceId);
        loadInvoices();
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      customer_id: '',
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '',
      terms: 'Net 30',
      lines: [
        { description: '', quantity: 1, unit_price: 0, tax_rate: 0 }
      ]
    });
  };

  const addInvoiceLine = () => {
    setFormData({
      ...formData,
      lines: [...formData.lines, { description: '', quantity: 1, unit_price: 0, tax_rate: 0 }]
    });
  };

  const removeInvoiceLine = (index: number) => {
    if (formData.lines.length > 1) {
      setFormData({
        ...formData,
        lines: formData.lines.filter((_, i) => i !== index)
      });
    }
  };

  const updateInvoiceLine = (index: number, field: string, value: any) => {
    const updatedLines = [...formData.lines];
    updatedLines[index] = { ...updatedLines[index], [field]: value };
    setFormData({ ...formData, lines: updatedLines });
  };

  const calculateSubtotal = () => {
    return formData.lines.reduce((sum, line) => sum + (line.quantity * line.unit_price), 0);
  };

  const calculateTax = () => {
    return formData.lines.reduce((sum, line) => {
      const lineTotal = line.quantity * line.unit_price;
      return sum + (lineTotal * (line.tax_rate / 100));
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      voided: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const sendInvoice = async (invoice: Invoice) => {
    try {
      // Here you would implement email sending functionality
      alert(`Invoice ${invoice.invoice_number} would be sent to ${invoice.customer_name}`);
    } catch (error) {
      console.error('Error sending invoice:', error);
    }
  };

  const downloadInvoice = async (invoice: Invoice) => {
    try {
      // Here you would implement PDF generation and download
      alert(`Invoice ${invoice.invoice_number} would be downloaded as PDF`);
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading invoices...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="customer_id" className="block text-sm font-medium mb-1">Customer</label>
                  <input
                    id="customer_id"
                    type="text"
                    value={formData.customer_id}
                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    placeholder="Customer ID"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="invoice_date" className="block text-sm font-medium mb-1">Invoice Date</label>
                  <input
                    id="invoice_date"
                    type="date"
                    value={formData.invoice_date}
                    onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="due_date" className="block text-sm font-medium mb-1">Due Date</label>
                  <input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="terms" className="block text-sm font-medium mb-1">Terms</label>
                  <input
                    id="terms"
                    type="text"
                    value={formData.terms}
                    onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Invoice Lines</label>
                  <Button type="button" variant="outline" size="sm" onClick={addInvoiceLine}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Line
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.lines.map((line, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-6">
                        <input
                          type="text"
                          placeholder="Description"
                          value={line.description}
                          onChange={(e) => updateInvoiceLine(index, 'description', e.target.value)}
                          className="w-full p-2 border rounded-md text-sm"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Quantity"
                          value={line.quantity}
                          onChange={(e) => updateInvoiceLine(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full p-2 border rounded-md text-sm"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Unit Price"
                          value={line.unit_price}
                          onChange={(e) => updateInvoiceLine(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="w-full p-2 border rounded-md text-sm"
                          required
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Tax %"
                          value={line.tax_rate}
                          onChange={(e) => updateInvoiceLine(index, 'tax_rate', parseFloat(e.target.value) || 0)}
                          className="w-full p-2 border rounded-md text-sm"
                        />
                      </div>
                      <div className="col-span-1">
                        {formData.lines.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeInvoiceLine(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2 text-right">
                  <div className="flex justify-between">
                    <span className="font-medium">Subtotal:</span>
                    <span className="font-mono">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateSubtotal())}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Tax:</span>
                    <span className="font-mono">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateTax())}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="font-mono">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateTotal())}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create Invoice
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 p-2 border rounded-md"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="voided">Voided</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoices ({filteredInvoices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Invoice Number</th>
                  <th className="text-left p-2">Customer</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Due Date</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-right p-2">Total Amount</th>
                  <th className="text-right p-2">Balance Due</th>
                  <th className="text-center p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-mono text-sm">{invoice.invoice_number}</td>
                    <td className="p-2">{invoice.customer_name}</td>
                    <td className="p-2 text-sm">{new Date(invoice.invoice_date).toLocaleDateString()}</td>
                    <td className="p-2 text-sm">{new Date(invoice.due_date).toLocaleDateString()}</td>
                    <td className="p-2">
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </td>
                    <td className="p-2 text-right font-mono">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: invoice.currency
                      }).format(invoice.total_amount)}
                    </td>
                    <td className="p-2 text-right font-mono">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: invoice.currency
                      }).format(invoice.balance_due)}
                    </td>
                    <td className="p-2">
                      <div className="flex justify-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewingInvoice(invoice)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {invoice.status === 'sent' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => sendInvoice(invoice)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadInvoice(invoice)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(invoice.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredInvoices.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No invoices found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Invoice Dialog */}
      <Dialog open={!!viewingInvoice} onOpenChange={() => setViewingInvoice(null)}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {viewingInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Invoice Number</label>
                  <p className="font-mono">{viewingInvoice.invoice_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium">Customer</label>
                  <p>{viewingInvoice.customer_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium">Invoice Date</label>
                  <p>{new Date(viewingInvoice.invoice_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium">Due Date</label>
                  <p>{new Date(viewingInvoice.due_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium">Status</label>
                  <Badge className={getStatusColor(viewingInvoice.status)}>
                    {viewingInvoice.status}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium">Terms</label>
                  <p>{viewingInvoice.terms}</p>
                </div>
              </div>

              {viewingInvoice.lines && viewingInvoice.lines.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Invoice Lines</label>
                  <div className="border rounded-md">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left p-2">Description</th>
                          <th className="text-right p-2">Quantity</th>
                          <th className="text-right p-2">Unit Price</th>
                          <th className="text-right p-2">Tax</th>
                          <th className="text-right p-2">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewingInvoice.lines.map((line, index) => (
                          <tr key={line.id} className="border-b">
                            <td className="p-2">{line.description}</td>
                            <td className="p-2 text-right">{line.quantity}</td>
                            <td className="p-2 text-right font-mono">
                              {new Intl.NumberFormat('en-US', { style: 'currency', currency: viewingInvoice.currency }).format(line.unit_price)}
                            </td>
                            <td className="p-2 text-right font-mono">
                              {new Intl.NumberFormat('en-US', { style: 'currency', currency: viewingInvoice.currency }).format(line.tax_amount)}
                            </td>
                            <td className="p-2 text-right font-mono">
                              {new Intl.NumberFormat('en-US', { style: 'currency', currency: viewingInvoice.currency }).format(line.total_price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="space-y-2 text-right">
                  <div className="flex justify-between">
                    <span className="font-medium">Subtotal:</span>
                    <span className="font-mono">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: viewingInvoice.currency }).format(viewingInvoice.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Tax:</span>
                    <span className="font-mono">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: viewingInvoice.currency }).format(viewingInvoice.tax_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="font-mono">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: viewingInvoice.currency }).format(viewingInvoice.total_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Paid:</span>
                    <span className="font-mono">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: viewingInvoice.currency }).format(viewingInvoice.paid_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Balance Due:</span>
                    <span className="font-mono">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: viewingInvoice.currency }).format(viewingInvoice.balance_due)}
                    </span>
                  </div>
                </div>
              </div>

              {viewingInvoice.notes && (
                <div>
                  <label className="block text-sm font-medium">Notes</label>
                  <p>{viewingInvoice.notes}</p>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                {viewingInvoice.status === 'sent' && (
                  <Button variant="outline" onClick={() => sendInvoice(viewingInvoice)}>
                    <Send className="w-4 h-4 mr-2" />
                    Send Invoice
                  </Button>
                )}
                <Button variant="outline" onClick={() => downloadInvoice(viewingInvoice)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" onClick={() => setViewingInvoice(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoicesPage;
