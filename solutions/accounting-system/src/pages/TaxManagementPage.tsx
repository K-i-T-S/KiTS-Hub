import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Calculator } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui-components';

interface TaxRate {
  id: string;
  name: string;
  rate: number;
  description?: string;
  is_compound: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface TaxConfiguration {
  id: string;
  tax_number?: string;
  default_tax_rate: number;
  tax_inclusive: boolean;
  auto_calculate: boolean;
  filing_frequency: 'monthly' | 'quarterly' | 'annually';
  next_filing_date?: string;
}

const TaxManagementPage: React.FC = () => {
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [taxConfig, setTaxConfig] = useState<TaxConfiguration | null>(null);
  const [filteredTaxRates, setFilteredTaxRates] = useState<TaxRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [editingTaxRate, setEditingTaxRate] = useState<TaxRate | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    rate: 0,
    description: '',
    is_compound: false
  });

  const [configFormData, setConfigFormData] = useState({
    tax_number: '',
    default_tax_rate: 0,
    tax_inclusive: false,
    auto_calculate: true,
    filing_frequency: 'quarterly' as 'monthly' | 'quarterly' | 'annually'
  });

  useEffect(() => {
    loadTaxRates();
    loadTaxConfig();
  }, []);

  useEffect(() => {
    filterTaxRates();
  }, [taxRates, searchTerm, filterStatus]);

  const loadTaxRates = async () => {
    try {
      // Mock data - replace with actual API call
      const mockTaxRates: TaxRate[] = [
        {
          id: '1',
          name: 'Sales Tax',
          rate: 8.25,
          description: 'State sales tax',
          is_compound: false,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'VAT',
          rate: 20.0,
          description: 'Value Added Tax',
          is_compound: false,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];
      setTaxRates(mockTaxRates);
    } catch (error) {
      console.error('Error loading tax rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTaxConfig = async () => {
    try {
      // Mock data - replace with actual API call
      const mockConfig: TaxConfiguration = {
        id: '1',
        tax_number: '12-3456789',
        default_tax_rate: 8.25,
        tax_inclusive: false,
        auto_calculate: true,
        filing_frequency: 'quarterly',
        next_filing_date: '2024-03-31T00:00:00Z'
      };
      setTaxConfig(mockConfig);
      setConfigFormData({
        tax_number: mockConfig.tax_number || '',
        default_tax_rate: mockConfig.default_tax_rate,
        tax_inclusive: mockConfig.tax_inclusive,
        auto_calculate: mockConfig.auto_calculate,
        filing_frequency: mockConfig.filing_frequency
      });
    } catch (error) {
      console.error('Error loading tax config:', error);
    }
  };

  const filterTaxRates = () => {
    let filtered = taxRates;

    if (searchTerm) {
      filtered = filtered.filter(tax =>
        tax.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tax.description && tax.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(tax => 
        filterStatus === 'active' ? tax.is_active : !tax.is_active
      );
    }

    setFilteredTaxRates(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTaxRate) {
        // Update existing tax rate
        console.log('Updating tax rate:', { ...formData, id: editingTaxRate.id });
      } else {
        // Create new tax rate
        console.log('Creating tax rate:', formData);
      }
      
      setIsCreateDialogOpen(false);
      setEditingTaxRate(null);
      resetForm();
      loadTaxRates();
    } catch (error) {
      console.error('Error saving tax rate:', error);
    }
  };

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Updating tax config:', configFormData);
      setIsConfigDialogOpen(false);
      loadTaxConfig();
    } catch (error) {
      console.error('Error saving tax config:', error);
    }
  };

  const handleDelete = async (taxRateId: string) => {
    if (confirm('Are you sure you want to delete this tax rate?')) {
      try {
        console.log('Deleting tax rate:', taxRateId);
        loadTaxRates();
      } catch (error) {
        console.error('Error deleting tax rate:', error);
      }
    }
  };

  const handleEdit = (taxRate: TaxRate) => {
    setEditingTaxRate(taxRate);
    setFormData({
      name: taxRate.name,
      rate: taxRate.rate,
      description: taxRate.description || '',
      is_compound: taxRate.is_compound
    });
    setIsCreateDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      rate: 0,
      description: '',
      is_compound: false
    });
  };

  const calculateTaxAmount = (amount: number, rate: number, isCompound: boolean) => {
    if (isCompound) {
      return amount * (rate / 100);
    }
    return amount * (rate / 100);
  };

  const getNextFilingDate = (frequency: string) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    switch (frequency) {
      case 'monthly':
        return new Date(currentYear, currentMonth + 1, 0);
      case 'quarterly':
        const nextQuarter = Math.floor(currentMonth / 3) + 1;
        return new Date(currentYear, nextQuarter * 3, 0);
      case 'annually':
        return new Date(currentYear + 1, 0, 1);
      default:
        return new Date(currentYear, currentMonth + 1, 0);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading tax management...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Tax Management</h1>
        <div className="flex space-x-2">
          <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Calculator className="w-4 h-4 mr-2" />
                Tax Configuration
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Tax Configuration</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleConfigSubmit} className="space-y-4">
                <div>
                  <label htmlFor="tax_number" className="block text-sm font-medium mb-1">Tax ID Number</label>
                  <input
                    id="tax_number"
                    type="text"
                    value={configFormData.tax_number}
                    onChange={(e) => setConfigFormData({ ...configFormData, tax_number: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                
                <div>
                  <label htmlFor="default_tax_rate" className="block text-sm font-medium mb-1">Default Tax Rate (%)</label>
                  <input
                    id="default_tax_rate"
                    type="number"
                    step="0.01"
                    value={configFormData.default_tax_rate}
                    onChange={(e) => setConfigFormData({ ...configFormData, default_tax_rate: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="tax_inclusive" className="block text-sm font-medium mb-1">Tax Inclusive Pricing</label>
                    <Select
                      value={configFormData.tax_inclusive.toString()}
                      onValueChange={(value) => setConfigFormData({ ...configFormData, tax_inclusive: value === 'true' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">No</SelectItem>
                        <SelectItem value="true">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label htmlFor="auto_calculate" className="block text-sm font-medium mb-1">Auto Calculate Tax</label>
                    <Select
                      value={configFormData.auto_calculate.toString()}
                      onValueChange={(value) => setConfigFormData({ ...configFormData, auto_calculate: value === 'true' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">Manual</SelectItem>
                        <SelectItem value="true">Automatic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label htmlFor="filing_frequency" className="block text-sm font-medium mb-1">Filing Frequency</label>
                  <Select
                    value={configFormData.filing_frequency}
                    onValueChange={(value: any) => setConfigFormData({ ...configFormData, filing_frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Save Configuration
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setEditingTaxRate(null); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Tax Rate
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingTaxRate ? 'Edit Tax Rate' : 'Create New Tax Rate'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">Tax Name</label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="rate" className="block text-sm font-medium mb-1">Tax Rate (%)</label>
                  <input
                    id="rate"
                    type="number"
                    step="0.01"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 border rounded-md"
                    required
                  />
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

                <div>
                  <label htmlFor="is_compound" className="block text-sm font-medium mb-1">Compound Tax</label>
                  <Select
                    value={formData.is_compound.toString()}
                    onValueChange={(value) => setFormData({ ...formData, is_compound: value === 'true' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">No</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingTaxRate ? 'Update' : 'Create'} Tax Rate
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tax Configuration Summary */}
      {taxConfig && (
        <Card>
          <CardHeader>
            <CardTitle>Current Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium">Tax ID</label>
                <p className="font-mono">{taxConfig.tax_number || 'Not set'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium">Default Rate</label>
                <p className="font-mono">{taxConfig.default_tax_rate}%</p>
              </div>
              <div>
                <label className="block text-sm font-medium">Pricing</label>
                <p className="font-mono">{taxConfig.tax_inclusive ? 'Tax Inclusive' : 'Tax Exclusive'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium">Calculation</label>
                <p className="font-mono">{taxConfig.auto_calculate ? 'Automatic' : 'Manual'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium">Filing Frequency</label>
                <p className="font-mono capitalize">{taxConfig.filing_frequency}</p>
              </div>
              <div>
                <label className="block text-sm font-medium">Next Filing Date</label>
                <p className="font-mono">
                  {taxConfig.next_filing_date ? 
                    new Date(taxConfig.next_filing_date).toLocaleDateString() : 
                    getNextFilingDate(taxConfig.filing_frequency).toLocaleDateString()
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tax Rates */}
      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search tax rates..."
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
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tax Rates ({filteredTaxRates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Description</th>
                  <th className="text-left p-2">Rate</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-center p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTaxRates.map((taxRate) => (
                  <tr key={taxRate.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{taxRate.name}</td>
                    <td className="p-2 text-sm text-gray-600">{taxRate.description}</td>
                    <td className="p-2 font-mono">{taxRate.rate}%</td>
                    <td className="p-2">
                      <Badge className={taxRate.is_compound ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}>
                        {taxRate.is_compound ? 'Compound' : 'Simple'}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Badge className={taxRate.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {taxRate.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex justify-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(taxRate)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(taxRate.id)}
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
            
            {filteredTaxRates.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No tax rates found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tax Calculator */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="calc_amount" className="block text-sm font-medium mb-1">Amount</label>
              <input
                id="calc_amount"
                type="number"
                step="0.01"
                placeholder="Enter amount"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="calc_rate" className="block text-sm font-medium mb-1">Tax Rate (%)</label>
              <input
                id="calc_rate"
                type="number"
                step="0.01"
                placeholder="Enter tax rate"
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-gray-600">Tax Amount: <span className="font-bold text-lg">Use calculator above</span></p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxManagementPage;
