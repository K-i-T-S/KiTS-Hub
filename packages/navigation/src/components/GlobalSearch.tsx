import React, { useRef, useEffect } from 'react';
import { Command } from 'cmdk';
import { Search, FileText, Users, Package, Settings, Home, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { SearchResult } from '../types';

interface GlobalSearchProps {
  isOpen: boolean;
  query: string;
  results: SearchResult[];
  onQueryChange: (query: string) => void;
  onSelect: (result: SearchResult) => void;
  onClose: () => void;
  placeholder?: string;
  maxResults?: number;
  showShortcuts?: boolean;
  className?: string;
}

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
  navigation: <Home className="h-4 w-4" />,
  products: <Package className="h-4 w-4" />,
  customers: <Users className="h-4 w-4" />,
  reports: <FileText className="h-4 w-4" />,
  settings: <Settings className="h-4 w-4" />,
  default: <FileText className="h-4 w-4" />,
};

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  isOpen,
  query,
  results,
  onQueryChange,
  onSelect,
  onClose,
  placeholder = 'Search...',
  maxResults = 10,
  showShortcuts = true,
  className,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when search opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  // Group results by category
  const groupedResults = results.reduce((groups, result) => {
    const category = result.category || 'default';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(result);
    return groups;
  }, {} as Record<string, SearchResult[]>);

  if (!isOpen) {
    return null;
  }

  return (
    <Command.Dialog
      open={isOpen}
      onOpenChange={onClose}
      className={clsx(
        'fixed inset-0 z-50 flex items-start justify-center pt-16',
        className
      )}
    >
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      
      {/* Search Dialog */}
      <div className="relative w-full max-w-2xl mx-4">
        <Command className="rounded-lg border border-gray-200 bg-white shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center border-b border-gray-200 px-4">
            <Search className="h-5 w-5 text-gray-400 mr-3" />
            <Command.Input
              ref={inputRef}
              value={query}
              onValueChange={onQueryChange}
              placeholder={placeholder}
              className="flex-1 py-3 text-lg outline-none bg-transparent placeholder-gray-500"
              onKeyDown={handleKeyDown}
            />
            {query && (
              <button
                onClick={() => onQueryChange('')}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* Search Results */}
          <Command.List className="max-h-96 overflow-y-auto p-2">
            {!query && showShortcuts && (
              <div className="px-2 py-3">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <QuickAction
                    icon={<Home className="h-4 w-4" />}
                    label="Home"
                    shortcut="⌘H"
                    onClick={() => onSelect({ id: 'home', title: 'Home', path: '/', category: 'navigation' })}
                  />
                  <QuickAction
                    icon={<Settings className="h-4 w-4" />}
                    label="Settings"
                    shortcut="⌘S"
                    onClick={() => onSelect({ id: 'settings', title: 'Settings', path: '/settings', category: 'navigation' })}
                  />
                  <QuickAction
                    icon={<Package className="h-4 w-4" />}
                    label="Products"
                    shortcut="⌘P"
                    onClick={() => onSelect({ id: 'products', title: 'Products', path: '/products', category: 'products' })}
                  />
                  <QuickAction
                    icon={<Users className="h-4 w-4" />}
                    label="Customers"
                    shortcut="⌘C"
                    onClick={() => onSelect({ id: 'customers', title: 'Customers', path: '/customers', category: 'customers' })}
                  />
                </div>
              </div>
            )}

            {query && Object.entries(groupedResults).map(([category, categoryResults]) => (
              <div key={category} className="mb-4 last:mb-0">
                <div className="flex items-center px-2 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {categoryIcons[category] || categoryIcons.default}
                  <span className="ml-2">{category}</span>
                </div>
                
                {categoryResults.slice(0, maxResults).map((result) => (
                  <Command.Item
                    key={result.id}
                    value={`${result.title} ${result.description || ''} ${result.keywords?.join(' ') || ''}`}
                    onSelect={() => onSelect(result)}
                    className="flex items-center px-2 py-2 text-sm rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      {result.icon && (
                        <span className="mr-3 text-gray-400 flex-shrink-0">
                          {result.icon}
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {result.title}
                        </div>
                        {result.description && (
                          <div className="text-gray-500 text-xs truncate">
                            {result.description}
                          </div>
                        )}
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-gray-400">
                            {result.path}
                          </span>
                          {result.shortcut && (
                            <span className="ml-2 text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                              {result.shortcut}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
                    </div>
                  </Command.Item>
                ))}
              </div>
            ))}

            {query && results.length === 0 && (
              <div className="px-4 py-8 text-center">
                <div className="text-gray-400 mb-2">No results found</div>
                <div className="text-sm text-gray-500">
                  Try searching with different keywords
                </div>
              </div>
            )}
          </Command.List>

          {/* Footer */}
          <div className="border-t border-gray-200 px-4 py-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">↑↓</kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center space-x-4">
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">↵</kbd>
                <span>Select</span>
              </div>
              <div className="flex items-center space-x-4">
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">ESC</kbd>
                <span>Close</span>
              </div>
            </div>
          </div>
        </Command>
      </div>
    </Command.Dialog>
  );
};

// Quick Action component
interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  shortcut: string;
  onClick: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({
  icon,
  label,
  shortcut,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full p-3 text-left rounded-md hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center">
        <span className="mr-3 text-gray-600">{icon}</span>
        <span className="text-sm font-medium text-gray-900">{label}</span>
      </div>
      <kbd className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded">
        {shortcut}
      </kbd>
    </button>
  );
};

// Search trigger button
export const SearchTrigger: React.FC<{
  onClick: () => void;
  shortcut?: string;
  className?: string;
}> = ({ onClick, shortcut = '⌘K', className }) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex items-center px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors',
        className
      )}
      aria-label="Search"
    >
      <Search className="h-4 w-4 mr-2" />
      <span className="flex-1 text-left">Search...</span>
      <kbd className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
        {shortcut}
      </kbd>
    </button>
  );
};
