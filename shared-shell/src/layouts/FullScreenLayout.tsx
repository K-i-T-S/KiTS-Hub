import React from 'react';
import { Outlet } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useLayout } from '../hooks/useLayout';
import { ArrowLeft, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface FullScreenLayoutProps {
  children?: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  backButtonPath?: string;
}

const FullScreenLayout: React.FC<FullScreenLayoutProps> = ({ 
  children, 
  title,
  showBackButton = false,
  backButtonPath = '/'
}) => {
  const { actions } = useLayout();
  const { user, signOut } = useAuth();
  const content = children || <Outlet />;

  // Set layout variant to fullscreen when this layout is used
  React.useEffect(() => {
    actions.setLayoutVariant('fullscreen');
    return () => {
      actions.setLayoutVariant('main');
    };
  }, [actions]);

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal top bar for fullscreen mode */}
      <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-full items-center justify-between px-4">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Button variant="ghost" size="sm" asChild>
                <a href={backButtonPath}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </a>
              </Button>
            )}
            
            {title && (
              <h1 className="text-lg font-semibold">{title}</h1>
            )}
          </div>

          {/* Right side - minimal controls */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
              <span className="sr-only">Settings</span>
            </Button>
            
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="w-4 h-4" />
              <span className="sr-only">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content - full screen without padding constraints */}
      <main className="flex-1 overflow-auto">
        {content}
      </main>
    </div>
  );
};

export default FullScreenLayout;
