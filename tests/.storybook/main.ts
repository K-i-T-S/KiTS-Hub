import type { StorybookConfig } from '@storybook/react-webpack5'

const config: StorybookConfig = {
  stories: [
    '../shared-shell/src/**/*.stories.@(js|jsx|ts|tsx)',
    '../shared-shell/src/components/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-links',
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-backgrounds',
    '@storybook/addon-viewport'
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {
      builder: {
        lazyCompilation: true
      }
    }
  },
  docs: {
    autodocs: 'tag'
  },
  features: {
    storyStoreV7: true
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop: any) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true)
    }
  },
  webpackFinal: async (config: any) => {
    // Add aliases for easier imports
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, '../../shared-shell/src'),
      '@shared': require('path').resolve(__dirname, '../../shared'),
      '@components': require('path').resolve(__dirname, '../../shared-shell/src/components'),
      '@lib': require('path').resolve(__dirname, '../../shared-shell/src/lib'),
      '@contexts': require('path').resolve(__dirname, '../../shared-shell/src/contexts')
    }
    return config
  }
}

export default config
