// Test to check if CSS is loading properly
console.log('🎨 Testing CSS Loading...\n');

// Check if shared.css is loaded
const checkCSSLoaded = () => {
  const stylesheets = document.styleSheets;
  let sharedCSSLoaded = false;
  
  for (let i = 0; i < stylesheets.length; i++) {
    const sheet = stylesheets[i];
    if (sheet.href && sheet.href.includes('shared.css')) {
      sharedCSSLoaded = true;
      console.log('✅ shared.css found:', sheet.href);
      break;
    }
  }
  
  if (!sharedCSSLoaded) {
    console.log('❌ shared.css not found in stylesheets');
    console.log('📄 Available stylesheets:');
    for (let i = 0; i < stylesheets.length; i++) {
      console.log('  -', stylesheets[i].href || 'inline');
    }
  }
  
  return sharedCSSLoaded;
};

// Check if CSS custom properties are available
const checkCustomProperties = () => {
  const testElement = document.createElement('div');
  testElement.style.display = 'none';
  document.body.appendChild(testElement);
  
  const computedStyle = getComputedStyle(testElement);
  const backgroundColor = computedStyle.getPropertyValue('--background');
  const primaryColor = computedStyle.getPropertyValue('--primary');
  
  document.body.removeChild(testElement);
  
  if (backgroundColor && backgroundColor.trim()) {
    console.log('✅ CSS custom properties available');
    console.log('  --background:', backgroundColor);
    console.log('  --primary:', primaryColor);
    return true;
  } else {
    console.log('❌ CSS custom properties not available');
    return false;
  }
};

// Check if shell classes are applied
const checkShellClasses = () => {
  const shellLayout = document.querySelector('.shell-layout');
  const shellSidebar = document.querySelector('.shell-sidebar');
  const shellTopbar = document.querySelector('.shell-topbar');
  
  console.log('🔍 Checking shell classes:');
  console.log('  .shell-layout found:', !!shellLayout);
  console.log('  .shell-sidebar found:', !!shellSidebar);
  console.log('  .shell-topbar found:', !!shellTopbar);
  
  if (shellLayout) {
    const computedStyle = getComputedStyle(shellLayout);
    const bgColor = computedStyle.backgroundColor;
    console.log('  Shell layout background:', bgColor);
  }
  
  return !!(shellLayout || shellSidebar || shellTopbar);
};

// Run tests
setTimeout(() => {
  console.log('🔍 Running CSS loading tests...');
  
  const cssLoaded = checkCSSLoaded();
  const customProps = checkCustomProperties();
  const shellClasses = checkShellClasses();
  
  console.log('\n📊 Test Results:');
  console.log('  CSS Loaded:', cssLoaded ? '✅' : '❌');
  console.log('  Custom Properties:', customProps ? '✅' : '❌');
  console.log('  Shell Classes:', shellClasses ? '✅' : '❌');
  
  if (cssLoaded && customProps && shellClasses) {
    console.log('\n🎉 CSS loading appears to be working correctly!');
  } else {
    console.log('\n❌ CSS loading issues detected');
  }
}, 2000);
