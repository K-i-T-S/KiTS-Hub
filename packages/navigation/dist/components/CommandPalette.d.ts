import React from 'react';
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
export declare const CommandPalette: React.FC<CommandPaletteProps>;
export declare const CommandTrigger: React.FC<{
    onClick: () => void;
    shortcut?: string;
    className?: string;
}>;
export {};
