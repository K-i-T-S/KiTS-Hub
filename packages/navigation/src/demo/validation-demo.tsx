import React, { useState } from 'react';
import { 
  useBreadcrumbs, 
  useGlobalSearch, 
  useNavigationHistory,
  useDeepLinking,
  SearchResult,
  NavigationItem,
  BreadcrumbItem
} from '../index';

// Mock navigation items for demo
const mockNavigationItems: NavigationItem[] = [
  {
    id: 'home',
    path: '/',
    label: 'Home',
    metadata: {
      description: 'Main dashboard',
      keywords: ['dashboard', 'main'],
    },
  },
  {
    id: 'products',
    path: '/products',
    label: 'Products',
    metadata: {
      description: 'Product management',
      keywords: ['inventory', 'catalog'],
    },
  },
  {
    id: 'customers',
    path: '/customers',
    label: 'Customers',
    metadata: {
      description: 'Customer management',
      keywords: ['clients', 'users'],
    },
  },
];

export const NavigationValidationDemo: React.FC = () => {
  // Breadcrumbs state
  const { breadcrumbs, addBreadcrumb, removeBreadcrumb, clearBreadcrumbs } = useBreadcrumbs(mockNavigationItems);
  
  // Search state
  const { 
    query, 
    results, 
    isOpen, 
    setQuery, 
    setIsOpen, 
    executeSearch 
  } = useGlobalSearch(mockNavigationItems);
  
  // History state
  const { 
    history, 
    canGoBack, 
    canGoForward, 
    goBack, 
    goForward, 
    addToHistory 
  } = useNavigationHistory();
  
  // Deep linking state
  const { 
    generateLink, 
    parseLink, 
    navigateToLink 
  } = useDeepLinking();

  const [testResults, setTestResults] = useState<string[]>([]);

  // Validation functions
  const runValidations = async () => {
    const results: string[] = [];

    // Test 1: Search functionality
    try {
      await executeSearch('home');
      const searchResults = results.filter(r => r.title.toLowerCase().includes('home'));
      if (searchResults.length > 0) {
        results.push('✅ Search: Found "home" in search results');
      } else {
        results.push('❌ Search: Failed to find "home" in results');
      }
    } catch (error) {
      results.push('❌ Search: Error during search execution');
    }

    // Test 2: Breadcrumb updates
    try {
      const initialCount = breadcrumbs.length;
      addBreadcrumb({
        id: 'test',
        label: 'Test Page',
        path: '/test',
      });
      
      if (breadcrumbs.length > initialCount) {
        results.push('✅ Breadcrumbs: Successfully added custom breadcrumb');
        removeBreadcrumb('test');
      } else {
        results.push('❌ Breadcrumbs: Failed to add custom breadcrumb');
      }
    } catch (error) {
      results.push('❌ Breadcrumbs: Error during breadcrumb manipulation');
    }

    // Test 3: Search with different queries
    try {
      const testQueries = ['product', 'customer', 'nonexistent'];
      let searchWorking = true;
      
      for (const testQuery of testQueries) {
        await executeSearch(testQuery);
        // Just ensure it doesn't crash
      }
      
      results.push('✅ Search: Multiple queries executed successfully');
    } catch (error) {
      results.push('❌ Search: Error during multiple query test');
    }

    // Test 4: Breadcrumb generation
    try {
      if (breadcrumbs.length > 0) {
        const hasValidStructure = breadcrumbs.every(crumb => 
          crumb.id && crumb.label
        );
        
        if (hasValidStructure) {
          results.push('✅ Breadcrumbs: All breadcrumbs have valid structure');
        } else {
          results.push('❌ Breadcrumbs: Some breadcrumbs missing required fields');
        }
      } else {
        results.push('⚠️ Breadcrumbs: No breadcrumbs to validate');
      }
    } catch (error) {
      results.push('❌ Breadcrumbs: Error during structure validation');
    }

    // Test 5: Search result structure
    try {
      setQuery('test');
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const hasValidResults = results.every(result => 
        result.id && result.title && result.path
      );
      
      if (hasValidResults || results.length === 0) {
        results.push('✅ Search: All results have valid structure');
      } else {
        results.push('❌ Search: Some results missing required fields');
      }
    } catch (error) {
      results.push('❌ Search: Error during result structure validation');
    }

    // Test 6: Deep linking
    try {
      const link = generateLink('/products', { id: '123' });
      const parsed = parseLink(link);
      
      if (parsed.path === '/products' && parsed.params.id === '123') {
        results.push('✅ Deep Linking: Link generation and parsing working');
      } else {
        results.push('❌ Deep Linking: Link generation or parsing failed');
      }
    } catch (error) {
      results.push('❌ Deep Linking: Error during link test');
    }

    setTestResults(results);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Navigation System Validation</h1>
      
      <div className="mb-6">
        <button
          onClick={runValidations}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Run Validations
        </button>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Validation Results</h2>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className="p-3 bg-gray-100 rounded">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current State Display */}
      <div className="grid grid-cols-2 gap-6">
        {/* Search State */}
        <div className="p-4 border rounded">
          <h3 className="font-semibold mb-2">Search State</h3>
          <p>Query: "{query}"</p>
          <p>Is Open: {isOpen ? 'Yes' : 'No'}</p>
          <p>Results: {results.length} items</p>
          {results.length > 0 && (
            <div className="mt-2">
              <p className="font-medium">Results:</p>
              <ul className="text-sm">
                {results.slice(0, 3).map((result, index) => (
                  <li key={index}>{result.title}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Breadcrumb State */}
        <div className="p-4 border rounded">
          <h3 className="font-semibold mb-2">Breadcrumb State</h3>
          <p>Count: {breadcrumbs.length}</p>
          <div className="mt-2">
            <p className="font-medium">Breadcrumbs:</p>
            <ul className="text-sm">
              {breadcrumbs.map((crumb, index) => (
                <li key={index}>{crumb.label}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* History State */}
        <div className="p-4 border rounded">
          <h3 className="font-semibold mb-2">History State</h3>
          <p>Can Go Back: {canGoBack ? 'Yes' : 'No'}</p>
          <p>Can Go Forward: {canGoForward ? 'Yes' : 'No'}</p>
          <p>History Items: {history.length}</p>
        </div>

        {/* Deep Link State */}
        <div className="p-4 border rounded">
          <h3 className="font-semibold mb-2">Deep Link State</h3>
          <button
            onClick={() => {
              const link = generateLink('/test', { id: '123' });
              alert(`Generated link: ${link}`);
            }}
            className="text-sm bg-gray-200 px-2 py-1 rounded"
          >
            Test Link Generation
          </button>
        </div>
      </div>

      {/* Interactive Test Controls */}
      <div className="mt-6 p-4 border rounded">
        <h3 className="font-semibold mb-2">Interactive Tests</h3>
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium mb-1">Search Query:</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border rounded px-2 py-1 w-full"
              placeholder="Type to search..."
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => addBreadcrumb({ id: 'test', label: 'Test', path: '/test' })}
              className="bg-green-500 text-white px-3 py-1 rounded text-sm"
            >
              Add Breadcrumb
            </button>
            <button
              onClick={() => removeBreadcrumb('test')}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm"
            >
              Remove Breadcrumb
            </button>
            <button
              onClick={() => clearBreadcrumbs()}
              className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
            >
              Clear Breadcrumbs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
