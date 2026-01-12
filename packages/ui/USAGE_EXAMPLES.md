# KiTS Hub UI Library - Usage Examples

This document provides comprehensive examples of how to use the KiTS Hub UI component library across different solutions and scenarios.

## Installation

```bash
npm install @kits-hub/ui
```

## Basic Setup

### 1. Import Components and Styles

```typescript
// Import components
import { 
  Button, 
  Card, 
  Input, 
  Select, 
  Alert,
  Badge,
  Avatar,
  Table,
  Tabs,
  Modal,
  Dropdown,
  Tooltip,
  Breadcrumb,
  Pagination
} from '@kits-hub/ui';

// Import styles (required)
import '@kits-hub/ui/styles';
```

### 2. Import Individual Categories

```typescript
// Import only what you need for better tree-shaking
import { Button, LoadingButton } from '@kits-hub/ui/buttons';
import { Input, Select } from '@kits-hub/ui/inputs';
import { Card, Container } from '@kits-hub/ui/layout';
import { Alert, Toast } from '@kits-hub/ui/feedback';
import { Badge, Avatar } from '@kits-hub/ui/data-display';
import { Tabs, Breadcrumb } from '@kits-hub/ui/navigation';
import { Dropdown, Tooltip } from '@kits-hub/ui/overlays';
```

## Component Examples

### Buttons

#### Basic Button Variants
```typescript
function ButtonExamples() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="default">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  );
}
```

#### Button Sizes and States
```typescript
function ButtonSizes() {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">
        <Settings className="h-4 w-4" />
      </Button>
      <Button loading>Loading...</Button>
      <Button disabled>Disabled</Button>
    </div>
  );
}
```

### Forms

#### Complete Form Example
```typescript
function UserForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    newsletter: false
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>User Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          label="Full Name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter your full name"
        />
        
        <Input
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder="name@example.com"
          helperText="We'll never share your email with anyone."
        />
        
        <Select
          value={formData.role}
          onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Administrator</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="newsletter"
            checked={formData.newsletter}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, newsletter: checked }))}
          />
          <label htmlFor="newsletter" className="text-sm font-medium">
            Subscribe to newsletter
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Layout Components

#### Card with Header and Footer
```typescript
function DashboardCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Revenue</CardTitle>
        <CardDescription>Revenue for the current month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">$12,345</div>
        <p className="text-muted-foreground">+15% from last month</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm">View Details</Button>
      </CardFooter>
    </Card>
  );
}
```

#### Responsive Layout
```typescript
function ResponsiveLayout() {
  return (
    <Container>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Sales data and analytics</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Inventory management</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Customer information</p>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
```

### Data Display

#### User List with Avatars and Badges
```typescript
function UserList() {
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', status: 'inactive' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user', status: 'active' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={`https://avatar.vercel.sh/${user.name}`} />
                  <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                  {user.status}
                </Badge>
                <Badge variant="outline">{user.role}</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

#### Data Table with Pagination
```typescript
function DataTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;

  const data = [
    { id: 1, name: 'Product A', category: 'Electronics', price: '$299', stock: 45 },
    { id: 2, name: 'Product B', category: 'Clothing', price: '$49', stock: 120 },
    { id: 3, name: 'Product C', category: 'Books', price: '$19', stock: 200 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Products</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.price}</TableCell>
                <TableCell>
                  <Badge variant={item.stock < 50 ? 'destructive' : 'default'}>
                    {item.stock} units
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="mt-4 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </CardContent>
    </Card>
  );
}
```

### Navigation

#### Tab Navigation
```typescript
function TabExample() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <Card>
      <CardHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4">
            <p>Overview content goes here...</p>
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-4">
            <p>Analytics content goes here...</p>
          </TabsContent>
          
          <TabsContent value="reports" className="mt-4">
            <p>Reports content goes here...</p>
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
}
```

#### Breadcrumb Navigation
```typescript
function BreadcrumbExample() {
  const items = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Electronics', href: '/products/electronics' },
    { label: 'Smartphones', active: true }
  ];

  return <Breadcrumb items={items} />;
}
```

### Overlays

#### Modal Dialog
```typescript
function ModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      
      <Modal open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to perform this action? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsOpen(false)}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Modal>
    </div>
  );
}
```

#### Dropdown Menu
```typescript
function DropdownExample() {
  return (
    <Dropdown>
      <DropdownTrigger asChild>
        <Button variant="outline">
          Options
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownTrigger>
      <DropdownContent>
        <DropdownItem>Profile</DropdownItem>
        <DropdownItem>Settings</DropdownItem>
        <DropdownSeparator />
        <DropdownItem>Logout</DropdownItem>
      </DropdownContent>
    </Dropdown>
  );
}
```

#### Tooltip
```typescript
function TooltipExample() {
  return (
    <div className="flex space-x-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon">
            <Info className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Click for more information</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Open settings</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
```

### Feedback Components

#### Alert Messages
```typescript
function AlertExamples() {
  return (
    <div className="space-y-4">
      <Alert>
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>
          Your changes have been saved successfully.
        </AlertDescription>
      </Alert>
      
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          There was a problem processing your request.
        </AlertDescription>
      </Alert>
      
      <Alert variant="warning">
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          Please review your input before proceeding.
        </AlertDescription>
      </Alert>
    </div>
  );
}
```

## Advanced Usage

### Custom Theming
```typescript
// Override CSS custom properties for custom theming
const customTheme = `
:root {
  --primary: 220 90% 56%;
  --primary-foreground: 210 40% 98%;
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
}
`;

// Apply custom theme
function CustomThemeProvider({ children }) {
  return (
    <>
      <style>{customTheme}</style>
      {children}
    </>
  );
}
```

### Component Composition
```typescript
// Create composed components using UI library
function SearchInput({ onSearch, ...props }) {
  return (
    <div className="relative">
      <Input
        {...props}
        className="pr-10"
        placeholder="Search..."
        onChange={(e) => onSearch(e.target.value)}
      />
      <Button 
        size="icon" 
        className="absolute right-2 top-1/2 -translate-y-1/2"
        onClick={() => onSearch(props.value)}
      >
        <Search className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

### Integration with Forms
```typescript
import { useForm } from 'react-hook-form';
import { Button, Input, Select } from '@kits-hub/ui';

function FormExample() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    console.log('Form data:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Name"
        {...register('name', { required: 'Name is required' })}
        error={errors.name?.message}
      />
      
      <Select
        value={watch('role')}
        onValueChange={(value) => setValue('role', value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="user">User</SelectItem>
        </SelectContent>
      </Select>
      
      <Button type="submit" loading={isSubmitting}>
        Submit
      </Button>
    </form>
  );
}
```

## Module Federation Integration

### In Shell Application
```typescript
// shared-shell/src/App.tsx
import { Button, Card } from '@kits-hub/ui';

function ShellApp() {
  return (
    <div>
      <Card>
        <CardContent>
          <Button>Shell Button</Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

### In Solution Applications
```typescript
// solutions/inventory-management/src/pages/ProductsPage.tsx
import { Button, Table, Badge } from '@kits-hub/ui';

function ProductsPage() {
  return (
    <div>
      <Button>Add Product</Button>
      <Table>
        {/* Table content */}
      </Table>
      <Badge>In Stock</Badge>
    </div>
  );
}
```

## Best Practices

### 1. Import Optimization
```typescript
// ✅ Good: Import specific categories
import { Button, Card } from '@kits-hub/ui';

// ✅ Good: Import individual categories
import { Button } from '@kits-hub/ui/buttons';
import { Card } from '@kits-hub/ui/layout';

// ❌ Avoid: Import everything
import * as UI from '@kits-hub/ui';
```

### 2. TypeScript Usage
```typescript
// ✅ Good: Use proper TypeScript types
interface UserFormProps {
  onSubmit: (data: UserFormData) => void;
  initialData?: Partial<UserFormData>;
}

function UserForm({ onSubmit, initialData }: UserFormProps) {
  // Component implementation
}

// ❌ Avoid: Using 'any' type
function BadForm(props: any) {
  // Component implementation
}
```

### 3. Accessibility
```typescript
// ✅ Good: Include accessibility props
<Button 
  aria-label="Close dialog"
  onClick={onClose}
>
  <X className="h-4 w-4" />
</Button>

// ✅ Good: Use semantic HTML
<Input
  id="email"
  aria-describedby="email-helper"
  aria-invalid={!!error}
/>
```

### 4. Responsive Design
```typescript
// ✅ Good: Use responsive utilities
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>Content</Card>
  <Card>Content</Card>
  <Card>Content</Card>
</div>

// ❌ Avoid: Fixed layouts that don't adapt
<div style={{ display: 'flex', width: '1200px' }}>
  <Card>Content</Card>
</div>
```

## Troubleshooting

### Common Issues

1. **Styles not loading**
   ```typescript
   // Ensure styles are imported
   import '@kits-hub/ui/styles';
   ```

2. **TypeScript errors**
   ```typescript
   // Check if you're using correct import paths
   import { Button } from '@kits-hub/ui'; // ✅
   import { Button } from '@kits-hub/ui/buttons'; // ✅
   ```

3. **Module Federation issues**
   ```javascript
   // Ensure webpack config includes UI library in shared dependencies
   shared: {
     '@kits-hub/ui': {
       singleton: true,
       requiredVersion: '^1.0.0',
     }
   }
   ```

### Performance Tips

1. **Tree Shaking**: Import only what you need
2. **Lazy Loading**: Use React.lazy for heavy components
3. **Bundle Analysis**: Use webpack-bundle-analyzer to check bundle size

This comprehensive guide should help you effectively use the KiTS Hub UI component library across all solutions in the micro-frontend architecture.
