import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '@/components/ui/button'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants and sizes.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'Button style variant'
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'Button size'
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button'
    },
    asChild: {
      control: 'boolean',
      description: 'Render as a different element'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Button'
  }
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary'
  }
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete'
  }
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline'
  }
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost'
  }
}

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link'
  }
}

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small'
  }
}

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large'
  }
}

export const Icon: Story = {
  args: {
    size: 'icon',
    children: '🔥'
  }
}

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled'
  }
}

export const WithLoading: Story = {
  args: {
    children: 'Loading...',
    disabled: true
  },
  render: (args) => (
    <Button {...args}>
      <span className="animate-spin mr-2">⏳</span>
      {args.children}
    </Button>
  )
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  )
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">🔥</Button>
    </div>
  )
}

export const InteractiveStates: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button>Normal</Button>
      <Button className="hover:bg-primary-hover">Hover</Button>
      <Button className="active:bg-primary-active">Active</Button>
      <Button className="focus:ring-2 focus:ring-primary">Focus</Button>
      <Button disabled>Disabled</Button>
    </div>
  )
}

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button>
        <span className="mr-2">📝</span>
        Edit
      </Button>
      <Button variant="destructive">
        <span className="mr-2">🗑️</span>
        Delete
      </Button>
      <Button variant="outline">
        <span className="mr-2">📋</span>
        Copy
      </Button>
      <Button variant="secondary">
        <span className="mr-2">💾</span>
        Save
      </Button>
    </div>
  )
}

export const AsLink: Story = {
  args: {
    asChild: true,
    children: (
      <a href="#" onClick={(e) => e.preventDefault()}>
        Link Button
      </a>
    )
  }
}

export const CustomStyles: Story = {
  args: {
    className: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0',
    children: 'Gradient Button'
  }
}
