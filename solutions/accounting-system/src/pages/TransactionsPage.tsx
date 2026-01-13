import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Eye } from 'lucide-react';
import { Transaction, CreateTransactionForm, AccountingFilters } from '../types/accounting';
import AccountingServiceClass from '../services/accounting';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui-components';

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);
  
  const accountingService = new AccountingServiceClass('default-tenant');

  const [formData, setFormData] = useState<CreateTransactionForm>({
    transaction_date: new Date().toISOString().split('T')[0],
    reference: '',
    description: '',
    transaction_type: 'journal',
    lines: [
      { account_id: '', debit_amount: 0, credit_amount: 0, description: '' },
      { account_id: '', debit_amount: 0, credit_amount: 0, description: '' }
    ],
    notes: ''
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, filterType, filterStatus]);

  const loadTransactions = async () => {
    try {
      const data = await accountingService.getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.transaction_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.reference && transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(transaction => transaction.transaction_type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === filterStatus);
    }

    setFilteredTransactions(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await accountingService.createTransaction(formData);
      setIsCreateDialogOpen(false);
      resetForm();
      loadTransactions();
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const handleDelete = async (transactionId: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      try {
        await accountingService.deleteTransaction(transactionId);
        loadTransactions();
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      transaction_date: new Date().toISOString().split('T')[0],
      reference: '',
      description: '',
      transaction_type: 'journal',
      lines: [
        { account_id: '', debit_amount: 0, credit_amount: 0, description: '' },
        { account_id: '', debit_amount: 0, credit_amount: 0, description: '' }
      ],
      notes: ''
    });
  };

  const addTransactionLine = () => {
    setFormData({
      ...formData,
      lines: [...formData.lines, { account_id: '', debit_amount: 0, credit_amount: 0, description: '' }]
    });
  };

  const removeTransactionLine = (index: number) => {
    if (formData.lines.length > 2) {
      setFormData({
        ...formData,
        lines: formData.lines.filter((_, i) => i !== index)
      });
    }
  };

  const updateTransactionLine = (index: number, field: string, value: any) => {
    const updatedLines = [...formData.lines];
    updatedLines[index] = { ...updatedLines[index], [field]: value };
    setFormData({ ...formData, lines: updatedLines });
  };

  const getTransactionTypeColor = (type: string) => {
    const colors = {
      invoice: 'bg-blue-100 text-blue-800',
      payment: 'bg-green-100 text-green-800',
      expense: 'bg-red-100 text-red-800',
      journal: 'bg-gray-100 text-gray-800',
      adjustment: 'bg-yellow-100 text-yellow-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      posted: 'bg-green-100 text-green-800',
      voided: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading transactions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Transaction</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="transaction_date" className="block text-sm font-medium mb-1">Date</label>
                  <input
                    id="transaction_date"
                    type="date"
                    value={formData.transaction_date}
                    onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="transaction_type" className="block text-sm font-medium mb-1">Type</label>
                  <Select
                    value={formData.transaction_type}
                    onValueChange={(value: any) => setFormData({ ...formData, transaction_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="invoice">Invoice</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="journal">Journal Entry</SelectItem>
                      <SelectItem value="adjustment">Adjustment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="reference" className="block text-sm font-medium mb-1">Reference</label>
                  <input
                    id="reference"
                    type="text"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
                <input
                  id="description"
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Transaction Lines</label>
                  <Button type="button" variant="outline" size="sm" onClick={addTransactionLine}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Line
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.lines.map((line, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-4">
                        <input
                          type="text"
                          placeholder="Account ID"
                          value={line.account_id}
                          onChange={(e) => updateTransactionLine(index, 'account_id', e.target.value)}
                          className="w-full p-2 border rounded-md text-sm"
                          required
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Debit"
                          value={line.debit_amount}
                          onChange={(e) => updateTransactionLine(index, 'debit_amount', parseFloat(e.target.value) || 0)}
                          className="w-full p-2 border rounded-md text-sm"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Credit"
                          value={line.credit_amount}
                          onChange={(e) => updateTransactionLine(index, 'credit_amount', parseFloat(e.target.value) || 0)}
                          className="w-full p-2 border rounded-md text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="Description"
                          value={line.description}
                          onChange={(e) => updateTransactionLine(index, 'description', e.target.value)}
                          className="w-full p-2 border rounded-md text-sm"
                        />
                      </div>
                      <div className="col-span-12">
                        {formData.lines.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTransactionLine(index)}
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
                  Create Transaction
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
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 p-2 border rounded-md"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="invoice">Invoices</SelectItem>
            <SelectItem value="payment">Payments</SelectItem>
            <SelectItem value="expense">Expenses</SelectItem>
            <SelectItem value="journal">Journal Entries</SelectItem>
            <SelectItem value="adjustment">Adjustments</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="posted">Posted</SelectItem>
            <SelectItem value="voided">Voided</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions ({filteredTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Number</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Description</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-right p-2">Total Amount</th>
                  <th className="text-center p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-mono text-sm">{transaction.transaction_number}</td>
                    <td className="p-2 text-sm">{new Date(transaction.transaction_date).toLocaleDateString()}</td>
                    <td className="p-2">{transaction.description}</td>
                    <td className="p-2">
                      <Badge className={getTransactionTypeColor(transaction.transaction_type)}>
                        {transaction.transaction_type}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </td>
                    <td className="p-2 text-right font-mono">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: transaction.currency
                      }).format(transaction.total_amount)}
                    </td>
                    <td className="p-2">
                      <div className="flex justify-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewingTransaction(transaction)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(transaction.id)}
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
            
            {filteredTransactions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No transactions found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Transaction Dialog */}
      <Dialog open={!!viewingTransaction} onOpenChange={() => setViewingTransaction(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {viewingTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Transaction Number</label>
                  <p className="font-mono">{viewingTransaction.transaction_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium">Date</label>
                  <p>{new Date(viewingTransaction.transaction_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium">Type</label>
                  <Badge className={getTransactionTypeColor(viewingTransaction.transaction_type)}>
                    {viewingTransaction.transaction_type}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium">Status</label>
                  <Badge className={getStatusColor(viewingTransaction.status)}>
                    {viewingTransaction.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium">Description</label>
                <p>{viewingTransaction.description}</p>
              </div>

              {viewingTransaction.reference && (
                <div>
                  <label className="block text-sm font-medium">Reference</label>
                  <p>{viewingTransaction.reference}</p>
                </div>
              )}

              {viewingTransaction.lines && viewingTransaction.lines.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Transaction Lines</label>
                  <div className="border rounded-md">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left p-2">Account</th>
                          <th className="text-right p-2">Debit</th>
                          <th className="text-right p-2">Credit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewingTransaction.lines.map((line, index) => (
                          <tr key={line.id} className="border-b">
                            <td className="p-2">{line.account_name}</td>
                            <td className="p-2 text-right font-mono">
                              {line.debit_amount > 0 ? 
                                new Intl.NumberFormat('en-US', { style: 'currency', currency: viewingTransaction.currency }).format(line.debit_amount) : 
                                '-'
                              }
                            </td>
                            <td className="p-2 text-right font-mono">
                              {line.credit_amount > 0 ? 
                                new Intl.NumberFormat('en-US', { style: 'currency', currency: viewingTransaction.currency }).format(line.credit_amount) : 
                                '-'
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {viewingTransaction.notes && (
                <div>
                  <label className="block text-sm font-medium">Notes</label>
                  <p>{viewingTransaction.notes}</p>
                </div>
              )}

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setViewingTransaction(null)}>
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

export default TransactionsPage;
