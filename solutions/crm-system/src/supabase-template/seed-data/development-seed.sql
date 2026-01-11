-- KiTS Hub Development Seed Data
-- This script populates the database with sample data for development and testing

\echo 'Seeding development data...'

-- Insert development tenant
INSERT INTO tenants (
    id, name, slug, plan_type, billing_cycle, status, 
    api_quota, storage_quota_gb, max_users,
    settings, subscription_data, usage_limits
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Development Tenant',
    'dev',
    'enterprise',
    'yearly',
    'active',
    100000,
    1000,
    1000,
    '{"theme": "dark", "timezone": "UTC"}',
    '{"features": ["inventory", "pos", "crm", "hr", "accounting"]}',
    '{"api_calls_per_hour": 10000, "storage_gb": 1000, "users": 1000}'
) ON CONFLICT (id) DO NOTHING;

-- Insert development users
INSERT INTO users (
    id, tenant_id, email, password_hash, first_name, last_name, 
    role, permissions, is_active, email_verified
) VALUES 
(
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'admin@kits.dev',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6', -- password: admin123
    'System',
    'Administrator',
    'admin',
    '["*"]',
    true,
    true
),
(
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'manager@kits.dev',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6', -- password: admin123
    'John',
    'Manager',
    'manager',
    '["users.view", "inventory.view", "sales.view", "reports.view"]',
    true,
    true
),
(
    '33333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000000',
    'inventory@kits.dev',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6', -- password: admin123
    'Sarah',
    'Inventory',
    'inventory_manager',
    '["inventory.*", "products.*", "suppliers.*"]',
    true,
    true
),
(
    '44444444-4444-4444-4444-444444444444',
    '00000000-0000-0000-0000-000000000000',
    'sales@kits.dev',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6', -- password: admin123
    'Mike',
    'Sales',
    'sales_staff',
    '["sales.*", "customers.*", "payments.*"]',
    true,
    true
),
(
    '55555555-5555-5555-5555-555555555555',
    '00000000-0000-0000-0000-000000000000',
    'hr@kits.dev',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6', -- password: admin123
    'Emily',
    'HR',
    'hr_manager',
    '["employees.*", "attendance.*", "payroll.*"]',
    true,
    true
),
(
    '66666666-6666-6666-6666-666666666666',
    '00000000-0000-0000-0000-000000000000',
    'accounting@kits.dev',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6', -- password: admin123
    'David',
    'Accountant',
    'accountant',
    '["transactions.*", "invoices.*", "accounts.*"]',
    true,
    true
)
ON CONFLICT (tenant_id, email) DO NOTHING;

-- Insert categories
INSERT INTO categories (
    tenant_id, name, description, sort_order
) VALUES 
('00000000-0000-0000-0000-000000000000', 'Electronics', 'Electronic devices and accessories', 1),
('00000000-0000-0000-0000-000000000000', 'Clothing', 'Apparel and fashion items', 2),
('00000000-0000-0000-0000-000000000000', 'Food & Beverages', 'Consumable food and drink items', 3),
('00000000-0000-0000-0000-000000000000', 'Office Supplies', 'Business and office equipment', 4),
('00000000-0000-0000-0000-000000000000', 'Furniture', 'Home and office furniture', 5),
('00000000-0000-0000-0000-000000000000', 'Tools & Hardware', 'Hardware and tools', 6)
ON CONFLICT (tenant_id, name) DO NOTHING;

-- Get category IDs for use in products
WITH category_ids AS (
    SELECT id, name FROM categories 
    WHERE tenant_id = '00000000-0000-0000-0000-000000000000'
),
-- Insert suppliers
suppliers AS (
    INSERT INTO suppliers (
        tenant_id, name, contact_person, email, phone, 
        lead_time_days, min_order_amount, rating
    ) VALUES 
    ('00000000-0000-0000-0000-000000000000', 'TechSupply Co', 'John Smith', 'john@techsupply.com', '555-0101', 7, 500.00, 5),
    ('00000000-0000-0000-0000-000000000000', 'Fashion Forward', 'Jane Doe', 'jane@fashionforward.com', '555-0102', 14, 1000.00, 4),
    ('00000000-0000-0000-0000-000000000000', 'Food Distributors Inc', 'Bob Johnson', 'bob@fooddist.com', '555-0103', 3, 200.00, 4),
    ('00000000-0000-0000-0000-000000000000', 'Office Depot Pro', 'Alice Brown', 'alice@officepro.com', '555-0104', 5, 300.00, 5),
    ('00000000-0000-0000-0000-000000000000', 'Furniture Factory', 'Charlie Wilson', 'charlie@furniture.com', '555-0105', 21, 1500.00, 3),
    ('00000000-0000-0000-0000-000000000000', 'Hardware Hub', 'Diana Martinez', 'diana@hardware.com', '555-0106', 10, 400.00, 4)
    ON CONFLICT DO NOTHING
    RETURNING id, name
),
-- Insert locations
locations AS (
    INSERT INTO locations (
        tenant_id, name, code, location_type, is_primary
    ) VALUES 
    ('00000000-0000-0000-0000-000000000000', 'Main Warehouse', 'WH001', 'warehouse', true),
    ('00000000-0000-0000-0000-000000000000', 'Retail Store', 'RS001', 'store', false),
    ('00000000-0000-0000-0000-000000000000', 'Storage Facility', 'SF001', 'storage', false)
    ON CONFLICT DO NOTHING
    RETURNING id, name
)
-- Insert products
INSERT INTO products (
    tenant_id, name, description, sku, category_id, supplier_id, 
    brand, unit, cost, price, min_stock_level, reorder_point, 
    current_stock, track_inventory
)
SELECT 
    '00000000-0000-0000-0000-000000000000' as tenant_id,
    product_data.name,
    product_data.description,
    product_data.sku,
    cat.id as category_id,
    sup.id as supplier_id,
    product_data.brand,
    product_data.unit,
    product_data.cost,
    product_data.price,
    product_data.min_stock_level,
    product_data.reorder_point,
    product_data.current_stock,
    true as track_inventory
FROM (
    VALUES 
    -- Electronics
    ('Laptop Pro 15"', 'High-performance laptop with 15" display', 'LP001', 'TechBrand', 'Each', 800.00, 1200.00, 5, 10, 25),
    ('Wireless Mouse', 'Ergonomic wireless mouse', 'WM001', 'TechBrand', 'Each', 15.00, 25.00, 20, 40, 85),
    ('USB-C Hub', '7-port USB-C hub with power delivery', 'UH001', 'ConnectTech', 'Each', 35.00, 55.00, 15, 30, 45),
    ('Mechanical Keyboard', 'RGB mechanical keyboard', 'KB001', 'KeyMaster', 'Each', 60.00, 90.00, 10, 20, 30),
    ('4K Monitor', '27-inch 4K UHD monitor', 'MN001', 'ViewTech', 'Each', 300.00, 450.00, 3, 8, 12),
    
    -- Clothing
    ('Cotton T-Shirt', '100% cotton t-shirt', 'CT001', 'ComfortWear', 'Each', 8.00, 20.00, 50, 100, 150),
    ('Denim Jeans', 'Classic fit denim jeans', 'DJ001', 'DenimCo', 'Each', 25.00, 60.00, 20, 40, 75),
    ('Winter Jacket', 'Insulated winter jacket', 'WJ001', 'WarmWear', 'Each', 45.00, 120.00, 10, 25, 35),
    ('Running Shoes', 'Athletic running shoes', 'RS001', 'SpeedRun', 'Pair', 40.00, 80.00, 15, 30, 60),
    ('Leather Belt', 'Genuine leather belt', 'LB001', 'LeatherGoods', 'Each', 12.00, 35.00, 25, 50, 80),
    
    -- Food & Beverages
    ('Organic Coffee Beans', 'Premium organic coffee beans 1kg', 'CB001', 'CoffeePro', 'Bag', 12.00, 25.00, 20, 40, 65),
    ('Green Tea', 'Organic green tea boxes', 'GT001', 'TeaTime', 'Box', 8.00, 18.00, 30, 60, 120),
    ('Chocolate Bar', 'Artisan dark chocolate bar', 'CB002', 'ChocoDelight', 'Each', 3.00, 8.00, 100, 200, 350),
    ('Mineral Water', 'Spring water 500ml bottles', 'MW001', 'AquaPure', 'Bottle', 0.50, 2.00, 200, 400, 750),
    ('Protein Bar', 'High protein energy bar', 'PB001', 'PowerBar', 'Each', 2.00, 5.00, 150, 300, 500),
    
    -- Office Supplies
    ('Notebook Set', '3-pack spiral notebooks', 'NS001', 'PaperCo', 'Set', 6.00, 15.00, 40, 80, 180),
    ('Ballpoint Pens', 'Box of 12 ballpoint pens', 'BP001', 'PenPro', 'Box', 8.00, 18.00, 25, 50, 90),
    ('Desk Organizer', 'Multi-compartment desk organizer', 'DO001', 'DeskPro', 'Each', 15.00, 35.00, 12, 25, 40),
    ('Stapler', 'Heavy-duty stapler', 'ST001', 'OfficeMax', 'Each', 10.00, 22.00, 18, 35, 55),
    ('File Cabinet', '3-drawer filing cabinet', 'FC001', 'StoragePro', 'Each', 45.00, 95.00, 5, 12, 18),
    
    -- Furniture
    ('Office Chair', 'Ergonomic office chair', 'OC001', 'ComfortSeat', 'Each', 150.00, 300.00, 3, 8, 12),
    ('Standing Desk', 'Adjustable height standing desk', 'SD001', 'DeskPro', 'Each', 250.00, 500.00, 2, 5, 8),
    ('Bookshelf', '5-tier wooden bookshelf', 'BS001', 'WoodCraft', 'Each', 60.00, 120.00, 4, 10, 15),
    ('Coffee Table', 'Modern glass coffee table', 'CT002', 'HomeStyle', 'Each', 80.00, 180.00, 3, 8, 10),
    ('Dining Chair', 'Set of 2 dining chairs', 'DC001', 'DiningPro', 'Set', 100.00, 220.00, 2, 6, 8),
    
    -- Tools & Hardware
    ('Power Drill', '18V cordless power drill', 'PD001', 'PowerTool', 'Each', 80.00, 150.00, 4, 10, 15),
    ('Screwdriver Set', '30-piece screwdriver set', 'SS001', 'ToolPro', 'Set', 25.00, 55.00, 8, 20, 35),
    ('Hammer', '16oz claw hammer', 'HM001', 'HammerCo', 'Each', 12.00, 28.00, 15, 30, 50),
    ('Measuring Tape', '25-foot measuring tape', 'MT001', 'MeasurePro', 'Each', 8.00, 18.00, 20, 40, 70),
    ('Toolbox', 'Large plastic toolbox', 'TB001', 'BoxPro', 'Each', 25.00, 55.00, 6, 15, 22)
) AS product_data(name, description, sku, brand, unit, cost, price, min_stock_level, reorder_point, current_stock)
CROSS JOIN category_ids cat
CROSS JOIN suppliers sup
WHERE 
    (product_data.name LIKE '%Laptop%' OR product_data.name LIKE '%Mouse%' OR product_data.name LIKE '%Hub%' OR product_data.name LIKE '%Keyboard%' OR product_data.name LIKE '%Monitor%') AND cat.name = 'Electronics' AND sup.name = 'TechSupply Co'
    OR (product_data.name LIKE '%T-Shirt%' OR product_data.name LIKE '%Jeans%' OR product_data.name LIKE '%Jacket%' OR product_data.name LIKE '%Shoes%' OR product_data.name LIKE '%Belt%') AND cat.name = 'Clothing' AND sup.name = 'Fashion Forward'
    OR (product_data.name LIKE '%Coffee%' OR product_data.name LIKE '%Tea%' OR product_data.name LIKE '%Chocolate%' OR product_data.name LIKE '%Water%' OR product_data.name LIKE '%Protein%') AND cat.name = 'Food & Beverages' AND sup.name = 'Food Distributors Inc'
    OR (product_data.name LIKE '%Notebook%' OR product_data.name LIKE '%Pen%' OR product_data.name LIKE '%Organizer%' OR product_data.name LIKE '%Stapler%' OR product_data.name LIKE '%Cabinet%') AND cat.name = 'Office Supplies' AND sup.name = 'Office Depot Pro'
    OR (product_data.name LIKE '%Chair%' OR product_data.name LIKE '%Desk%' OR product_data.name LIKE '%Bookshelf%' OR product_data.name LIKE '%Coffee Table%' OR product_data.name LIKE '%Dining%') AND cat.name = 'Furniture' AND sup.name = 'Furniture Factory'
    OR (product_data.name LIKE '%Drill%' OR product_data.name LIKE '%Screwdriver%' OR product_data.name LIKE '%Hammer%' OR product_data.name LIKE '%Tape%' OR product_data.name LIKE '%Toolbox%') AND cat.name = 'Tools & Hardware' AND sup.name = 'Hardware Hub'
ON CONFLICT (tenant_id, sku) DO NOTHING;

-- Insert customers
INSERT INTO customers (
    tenant_id, first_name, last_name, company, email, phone, 
    customer_type, credit_limit, loyalty_points, tier
) VALUES 
('00000000-0000-0000-0000-000000000000', 'Alice', 'Johnson', NULL, 'alice@email.com', '555-1001', 'individual', 500.00, 120, 'silver'),
('00000000-0000-0000-0000-000000000000', 'Bob', 'Smith', 'Smith Construction', 'bob@smithcon.com', '555-1002', 'business', 5000.00, 450, 'gold'),
('00000000-0000-0000-0000-000000000000', 'Carol', 'Williams', NULL, 'carol@email.com', '555-1003', 'individual', 300.00, 80, 'bronze'),
('00000000-0000-0000-0000-000000000000', 'David', 'Brown', 'Brown Retail', 'david@brownretail.com', '555-1004', 'business', 3000.00, 280, 'silver'),
('00000000-0000-0000-0000-000000000000', 'Eva', 'Davis', NULL, 'eva@email.com', '555-1005', 'individual', 200.00, 200, 'gold'),
('00000000-0000-0000-0000-000000000000', 'Frank', 'Miller', 'Miller Services', 'frank@miller.com', '555-1006', 'business', 2000.00, 150, 'bronze'),
('00000000-0000-0000-0000-000000000000', 'Grace', 'Wilson', NULL, 'grace@email.com', '555-1007', 'individual', 400.00, 90, 'silver'),
('00000000-0000-0000-0000-000000000000', 'Henry', 'Moore', 'Moore Tech', 'henry@mooretech.com', '555-1008', 'business', 8000.00, 650, 'platinum'),
('00000000-0000-0000-0000-000000000000', 'Iris', 'Taylor', NULL, 'iris@email.com', '555-1009', 'individual', 250.00, 110, 'silver'),
('00000000-0000-0000-0000-000000000000', 'Jack', 'Anderson', 'Anderson Consulting', 'jack@anderson.com', '555-1010', 'business', 4000.00, 320, 'gold')
ON CONFLICT (tenant_id, email) DO NOTHING;

-- Insert sample sales
WITH sale_numbers AS (
    SELECT generate_series(1, 20) as sale_num
),
customers AS (
    SELECT id FROM customers WHERE tenant_id = '00000000-0000-0000-0000-000000000000' LIMIT 10
),
products AS (
    SELECT id, price FROM products WHERE tenant_id = '00000000-0000-0000-0000-000000000000' LIMIT 20
),
users AS (
    SELECT id FROM users WHERE tenant_id = '00000000-0000-0000-0000-000000000000' AND role IN ('sales_staff', 'admin', 'manager') LIMIT 3
)
INSERT INTO sales (
    tenant_id, sale_number, customer_id, user_id, status,
    subtotal, tax_amount, total_amount, payment_method, payment_status
)
SELECT 
    '00000000-0000-0000-0000-000000000000',
    'SALE-' || LPAD(s.sale_num::TEXT, 6, '0'),
    (SELECT id FROM customers ORDER BY RANDOM() LIMIT 1),
    (SELECT id FROM users ORDER BY RANDOM() LIMIT 1),
    CASE WHEN s.sale_num <= 18 THEN 'completed' ELSE 'pending' END,
    random() * 500 + 50,
    random() * 50 + 5,
    random() * 550 + 55,
    CASE floor(random() * 4) 
        WHEN 0 THEN 'cash'
        WHEN 1 THEN 'card'
        WHEN 2 THEN 'check'
        ELSE 'transfer'
    END,
    CASE WHEN s.sale_num <= 18 THEN 'paid' ELSE 'pending' END
FROM sale_numbers s
ON CONFLICT (tenant_id, sale_number) DO NOTHING;

-- Insert sample inventory settings
INSERT INTO inventory_settings (
    tenant_id, track_batches, track_expiration, low_stock_alert_enabled,
    reorder_alert_enabled, barcode_enabled, multi_location_enabled
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    true,
    true,
    true,
    true,
    true,
    true
) ON CONFLICT (tenant_id) DO NOTHING;

-- Insert sample stock movements for some products
INSERT INTO stock_movements (
    tenant_id, product_id, movement_type, quantity, notes, created_by
)
SELECT 
    '00000000-0000-0000-0000-000000000000',
    p.id,
    CASE floor(random() * 3)
        WHEN 0 THEN 'purchase'
        WHEN 1 THEN 'sale'
        ELSE 'adjustment'
    END,
    CASE floor(random() * 2) WHEN 0 THEN floor(random() * 20 + 1) * -1 ELSE floor(random() * 20 + 1) END,
    CASE floor(random() * 3)
        WHEN 0 THEN 'Initial stock'
        WHEN 1 THEN 'Sale transaction'
        ELSE 'Inventory adjustment'
    END,
    (SELECT id FROM users WHERE role = 'inventory_manager' LIMIT 1)
FROM products p
WHERE p.tenant_id = '00000000-0000-0000-0000-000000000000'
LIMIT 50
ON CONFLICT DO NOTHING;

-- Insert sample employees
INSERT INTO employees (
    tenant_id, employee_number, first_name, last_name, email, 
    department, position, hire_date, employment_type, salary
) VALUES 
('00000000-0000-0000-0000-000000000000', 'EMP001', 'Robert', 'Johnson', 'robert.j@kits.dev', 'Management', 'General Manager', '2023-01-15', 'full_time', 75000.00),
('00000000-0000-0000-0000-000000000000', 'EMP002', 'Lisa', 'Chen', 'lisa.c@kits.dev', 'Sales', 'Sales Representative', '2023-02-01', 'full_time', 45000.00),
('00000000-0000-0000-0000-000000000000', 'EMP003', 'Michael', 'Rodriguez', 'michael.r@kits.dev', 'Warehouse', 'Warehouse Manager', '2023-03-10', 'full_time', 55000.00),
('00000000-0000-0000-0000-000000000000', 'EMP004', 'Jennifer', 'Lee', 'jennifer.l@kits.dev', 'HR', 'HR Specialist', '2023-04-05', 'full_time', 52000.00),
('00000000-0000-0000-0000-000000000000', 'EMP005', 'William', 'Taylor', 'william.t@kits.dev', 'IT', 'IT Support', '2023-05-20', 'full_time', 48000.00)
ON CONFLICT (employee_number) DO NOTHING;

-- Insert sample attendance records
WITH attendance_dates AS (
    SELECT generate_series(
        CURRENT_DATE - INTERVAL '30 days',
        CURRENT_DATE,
        INTERVAL '1 day'
    )::DATE as attendance_date
),
employees AS (
    SELECT id FROM employees WHERE tenant_id = '00000000-0000-0000-0000-000000000000'
)
INSERT INTO attendance (
    tenant_id, employee_id, date, clock_in, clock_out, status
)
SELECT 
    '00000000-0000-0000-0000-000000000000',
    e.id,
    ad.attendance_date,
    ad.attendance_date || ' 09:00:00'::TIMESTAMPTZ,
    ad.attendance_date || ' 17:30:00'::TIMESTAMPTZ,
    CASE WHEN random() > 0.1 THEN 'present' ELSE 'absent' END
FROM attendance_dates ad, employees e
WHERE ad.attendance_date NOT IN (CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE - INTERVAL '14 days') -- Random weekends off
AND random() > 0.05 -- 5% no-show rate
ON CONFLICT (tenant_id, employee_id, date) DO NOTHING;

-- Insert sample chart of accounts
INSERT INTO chart_of_accounts (
    tenant_id, account_number, account_name, account_type, opening_balance
) VALUES 
('00000000-0000-0000-0000-000000000000', '1000', 'Cash and Cash Equivalents', 'asset', 25000.00),
('00000000-0000-0000-0000-000000000000', '1200', 'Accounts Receivable', 'asset', 15000.00),
('00000000-0000-0000-0000-000000000000', '1400', 'Inventory', 'asset', 45000.00),
('00000000-0000-0000-0000-000000000000', '1700', 'Property, Plant and Equipment', 'asset', 120000.00),
('00000000-0000-0000-0000-000000000000', '2000', 'Accounts Payable', 'liability', 12000.00),
('00000000-0000-0000-0000-000000000000', '2100', 'Accrued Expenses', 'liability', 3500.00),
('00000000-0000-0000-0000-000000000000', '3000', 'Owner''s Equity', 'equity', 85000.00),
('00000000-0000-0000-0000-000000000000', '4000', 'Sales Revenue', 'revenue', 0.00),
('00000000-0000-0000-0000-000000000000', '5000', 'Cost of Goods Sold', 'expense', 0.00),
('00000000-0000-0000-0000-000000000000', '6000', 'Operating Expenses', 'expense', 0.00)
ON CONFLICT (tenant_id, account_number) DO NOTHING;

-- Insert sample notifications
INSERT INTO notifications (
    tenant_id, user_id, type, title, message, data
) VALUES 
('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'warning', 'Low Stock Alert', '5 products are below reorder point', '{"alert_count": 5}'),
('00000000-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'success', 'Sales Target Achieved', 'Monthly sales target exceeded by 15%', '{"achievement": "115%"}'),
('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'info', 'New Customer Registration', '3 new customers registered this week', '{"new_customers": 3}'),
('00000000-0000-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', 'error', 'Payroll Processing Error', 'Payroll calculation failed for 2 employees', '{"error_count": 2}'),
('00000000-0000-0000-0000-000000000000', '66666666-6666-6666-6666-666666666666', 'system', 'Backup Completed', 'Database backup completed successfully', '{"backup_size": "2.3GB"}')
ON CONFLICT DO NOTHING;

\echo 'Development seed data inserted successfully!'
