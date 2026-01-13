import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { Account, CreateAccountForm } from '../types/accounting';
import AccountingServiceClass from '../services/accounting';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui-components';

const AccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  
  const accountingService = new AccountingServiceClass('default-tenant');

  const [formData, setFormData] = useState<CreateAccountForm>({
    account_number: '',
    account_name: '',
    account_type: 'asset',
    account_subtype: '',
    description: '',
    opening_balance: 0,
    currency: 'USD'
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    filterAccounts();
  }, [accounts, searchTerm, filterType]);

  const loadAccounts = async () => {
    try {
      const data = await accountingService.getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAccounts = () => {
    let filtered = accounts;

    if (searchTerm) {
      filtered = filtered.filter(account =>
        account.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.account_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(account => account.account_type === filterType);
    }

    setFilteredAccounts(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAccount) {
        await accountingService.updateAccount(editingAccount.id, formData);
      } else {
        await accountingService.createAccount(formData);
      }
      
      setIsCreateDialogOpen(false);
      setEditingAccount(null);
      resetForm();
      loadAccounts();
    } catch (error) {
      console.error('Error saving account:', error);
    }
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      account_number: account.account_number,
      account_name: account.account_name,
      account_type: account.account_type,
      account_subtype: account.account_subtype,
      description: account.description || '',
      opening_balance: account.opening_balance,
      currency: account.currency
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (accountId: string) => {
    if (confirm('Are you sure you want to delete this account?')) {
      try {
        await accountingService.deleteAccount(accountId);
        loadAccounts();
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      account_number: '',
      account_name: '',
      account_type: 'asset',
      account_subtype: '',
      description: '',
      opening_balance: 0,
      currency: 'USD'
    });
  };

  const getAccountTypeColor = (type: string) => {
    const colors = {
      asset: 'bg-green-100 text-green-800',
      liability: 'bg-red-100 text-red-800',
      equity: 'bg-blue-100 text-blue-800',
      revenue: 'bg-purple-100 text-purple-800',
      expense: 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading accounts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Chart of Accounts</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingAccount(null); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? 'Edit Account' : 'Create New Account'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="account_number" className="block text-sm font-medium mb-1">Account Number</label>
                  <input
                    id="account_number"
                    type="text"
                    value={formData.account_number}
                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="account_name" className="block text-sm font-medium mb-1">Account Name</label>
                  <input
                    id="account_name"
                    type="text"
                    value={formData.account_name}
                    onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="account_type" className="block text-sm font-medium mb-1">Account Type</label>
                  <Select
                    value={formData.account_type}
                    onValueChange={(value: any) => setFormData({ ...formData, account_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asset">Asset</SelectItem>
                      <SelectItem value="liability">Liability</SelectItem>
                      <SelectItem value="equity">Equity</SelectItem>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="account_subtype" className="block text-sm font-medium mb-1">Subtype</label>
                  <input
                    id="account_subtype"
                    type="text"
                    value={formData.account_subtype}
                    onChange={(e) => setFormData({ ...formData, account_subtype: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="opening_balance" className="block text-sm font-medium mb-1">Opening Balance</label>
                  <input
                    id="opening_balance"
                    type="number"
                    step="0.01"
                    value={formData.opening_balance}
                    onChange={(e) => setFormData({ ...formData, opening_balance: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="currency" className="block text-sm font-medium mb-1">Currency</label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAccount ? 'Update' : 'Create'} Account
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
            placeholder="Search accounts..."
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
            <SelectItem value="asset">Assets</SelectItem>
            <SelectItem value="liability">Liabilities</SelectItem>
            <SelectItem value="equity">Equity</SelectItem>
            <SelectItem value="revenue">Revenue</SelectItem>
            <SelectItem value="expense">Expenses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accounts ({filteredAccounts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Account Number</th>
                  <th className="text-left p-2">Account Name</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Subtype</th>
                  <th className="text-right p-2">Current Balance</th>
                  <th className="text-center p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account) => (
                  <tr key={account.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-mono text-sm">{account.account_number}</td>
                    <td className="p-2 font-medium">{account.account_name}</td>
                    <td className="p-2">
                      <Badge className={getAccountTypeColor(account.account_type)}>
                        {account.account_type}
                      </Badge>
                    </td>
                    <td className="p-2 text-sm text-gray-600">{account.account_subtype}</td>
                    <td className="p-2 text-right font-mono">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: account.currency
                      }).format(account.current_balance)}
                    </td>
                    <td className="p-2">
                      <div className="flex justify-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(account)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(account.id)}
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
            
            {filteredAccounts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No accounts found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountsPage;
