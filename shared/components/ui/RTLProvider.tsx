import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getLanguageDirection } from '../../lib/i18n';

interface RTLContextType {
  isRTL: boolean;
  language: string;
  setLanguage: (language: string) => void;
}

const RTLContext = createContext<RTLContextType | undefined>(undefined);

interface RTLProviderProps {
  children: ReactNode;
  defaultLanguage?: string;
}

export function RTLProvider({ children, defaultLanguage = 'en' }: RTLProviderProps) {
  const [language, setLanguage] = useState(defaultLanguage);
  const [isRTL, setIsRTL] = useState(getLanguageDirection(defaultLanguage) === 'rtl');

  useEffect(() => {
    const newDirection = getLanguageDirection(language);
    setIsRTL(newDirection === 'rtl');
    
    // Update document direction
    document.documentElement.dir = newDirection;
    document.documentElement.lang = language;
    
    // Update CSS for RTL support
    if (newDirection === 'rtl') {
      document.body.classList.add('rtl');
      document.body.classList.remove('ltr');
    } else {
      document.body.classList.add('ltr');
      document.body.classList.remove('rtl');
    }
  }, [language]);

  const value: RTLContextType = {
    isRTL,
    language,
    setLanguage,
  };

  return (
    <RTLContext.Provider value={value}>
      {children}
    </RTLContext.Provider>
  );
}

export function useRTL(): RTLContextType {
  const context = useContext(RTLContext);
  if (context === undefined) {
    throw new Error('useRTL must be used within an RTLProvider');
  }
  return context;
}

// RTL utility functions
export const rtlUtils = {
  // Text alignment utilities
  textAlign: (isRTL: boolean) => isRTL ? 'text-right' : 'text-left',
  textStart: (isRTL: boolean) => isRTL ? 'text-right' : 'text-left',
  textEnd: (isRTL: boolean) => isRTL ? 'text-left' : 'text-right',
  
  // Margin and padding utilities
  marginLeft: (isRTL: boolean) => isRTL ? 'margin-right' : 'margin-left',
  marginRight: (isRTL: boolean) => isRTL ? 'margin-left' : 'margin-right',
  paddingLeft: (isRTL: boolean) => isRTL ? 'padding-right' : 'padding-left',
  paddingRight: (isRTL: boolean) => isRTL ? 'padding-left' : 'padding-right',
  
  // Flex utilities
  flexDirection: (isRTL: boolean) => isRTL ? 'row-reverse' : 'row',
  justifyContentStart: (isRTL: boolean) => isRTL ? 'flex-end' : 'flex-start',
  justifyContentEnd: (isRTL: boolean) => isRTL ? 'flex-start' : 'flex-end',
  
  // Border utilities
  borderLeft: (isRTL: boolean) => isRTL ? 'border-right' : 'border-left',
  borderRight: (isRTL: boolean) => isRTL ? 'border-left' : 'border-right',
  
  // Transform utilities
  transform: (isRTL: boolean) => isRTL ? 'scaleX(-1)' : 'scaleX(1)',
  
  // Cursor utilities
  cursor: (isRTL: boolean) => isRTL ? 'w-resize' : 'e-resize',
};

// RTL CSS classes
export const rtlClasses = {
  // Layout utilities
  rtl: 'rtl',
  ltr: 'ltr',
  
  // Text utilities
  'text-right': 'text-right',
  'text-left': 'text-left',
  'text-start': 'text-start',
  'text-end': 'text-end',
  
  // Flex utilities
  'flex-row': 'flex flex-row',
  'flex-row-reverse': 'flex flex-row-reverse',
  'justify-start': 'justify-start',
  'justify-end': 'justify-end',
  'justify-end-rtl': 'justify-end rtl:justify-start',
  'justify-start-rtl': 'justify-start rtl:justify-end',
  
  // Spacing utilities
  'ml-2': 'ml-2',
  'ml-4': 'ml-4',
  'mr-2': 'mr-2',
  'mr-4': 'mr-4',
  'ml-2-rtl': 'ml-2 rtl:mr-2',
  'ml-4-rtl': 'ml-4 rtl:mr-4',
  'mr-2-rtl': 'mr-2 rtl:ml-2',
  'mr-4-rtl': 'mr-4 rtl:ml-4',
  
  // Border utilities
  'border-l': 'border-l',
  'border-r': 'border-r',
  'border-l-rtl': 'border-l rtl:border-r',
  'border-r-rtl': 'border-r rtl:border-l',
};
