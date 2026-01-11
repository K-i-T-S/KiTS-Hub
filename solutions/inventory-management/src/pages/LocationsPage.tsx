import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LocationsPage() {
  const { user } = useAuth();
  const [locations, setLocations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Mock data - in real app, this would fetch from API
    const mockLocations = [
      {
        id: '1',
        name: 'Main Warehouse',
        code: 'WH-001',
        address: '123 Storage Street, Industrial City, CA 94025',
        city: 'Industrial City',
        state: 'CA',
        zip_code: '94025',
        country: 'USA',
        location_type: 'warehouse',
        is_active: true,
        created_at: '2024-01-05T09:30:00Z',
        updated_at: '2024-01-05T09:30:00Z'
      },
      {
        id: '2',
        name: 'Downtown Store',
        code: 'ST-001',
        address: '456 Main Street, Downtown, NY 10001',
        city: 'New York',
        state: 'NY',
        zip_code: '10001',
        country: 'USA',
        location_type: 'store',
        is_active: true,
        created_at: '2024-01-10T14:20:00Z',
        updated_at: '2024-01-10T14:20:00Z'
      },
      {
        id: '3',
        name: 'Backup Storage',
        code: 'BK-001',
        address: '789 Storage Rd, Storage City, TX 75001',
        city: 'Storage City',
        state: 'TX',
        zip_code: '75001',
        country: 'USA',
        location_type: 'storage',
        is_active: true,
        created_at: '2023-12-15T11:00:00Z',
        updated_at: '2024-01-01T08:30:00Z'
      }
    ];
    setLocations(mockLocations);
  }, []);

  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         location.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Locations</h1>
        
        {/* Search Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="kits-input pl-10 pr-4 py-2"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="kits-button kits-button-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </button>
          </div>
        </div>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLocations.map((location) => (
          <div key={location.id} className="kits-card p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{location.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{location.code}</p>
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    {location.city}, {location.state} {location.zip_code}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <span className={`text-sm font-medium ${
                  location.is_active ? 'text-kits-success' : 'text-kits-error'
                }`}>
                  {location.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  Type: {location.location_type}
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

      {filteredLocations.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No locations found</h3>
          <p className="text-gray-500">
            {searchQuery 
              ? 'Try adjusting your search criteria.'
              : 'Get started by adding your first location.'}
          </p>
          <button className="kits-button kits-button-primary mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </button>
        </div>
      )}
    </div>
  );
}
