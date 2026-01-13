import React, { ReactNode } from 'react';
import { NavigationProviderProps, UseNavigationReturn } from '../types';
export declare const NavigationProvider: React.FC<NavigationProviderProps>;
export declare const useNavigation: () => UseNavigationReturn;
export declare const withNavigation: <P extends object>(Component: React.ComponentType<P>) => {
    (props: P): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
export declare const NavigationRouter: React.FC<{
    children: ReactNode;
    navigationItems: any[];
    config?: Partial<NavigationProviderProps['config']>;
}>;
