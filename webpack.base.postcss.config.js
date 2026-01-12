module.exports = {
  plugins: {
    // Tailwind CSS for utility-first styling
    // Processes Tailwind directives (@tailwind, @apply, @config)
    tailwindcss: {},
    
    // Autoprefixer for vendor prefix generation
    // Adds browser-specific prefixes (-webkit-, -moz-, -ms-)
    autoprefixer: {},
    
    // CSS Nano for minification in production
    // Optimizes CSS by removing whitespace, comments, and unused rules
    ...(process.env.NODE_ENV === 'production' ? {
      'cssnano': {
        preset: ['default', {
          // Remove unused CSS rules
          discardUnused: {
            namespace: false,
          },
          // Optimize font values
          normalizeWhitespace: false,
          // Minify selectors
          minifySelectors: true,
          // Merge media queries
          mergeMediaQueries: true,
          // Reduce calc() expressions
          reduceCalc: true,
          // Optimize z-index values
          zindex: false,
        }]
      }
    } : {}),
  },
}
