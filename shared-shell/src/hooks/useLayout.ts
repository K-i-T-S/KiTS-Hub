import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface LayoutState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  darkMode: boolean;
  screenSize: 'mobile' | 'tablet' | 'desktop';
  layoutVariant: 'main' | 'auth' | 'fullscreen';
}

export interface LayoutContextType {
  state: LayoutState;
  actions: {
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    toggleSidebarCollapse: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    toggleDarkMode: () => void;
    setDarkMode: (dark: boolean) => void;
    setScreenSize: (size: 'mobile' | 'tablet' | 'desktop') => void;
    setLayoutVariant: (variant: 'main' | 'auth' | 'fullscreen') => void;
  };
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

interface LayoutProviderProps {
  children: ReactNode;
  defaultVariant?: 'main' | 'auth' | 'fullscreen';
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({ 
  children, 
  defaultVariant = 'main' 
}) => {
  // Initialize dark mode from localStorage or system preference
  const [darkMode, setDarkModeState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kits-hub-dark-mode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Initialize sidebar state
  const [sidebarOpen, setSidebarOpenState] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(false);

  // Initialize screen size
  const [screenSize, setScreenSizeState] = useState<'mobile' | 'tablet' | 'desktop'>(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 768) return 'mobile';
      if (width < 1024) return 'tablet';
      return 'desktop';
    }
    return 'desktop';
  });

  // Layout variant
  const [layoutVariant, setLayoutVariantState] = useState<'main' | 'auth' | 'fullscreen'>(defaultVariant);

  // Apply dark mode to document
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      if (darkMode) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      localStorage.setItem('kits-hub-dark-mode', darkMode.toString());
    }
  }, [darkMode]);

  // Handle screen size changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      let newSize: 'mobile' | 'tablet' | 'desktop';
      
      if (width < 768) {
        newSize = 'mobile';
      } else if (width < 1024) {
        newSize = 'tablet';
      } else {
        newSize = 'desktop';
      }

      setScreenSizeState(newSize);

      // Auto-adjust sidebar based on screen size
      if (newSize === 'mobile') {
        setSidebarOpenState(false);
        setSidebarCollapsedState(false);
      } else if (newSize === 'tablet') {
        setSidebarOpenState(false);
        setSidebarCollapsedState(true);
      } else {
        setSidebarOpenState(true);
        setSidebarCollapsedState(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-adjust sidebar for fullscreen layout
  useEffect(() => {
    if (layoutVariant === 'fullscreen') {
      setSidebarOpenState(false);
      setSidebarCollapsedState(false);
    }
  }, [layoutVariant]);

  const actions = {
    toggleSidebar: () => {
      if (screenSize === 'mobile') {
        setSidebarOpenState(!sidebarOpen);
      } else {
        setSidebarCollapsedState(!sidebarCollapsed);
      }
    },
    setSidebarOpen: (open: boolean) => setSidebarOpenState(open),
    toggleSidebarCollapse: () => setSidebarCollapsedState(!sidebarCollapsed),
    setSidebarCollapsed: (collapsed: boolean) => setSidebarCollapsedState(collapsed),
    toggleDarkMode: () => setDarkModeState(!darkMode),
    setDarkMode: (dark: boolean) => setDarkModeState(dark),
    setScreenSize: (size: 'mobile' | 'tablet' | 'desktop') => setScreenSizeState(size),
    setLayoutVariant: (variant: 'main' | 'auth' | 'fullscreen') => setLayoutVariantState(variant),
  };

  const state: LayoutState = {
    sidebarOpen,
    sidebarCollapsed,
    darkMode,
    screenSize,
    layoutVariant,
  };

  const contextValue: LayoutContextType = { state, actions };

  return React.createElement(
    LayoutContext.Provider,
    { value: contextValue },
    children
  );
};

export const useLayout = (): LayoutContextType => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

export const useResponsive = () => {
  const { state } = useLayout();
  
  return {
    isMobile: state.screenSize === 'mobile',
    isTablet: state.screenSize === 'tablet',
    isDesktop: state.screenSize === 'desktop',
    isMobileOrTablet: state.screenSize === 'mobile' || state.screenSize === 'tablet',
  };
};

export const useSidebar = () => {
  const { state, actions } = useLayout();
  
  return {
    isOpen: state.sidebarOpen,
    isCollapsed: state.sidebarCollapsed,
    toggle: actions.toggleSidebar,
    open: () => actions.setSidebarOpen(true),
    close: () => actions.setSidebarOpen(false),
    toggleCollapse: actions.toggleSidebarCollapse,
    collapse: () => actions.setSidebarCollapsed(true),
    expand: () => actions.setSidebarCollapsed(false),
  };
};

export const useDarkMode = () => {
  const { state, actions } = useLayout();
  
  return {
    isDark: state.darkMode,
    toggle: actions.toggleDarkMode,
    set: actions.setDarkMode,
  };
};