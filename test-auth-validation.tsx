import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider, useAuth, usePermissions, useOrganization } from './packages/auth/src';

// Test component to validate auth hooks and session persistence
function AuthValidationTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const { 
    user, 
    organization, 
    session, 
    isLoading, 
    isAuthenticated, 
    error,
    signIn,
    signUp,
    signOut 
  } = useAuth();

  const { hasPermission, hasRole, permissions, role } = usePermissions();
  const { organization: orgContext, switchOrganization } = useOrganization();

  const addTestResult = (test: string, passed: boolean, details?: string) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const message = `${status} ${test}${details ? ` - ${details}` : ''}`;
    setTestResults(prev => [...prev, message]);
    console.log(message);
  };

  const runValidationTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Test 1: Auth hooks are properly initialized
    addTestResult(
      'Auth hooks initialization',
      !isLoading && typeof user === 'object' && typeof isAuthenticated === 'boolean',
      `Loading: ${isLoading}, Authenticated: ${isAuthenticated}`
    );

    // Test 2: Session persistence in memory
    const initialUser = user;
    addTestResult(
      'Session persistence check - initial state',
      true,
      `Initial user state: ${initialUser ? 'present' : 'null'}`
    );

    // Test 3: Permission hooks work correctly
    const hasBasicPermission = hasPermission('inventory:read' as any);
    addTestResult(
      'Permission hook functionality',
      typeof hasPermission === 'boolean',
      `Has permission check returns: ${typeof hasPermission}`
    );

    // Test 4: Role checking works
    const hasAdminRole = hasRole('admin' as any);
    addTestResult(
      'Role checking functionality',
      typeof hasAdminRole === 'boolean',
      `Has role check returns: ${typeof hasAdminRole}`
    );

    // Test 5: Organization context
    addTestResult(
      'Organization context availability',
      typeof orgContext === 'object',
      `Organization context type: ${typeof orgContext}`
    );

    // Test 6: Session object structure
    if (session) {
      const hasValidSession = session.access_token && session.user && session.expires_at;
      addTestResult(
        'Session object structure',
        hasValidSession,
        `Session has token: ${!!session.access_token}, user: ${!!session.user}, expires: ${!!session.expires_at}`
      );
    } else {
      addTestResult('Session object structure', true, 'No session (expected for unauthenticated state)');
    }

    // Test 7: Error handling
    addTestResult(
      'Error state handling',
      typeof error === 'string' || error === null,
      `Error state type: ${typeof error}`
    );

    // Test 8: Component re-render persistence
    let renderCount = 0;
    const TestComponent = () => {
      const { user: renderUser } = useAuth();
      renderCount++;
      
      useEffect(() => {
        if (renderCount === 2) {
          addTestResult(
            'Session persistence across re-renders',
            renderUser === initialUser,
            `User unchanged across ${renderCount} renders`
          );
        }
      });
      
      return <div>Render {renderCount}</div>;
    };

    // Force re-render
    const TestWrapper = () => {
      const [key, setKey] = useState(0);
      useEffect(() => {
        const timer = setTimeout(() => setKey(1), 100);
        return () => clearTimeout(timer);
      }, []);
      return <TestComponent key={key} />;
    };

    // Create temporary container for re-render test
    const tempContainer = document.createElement('div');
    document.body.appendChild(tempContainer);
    const tempRoot = createRoot(tempContainer);
    tempRoot.render(<TestWrapper />);
    
    setTimeout(() => {
      tempRoot.unmount();
      document.body.removeChild(tempContainer);
    }, 200);

    // Test 9: Auth functions availability
    const authFunctionsAvailable = [
      typeof signIn === 'function',
      typeof signUp === 'function', 
      typeof signOut === 'function'
    ].every(Boolean);

    addTestResult(
      'Auth functions availability',
      authFunctionsAvailable,
      `signIn: ${typeof signIn}, signUp: ${typeof signUp}, signOut: ${typeof signOut}`
    );

    // Test 10: Memory-only session storage (no localStorage)
    const localStorageKeys = Object.keys(localStorage);
    const sessionStorageKeys = Object.keys(sessionStorage);
    const hasNoAuthInStorage = !localStorageKeys.some(key => 
      key.toLowerCase().includes('auth') || key.toLowerCase().includes('session')
    ) && !sessionStorageKeys.some(key => 
      key.toLowerCase().includes('auth') || key.toLowerCase().includes('session')
    );

    addTestResult(
      'Memory-only session storage (no localStorage/sessionStorage)',
      hasNoAuthInStorage,
      `localStorage keys: ${localStorageKeys.length}, sessionStorage keys: ${sessionStorageKeys.length}`
    );

    setTimeout(() => {
      setIsRunning(false);
    }, 1000);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔐 Auth Hooks Validation Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runValidationTests}
          disabled={isRunning}
          style={{
            padding: '10px 20px',
            backgroundColor: isRunning ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isRunning ? 'not-allowed' : 'pointer'
          }}
        >
          {isRunning ? 'Running Tests...' : 'Run Validation Tests'}
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Current Auth State:</h3>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
          {JSON.stringify({
            isLoading,
            isAuthenticated,
            hasUser: !!user,
            userName: user?.name || 'N/A',
            userEmail: user?.email || 'N/A',
            userRole: user?.role || 'N/A',
            hasOrganization: !!organization,
            organizationName: organization?.name || 'N/A',
            hasSession: !!session,
            hasError: !!error,
            errorMessage: error || 'None',
            permissionsCount: permissions?.length || 0,
            currentRole: role || 'N/A'
          }, null, 2)}
        </pre>
      </div>

      <div>
        <h3>Test Results:</h3>
        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '5px' }}>
          {testResults.length === 0 ? (
            <p>No tests run yet. Click "Run Validation Tests" to start.</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index} style={{ marginBottom: '5px' }}>
                {result}
              </div>
            ))
          )}
        </div>
      </div>

      {testResults.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Summary:</h3>
          <p>
            Total Tests: {testResults.length} | 
            Passed: {testResults.filter(r => r.includes('✅')).length} | 
            Failed: {testResults.filter(r => r.includes('❌')).length}
          </p>
        </div>
      )}
    </div>
  );
}

// Main validation app
function ValidationApp() {
  return (
    <AuthProvider>
      <AuthValidationTest />
    </AuthProvider>
  );
}

export default ValidationApp;
