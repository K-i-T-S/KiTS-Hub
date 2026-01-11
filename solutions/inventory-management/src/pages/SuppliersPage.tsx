import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Phone, Mail, MapPin, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function SuppliersPage() {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    // Mock data - in real app, this would fetch from API
    const mockSuppliers = [
      {
        id: '1',
        name: 'TechSupply Co.',
        contact_person: 'John Smith',
        email: 'john@techsupply.com',
        phone: '+1-555-0123-4567',
        address: '123 Tech Street, Silicon Valley, CA 94025',
        city: 'San Francisco',
        state: 'CA',
        zip_code: '94025',
        country: 'USA',
        payment_terms: 'Net 30',
        lead_time_days: 7,
        is_active: true,
        created_at: '2024-01-10T09:30:00Z',
        updated_at: '2024-01-10T09:30:00Z'
      },
      {
        id: '2',
        name: 'Office Furniture Inc.',
        contact_person: 'Jane Doe',
        email: 'jane@officefurniture.com',
        phone: '+1-555-0123-4568',
        address: '456 Office Park Dr, Business City, NY 10001',
        city: 'Business City',
        state: 'NY',
        zip_code: '10001',
        country: 'USA',
        payment_terms: 'Net 15',
        lead_time_days: 14,
        is_active: true,
        created_at: '2024-01-05T14:20:00Z',
        updated_at: '2024-01-05T14:20:00Z'
      },
      {
        id: '3',
        name: 'Global Shipping LLC',
        contact_person: 'Mike Johnson',
        email: 'mike@globalshipping.com',
        phone: '+1-555-0123-4569',
        address: '789 International Blvd, Trade City, TX 75001',
        city: 'Trade City',
        state: 'TX',
        zip_code: '75001',
        country: 'USA',
        payment_terms: 'Net 45',
        lead_time_days: 21,
        is_active: false,
        created_at: '2023-12-15T11:00:00Z',
        updated_at: '2024-01-01T08:30:00Z'
      }
    ];
    setSuppliers(mockSuppliers);
  }, []);

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supplier.contact_person.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supplier.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && supplier.is_active) ||
                         (filterStatus === 'inactive' && !supplier.is_active);
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: 'all', label: 'All Suppliers' },
    { value: 'active', label: 'Active Only' },
    { value: 'inactive', label: 'Inactive Only' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Suppliers</h1>
        
        {/* Search and Filter Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search suppliers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="kits-input pl-10 pr-4 py-2"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="kits-input px-3 py-2"
            >
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="kits-button kits-button-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </button>
          </div>
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier) => (
          <div key={supplier.id} className="kits-card p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{supplier.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{supplier.contact_person}</p>
                <div className="flex items-center space-x-2 mb-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{supplier.email}</span>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{supplier.phone}</span>
                </div>
                <div className="flex items-center space-x-2 mb-4">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    {supplier.city}, {supplier.state} {supplier.zip_code}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <span className={`text-sm font-medium ${
                  supplier.is_active ? 'text-kits-success' : 'text-kits-error'
                }`}>
                  {supplier.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  Lead time: {supplier.lead_time_days} days
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="text-kits-primary hover:text-kits-primary-hover">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="text-red-600 hover:text-red-800">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
          <p className="text-gray-500">
            {searchQuery || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first supplier.'}
          </p>
          <button className="kits-button kits-button-primary mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </button>
        </div>
      )}
    </div>
  );
}
