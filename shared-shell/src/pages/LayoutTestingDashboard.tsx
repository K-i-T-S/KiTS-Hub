import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  RotateCw, 
  Moon, 
  Sun, 
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface ViewportConfig {
  name: string;
  width: number;
  height: number;
  icon: React.ElementType;
  description: string;
}

interface TestResult {
  viewport: string;
  test: string;
  status: 'pass' | 'fail' | 'pending';
  message?: string;
}

const VIEWPORTS: ViewportConfig[] = [
  {
    name: 'Mobile',
    width: 390,
    height: 844,
    icon: Smartphone,
    description: 'iPhone 12 Mini'
  },
  {
    name: 'Tablet',
    width: 768,
    height: 1024,
    icon: Tablet,
    description: 'iPad Portrait'
  },
  {
    name: 'Desktop',
    width: 1280,
    height: 720,
    icon: Monitor,
    description: 'Standard Desktop'
  },
  {
    name: 'Large Desktop',
    width: 1920,
    height: 1080,
    icon: Monitor,
    description: 'Large Desktop'
  }
];

const TESTS = [
  {
    name: 'Sidebar Visibility',
    description: 'Sidebar should be appropriately visible/hidden',
    expected: (viewport: string) => {
      switch (viewport) {
        case 'Mobile': return 'Hidden (drawer)';
        case 'Tablet': return 'Collapsed (64px)';
        default: return 'Full width (256px)';
      }
    }
  },
  {
    name: 'Top Bar Height',
    description: 'Top bar should maintain consistent height',
    expected: () => '64px'
  },
  {
    name: 'Content Padding',
    description: 'Content should have appropriate padding',
    expected: () => '24px'
  },
  {
    name: 'Touch Targets',
    description: 'Buttons should meet minimum touch target size',
    expected: (viewport: string) => viewport === 'Mobile' ? '≥44px' : '≥32px'
  },
  {
    name: 'Dark Mode Toggle',
    description: 'Dark mode should work correctly',
    expected: () => 'Functional'
  },
  {
    name: 'Navigation Accessibility',
    description: 'Navigation should be keyboard accessible',
    expected: () => 'Tab navigation works'
  }
];

const LayoutTestingDashboard: React.FC = () => {
  const [currentViewport, setCurrentViewport] = useState<ViewportConfig>(VIEWPORTS[2]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    // Apply viewport changes
    const iframe = document.getElementById('preview-frame') as HTMLIFrameElement;
    if (iframe) {
      iframe.style.width = `${currentViewport.width}px`;
      iframe.style.height = `${currentViewport.height}px`;
    }
  }, [currentViewport]);

  useEffect(() => {
    // Apply dark mode
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const runTests = async () => {
    setIsRunningTests(true);
    const results: TestResult[] = [];

    for (const test of TESTS) {
      try {
        // Simulate test execution
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const result: TestResult = {
          viewport: currentViewport.name,
          test: test.name,
          status: Math.random() > 0.2 ? 'pass' : 'fail', // Simulate test results
          message: test.expected(currentViewport.name)
        };
        
        results.push(result);
      } catch (error) {
        results.push({
          viewport: currentViewport.name,
          test: test.name,
          status: 'fail',
          message: 'Test execution failed'
        });
      }
    }

    setTestResults(results);
    setIsRunningTests(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pass: 'bg-green-100 text-green-800',
      fail: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || variants.pending}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const currentResults = testResults.filter(r => r.viewport === currentViewport.name);
  const passCount = currentResults.filter(r => r.status === 'pass').length;
  const failCount = currentResults.filter(r => r.status === 'fail').length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Layout Testing Dashboard</h1>
          <p className="text-muted-foreground">
            Test responsive layouts across different devices and configurations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="space-y-6">
            {/* Viewport Selector */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Viewport Configuration</h2>
              <div className="space-y-3">
                {VIEWPORTS.map((viewport) => {
                  const Icon = viewport.icon;
                  return (
                    <Button
                      key={viewport.name}
                      variant={currentViewport.name === viewport.name ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => setCurrentViewport(viewport)}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      <div className="text-left">
                        <div className="font-medium">{viewport.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {viewport.width} × {viewport.height} • {viewport.description}
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </Card>

            {/* Theme Controls */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Theme Configuration</h2>
              <div className="space-y-3">
                <Button
                  variant={isDarkMode ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                >
                  {isDarkMode ? (
                    <>
                      <Moon className="w-4 h-4 mr-2" />
                      Dark Mode
                    </>
                  ) : (
                    <>
                      <Sun className="w-4 h-4 mr-2" />
                      Light Mode
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Test Controls */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Test Controls</h2>
              <div className="space-y-3">
                <Button
                  onClick={runTests}
                  disabled={isRunningTests}
                  className="w-full"
                >
                  {isRunningTests ? (
                    <>
                      <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Run Tests
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowOverlay(!showOverlay)}
                  className="w-full"
                >
                  {showOverlay ? 'Hide' : 'Show'} Guidelines
                </Button>
              </div>
            </Card>

            {/* Test Results Summary */}
            {currentResults.length > 0 && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Test Results</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Passed:</span>
                    <span className="text-green-600 font-medium">{passCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Failed:</span>
                    <span className="text-red-600 font-medium">{failCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-medium">{currentResults.length}</span>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Preview Area */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Layout Preview</h2>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{currentViewport.name}</Badge>
                  <Badge variant="outline">{currentViewport.width}×{currentViewport.height}</Badge>
                  {isDarkMode && <Badge variant="outline">Dark</Badge>}
                </div>
              </div>

              {/* Preview Frame */}
              <div className="border rounded-lg overflow-hidden bg-muted/20">
                <div 
                  className="mx-auto relative"
                  style={{ 
                    width: `${Math.min(currentViewport.width, 800)}px`,
                    height: `${Math.min(currentViewport.height, 600)}px`,
                    transform: 'scale(0.8)',
                    transformOrigin: 'top left'
                  }}
                >
                  {/* Simulated Layout Preview */}
                  <div className="w-full h-full bg-background border">
                    {/* Top Bar */}
                    <div className="h-16 border-b bg-background/95 backdrop-blur flex items-center justify-between px-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-muted rounded"></div>
                        <div className="text-sm">/ Dashboard</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-muted rounded-full"></div>
                      </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex h-full">
                      {/* Sidebar */}
                      <div 
                        className={`
                          border-r bg-muted/30 transition-all duration-300
                          ${currentViewport.name === 'Mobile' ? 'w-0' : 
                            currentViewport.name === 'Tablet' ? 'w-16' : 'w-64'}
                        `}
                      >
                        {currentViewport.name !== 'Mobile' && (
                          <div className="p-4 space-y-2">
                            <div className="w-8 h-8 bg-primary/20 rounded"></div>
                            <div className="w-8 h-8 bg-muted rounded"></div>
                            <div className="w-8 h-8 bg-muted rounded"></div>
                          </div>
                        )}
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 p-6">
                        <div className="space-y-4">
                          <div className="h-8 bg-muted rounded w-3/4"></div>
                          <div className="h-4 bg-muted rounded w-1/2"></div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                              <div key={i} className="h-24 bg-muted rounded"></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Guidelines Overlay */}
                  {showOverlay && (
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Grid overlay */}
                      <div className="w-full h-full grid grid-cols-8 grid-rows-6">
                        {Array.from({ length: 48 }).map((_, i) => (
                          <div key={i} className="border border-blue-500/30"></div>
                        ))}
                      </div>
                      
                      {/* Measurement indicators */}
                      <div className="absolute top-0 left-0 w-full h-full">
                        {/* Width indicator */}
                        <div className="absolute -top-6 left-0 text-xs text-blue-600 font-mono">
                          {currentViewport.width}px
                        </div>
                        
                        {/* Height indicator */}
                        <div className="absolute top-0 -left-8 text-xs text-blue-600 font-mono transform -rotate-90 origin-center">
                          {currentViewport.height}px
                        </div>
                        
                        {/* Breakpoint indicators */}
                        <div className="absolute bottom-0 right-0 text-xs text-orange-600">
                          {currentViewport.name}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Test Results Details */}
              {currentResults.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-md font-semibold mb-3">Test Details</h3>
                  <div className="space-y-2">
                    {currentResults.map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(result.status)}
                          <div>
                            <div className="font-medium">{result.test}</div>
                            <div className="text-sm text-muted-foreground">{result.message}</div>
                          </div>
                        </div>
                        {getStatusBadge(result.status)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutTestingDashboard;
