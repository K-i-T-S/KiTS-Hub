import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigationStore } from '../store';
import { Command, UseCommandPaletteReturn } from '../types';

export const useCommandPalette = (initialCommands: Command[] = []): UseCommandPaletteReturn => {
  const { config, commandPaletteOpen, setCommandPaletteOpen } = useNavigationStore();
  const [commands, setCommands] = useState<Command[]>(initialCommands);
  const [query, setQuery] = useState('');
  const [selectedCommand, setSelectedCommand] = useState(0);

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) {
      return commands.slice(0, config.commandPalette.maxResults);
    }

    const queryLower = query.toLowerCase();
    
    return commands
      .filter(command => {
        const searchableText = [
          command.title,
          command.description,
          command.category,
          ...(command.keywords || [])
        ].join(' ').toLowerCase();
        
        return searchableText.includes(queryLower);
      })
      .slice(0, config.commandPalette.maxResults);
  }, [commands, query, config.commandPalette.maxResults]);

  // Execute a command
  const executeCommand = useCallback(async (command: Command) => {
    try {
      await command.action();
      setCommandPaletteOpen(false);
      setQuery('');
      setSelectedCommand(0);
    } catch (error) {
      console.error('Command execution error:', error);
    }
  }, [setCommandPaletteOpen]);

  // Register a new command
  const registerCommand = useCallback((command: Command) => {
    setCommands(prev => {
      // Remove existing command with same ID
      const filtered = prev.filter(c => c.id !== command.id);
      return [...filtered, command];
    });
  }, []);

  // Unregister a command
  const unregisterCommand = useCallback((id: string) => {
    setCommands(prev => prev.filter(c => c.id !== id));
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!commandPaletteOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedCommand(prev => {
            const maxIndex = filteredCommands.length - 1;
            return prev < maxIndex ? prev + 1 : 0;
          });
          break;
          
        case 'ArrowUp':
          event.preventDefault();
          setSelectedCommand(prev => {
            const maxIndex = filteredCommands.length - 1;
            return prev > 0 ? prev - 1 : maxIndex;
          });
          break;
          
        case 'Enter':
          event.preventDefault();
          const command = filteredCommands[selectedCommand];
          if (command) {
            executeCommand(command);
          }
          break;
          
        case 'Escape':
          event.preventDefault();
          setCommandPaletteOpen(false);
          setQuery('');
          setSelectedCommand(0);
          break;
      }
    };

    // Handle command palette shortcut
    const handleShortcut = (event: KeyboardEvent) => {
      // Check for Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'P') {
        event.preventDefault();
        setCommandPaletteOpen(true);
        setQuery('');
        setSelectedCommand(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keydown', handleShortcut);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keydown', handleShortcut);
    };
  }, [
    commandPaletteOpen,
    filteredCommands,
    selectedCommand,
    executeCommand,
    setCommandPaletteOpen,
  ]);

  // Reset selection when filtered commands change
  useEffect(() => {
    setSelectedCommand(0);
  }, [filteredCommands]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    return filteredCommands.reduce((groups, command) => {
      const category = command.category || 'general';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(command);
      return groups;
    }, {} as Record<string, Command[]>);
  }, [filteredCommands]);

  return {
    isOpen: commandPaletteOpen,
    commands,
    filteredCommands,
    groupedCommands,
    query,
    selectedCommand,
    setIsOpen: setCommandPaletteOpen,
    setQuery,
    setSelectedCommand,
    executeCommand,
    registerCommand,
    unregisterCommand,
  };
};

// Hook for predefined system commands
export const useSystemCommands = () => {
  const { navigate } = useNavigationStore();

  return useMemo(() => [
    {
      id: 'navigate-home',
      title: 'Go to Home',
      description: 'Navigate to the home page',
      icon: null,
      shortcut: 'home',
      category: 'navigation',
      action: () => navigate('/'),
      keywords: ['home', 'dashboard', 'main'],
    },
    {
      id: 'navigate-settings',
      title: 'Go to Settings',
      description: 'Navigate to settings page',
      icon: null,
      shortcut: 'settings',
      category: 'navigation',
      action: () => navigate('/settings'),
      keywords: ['settings', 'preferences', 'config'],
    },
    {
      id: 'search',
      title: 'Search',
      description: 'Open global search',
      icon: null,
      shortcut: 'search',
      category: 'actions',
      action: () => {
        // This would trigger the global search
        console.log('Open search');
      },
      keywords: ['search', 'find', 'lookup'],
    },
    {
      id: 'help',
      title: 'Help & Documentation',
      description: 'Open help documentation',
      icon: null,
      shortcut: 'help',
      category: 'help',
      action: () => navigate('/help'),
      keywords: ['help', 'docs', 'documentation', 'support'],
    },
    {
      id: 'theme-toggle',
      title: 'Toggle Theme',
      description: 'Switch between light and dark theme',
      icon: null,
      shortcut: 'theme',
      category: 'preferences',
      action: () => {
        // This would toggle the theme
        console.log('Toggle theme');
      },
      keywords: ['theme', 'dark', 'light', 'mode'],
    },
  ], [navigate]);
};

// Hook for dynamic commands based on context
export const useContextualCommands = (context: any) => {
  const { navigate } = useNavigationStore();

  return useMemo(() => {
    const commands: Command[] = [];

    // Add context-specific commands
    if (context?.user?.role === 'admin') {
      commands.push({
        id: 'admin-panel',
        title: 'Admin Panel',
        description: 'Open administration panel',
        icon: null,
        shortcut: 'admin',
        category: 'admin',
        action: () => navigate('/admin'),
        keywords: ['admin', 'administration', 'manage'],
      });
    }

    if (context?.currentPath?.includes('/products/')) {
      commands.push({
        id: 'edit-product',
        title: 'Edit Product',
        description: 'Edit current product',
        icon: null,
        shortcut: 'edit',
        category: 'actions',
        action: () => {
          // This would open edit mode for current product
          console.log('Edit product');
        },
        keywords: ['edit', 'modify', 'update', 'product'],
      });
    }

    return commands;
  }, [context, navigate]);
};
