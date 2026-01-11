import type { Preview, StoryFn } from '@storybook/react'
import '../shared-shell/src/index.css'

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      toc: true
    },
    a11y: {
      config: {
        rules: [
          {
            // Selector for the target element(s)
            selector: '*',
            // Array of WCAG rules to check
            checks: ['wcag2a', 'wcag2aa', 'wcag21aa'],
          },
        ],
      },
      manual: true,
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#333333',
        },
        {
          name: 'gradient',
          value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
      ],
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1440px',
            height: '900px',
          },
        },
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
          { value: 'auto', title: 'Auto', icon: 'contrast' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story: StoryFn, context: any) => {
      const { theme } = context.globals
      const themeClass = theme === 'dark' ? 'dark' : ''
      
      return (
        <div className={`theme-${theme} ${themeClass}`}>
          <Story />
        </div>
      )
    },
  ],
}

export default preview
