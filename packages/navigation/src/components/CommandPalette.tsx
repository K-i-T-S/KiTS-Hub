import React, { useRef, useEffect } from 'react';
import { Command } from 'cmdk';
import { Terminal, ChevronRight, Search } from 'lucide-react';
import { clsx } from 'clsx';
import { Command as CommandType } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  commands: CommandType[];
  filteredCommands: CommandType[];
  groupedCommands: Record<string, CommandType[]>;
  query: string;
  selectedCommand: number;
  onQueryChange: (query: string) => void;
  onSelectCommand: (command: CommandType) => void;
  onClose: () => void;
  placeholder?: string;
  className?: string;
}

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
  navigation: <ChevronRight className="h-4 w-4" />,
  actions: <Terminal className="h-4 w-4" />,
  admin: <Terminal className="h-4 w-4" />,
  help: <Search className="h-4 w-4" />,
  preferences: <Terminal className="h-4 w-4" />,
  general: <Terminal className="h-4 w-4" />,
};

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  commands,
  filteredCommands,
  groupedCommands,
  query,
  selectedCommand,
  onQueryChange,
  onSelectCommand,
  onClose,
  placeholder = 'Type a command...',
  className,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when command palette opens
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
      
      {/* Command Dialog */}
      <div className="relative w-full max-w-2xl mx-4">
        <Command className="rounded-lg border border-gray-200 bg-white shadow-2xl overflow-hidden">
          {/* Command Input */}
          <div className="flex items-center border-b border-gray-200 px-4">
            <Terminal className="h-5 w-5 text-gray-400 mr-3" />
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
                aria-label="Clear command"
              >
                ×
              </button>
            )}
          </div>

          {/* Command Results */}
          <Command.List className="max-h-96 overflow-y-auto p-2">
            {!query && (
              <div className="px-2 py-3">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Quick Actions
                </h3>
                <div className="space-y-1">
                  {commands.slice(0, 6).map((command) => (
                    <CommandItem
                      key={command.id}
                      command={command}
                      isSelected={false}
                      onSelect={() => onSelectCommand(command)}
                    />
                  ))}
                </div>
              </div>
            )}

            {query && Object.entries(groupedCommands).map(([category, categoryCommands]) => (
              <div key={category} className="mb-4 last:mb-0">
                <div className="flex items-center px-2 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {categoryIcons[category] || categoryIcons.general}
                  <span className="ml-2">{category}</span>
                </div>
                
                <div className="space-y-1">
                  {categoryCommands.map((command, index) => (
                    <CommandItem
                      key={command.id}
                      command={command}
                      isSelected={index === selectedCommand}
                      onSelect={() => onSelectCommand(command)}
                    />
                  ))}
                </div>
              </div>
            ))}

            {query && filteredCommands.length === 0 && (
              <div className="px-4 py-8 text-center">
                <div className="text-gray-400 mb-2">No commands found</div>
                <div className="text-sm text-gray-500">
                  Try typing a different command
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
                <span>Execute</span>
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

// Command item component
interface CommandItemProps {
  command: CommandType;
  isSelected: boolean;
  onSelect: () => void;
}

const CommandItem: React.FC<CommandItemProps> = ({
  command,
  isSelected,
  onSelect,
}) => {
  return (
    <Command.Item
      value={`${command.title} ${command.description || ''} ${command.keywords?.join(' ') || ''}`}
      onSelect={onSelect}
      className={clsx(
        'flex items-center px-2 py-2 text-sm rounded-md cursor-pointer transition-colors',
        isSelected ? 'bg-gray-100' : 'hover:bg-gray-50'
      )}
    >
      <div className="flex items-center flex-1 min-w-0">
        {command.icon && (
          <span className="mr-3 text-gray-400 flex-shrink-0">
            {command.icon}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 truncate">
            {command.title}
          </div>
          {command.description && (
            <div className="text-gray-500 text-xs truncate">
              {command.description}
            </div>
          )}
          {command.shortcut && (
            <div className="flex items-center mt-1">
              <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                {command.shortcut}
              </span>
            </div>
          )}
        </div>
        <ChevronRight className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
      </div>
    </Command.Item>
  );
};

// Command trigger button
export const CommandTrigger: React.FC<{
  onClick: () => void;
  shortcut?: string;
  className?: string;
}> = ({ onClick, shortcut = '⌘⇧P', className }) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex items-center px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors',
        className
      )}
      aria-label="Command palette"
    >
      <Terminal className="h-4 w-4 mr-2" />
      <span className="flex-1 text-left">Commands...</span>
      <kbd className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
        {shortcut}
      </kbd>
    </button>
  );
};
