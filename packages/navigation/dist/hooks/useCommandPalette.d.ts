import { Command, UseCommandPaletteReturn } from '../types';
export declare const useCommandPalette: (initialCommands?: Command[]) => UseCommandPaletteReturn;
export declare const useSystemCommands: () => {
    id: string;
    title: string;
    description: string;
    icon: null;
    shortcut: string;
    category: string;
    action: () => void;
    keywords: string[];
}[];
export declare const useContextualCommands: (context: any) => Command[];
