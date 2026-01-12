// Simple test to check if basic setup works
console.log('Starting app...');

const container = document.getElementById('root');
if (!container) {
  console.error('Root container not found');
} else {
  console.log('Root container found:', container);
  
  // Simple test content
  container.innerHTML = `
    <div style="min-height: 100vh; background-color: #f9fafb; padding: 32px;">
      <div style="max-width: 896px; margin: 0 auto;">
        <h1 style="font-size: 36px; font-weight: bold; color: #111827; margin-bottom: 16px;">
          Basic Test Working!
        </h1>
        <p style="font-size: 18px; color: #6b7280; margin-bottom: 32px;">
          If you can see this, the basic setup is working.
        </p>
        <button onclick="alert('Button clicked!')" style="background-color: #3b82f6; color: white; padding: 8px 16px; border-radius: 4px; border: none; cursor: pointer;">
          Test Button
        </button>
      </div>
    </div>
  `;
  
  console.log('Content injected successfully');
}
