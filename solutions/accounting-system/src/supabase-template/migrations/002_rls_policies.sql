-- KiTS Hub Row Level Security Policies Migration
-- This migration enables RLS and creates comprehensive security policies

\echo 'Setting up Row Level Security policies...'

-- Enable Row Level Security on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_tenant_id', true)::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION user_has_permission(p_permission TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_permissions JSONB;
BEGIN
    SELECT permissions INTO user_permissions 
    FROM users 
    WHERE id = auth.uid() 
    AND tenant_id = get_current_tenant_id() 
    AND is_active = true;
    
    RETURN user_permissions ? p_permission OR user_permissions ? '*';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION user_has_role(p_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND tenant_id = get_current_tenant_id() 
        AND is_active = true 
        AND role = p_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TENANT TABLE POLICIES
-- Only system admins can manage tenants
CREATE POLICY "System admins can manage tenants" ON tenants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND tenant_id = '00000000-0000-0000-0000-000000000000'::UUID
        )
    );

-- USERS TABLE POLICIES
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (
        id = auth.uid() 
        AND tenant_id = get_current_tenant_id()
    );

CREATE POLICY "Managers can view team users" ON users
    FOR SELECT USING (
        tenant_id = get_current_tenant_id()
        AND (
            user_has_role('admin') 
            OR user_has_role('manager')
            OR user_has_permission('users.view')
        )
    );

CREATE POLICY "Admins can manage all users" ON users
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND user_has_role('admin')
    );

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (
        id = auth.uid() 
        AND tenant_id = get_current_tenant_id()
    );

-- USER SESSIONS POLICIES
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR ALL USING (
        user_id = auth.uid() 
        AND tenant_id = get_current_tenant_id()
    );

-- CATEGORIES POLICIES
CREATE POLICY "Team members can view categories" ON categories
    FOR SELECT USING (
        tenant_id = get_current_tenant_id()
        AND is_active = true
    );

CREATE POLICY "Inventory managers can manage categories" ON categories
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND (
            user_has_role('admin') 
            OR user_has_role('inventory_manager')
            OR user_has_permission('categories.manage')
        )
    );

-- SUPPLIERS POLICIES
CREATE POLICY "Team members can view suppliers" ON suppliers
    FOR SELECT USING (
        tenant_id = get_current_tenant_id()
        AND is_active = true
    );

CREATE POLICY "Inventory managers can manage suppliers" ON suppliers
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND (
            user_has_role('admin') 
            OR user_has_role('inventory_manager')
            OR user_has_permission('suppliers.manage')
        )
    );

-- LOCATIONS POLICIES
CREATE POLICY "Team members can view locations" ON locations
    FOR SELECT USING (
        tenant_id = get_current_tenant_id()
        AND is_active = true
    );

CREATE POLICY "Managers can manage locations" ON locations
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND (
            user_has_role('admin') 
            OR user_has_role('manager')
            OR user_has_permission('locations.manage')
        )
    );

-- PRODUCTS POLICIES
CREATE POLICY "Team members can view products" ON products
    FOR SELECT USING (
        tenant_id = get_current_tenant_id()
        AND is_active = true
    );

CREATE POLICY "Inventory managers can manage products" ON products
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND (
            user_has_role('admin') 
            OR user_has_role('inventory_manager')
            OR user_has_permission('products.manage')
        )
    );

CREATE POLICY "Sales staff can view products for sales" ON products
    FOR SELECT USING (
        tenant_id = get_current_tenant_id()
        AND is_active = true
        AND (
            user_has_role('sales_staff')
            OR user_has_permission('products.view')
        )
    );

-- PRODUCT VARIANTS POLICIES
CREATE POLICY "Team members can view product variants" ON product_variants
    FOR SELECT USING (
        product_id IN (
            SELECT id FROM products 
            WHERE tenant_id = get_current_tenant_id() AND is_active = true
        )
    );

CREATE POLICY "Inventory managers can manage variants" ON product_variants
    FOR ALL USING (
        product_id IN (
            SELECT id FROM products 
            WHERE tenant_id = get_current_tenant_id()
        )
        AND (
            user_has_role('admin') 
            OR user_has_role('inventory_manager')
            OR user_has_permission('products.manage')
        )
    );

-- PRODUCT BATCHES POLICIES
CREATE POLICY "Inventory managers can view batches" ON product_batches
    FOR SELECT USING (
        tenant_id = get_current_tenant_id()
        AND (
            user_has_role('admin') 
            OR user_has_role('inventory_manager')
            OR user_has_permission('batches.view')
        )
    );

CREATE POLICY "Inventory managers can manage batches" ON product_batches
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND (
            user_has_role('admin') 
            OR user_has_role('inventory_manager')
            OR user_has_permission('batches.manage')
        )
    );

-- SALES POLICIES
CREATE POLICY "Sales staff can view sales" ON sales
    FOR SELECT USING (
        tenant_id = get_current_tenant_id()
        AND (
            user_id = auth.uid()
            OR user_has_role('admin')
            OR user_has_role('manager')
            OR user_has_permission('sales.view')
        )
    );

CREATE POLICY "Sales staff can create sales" ON sales
    FOR INSERT WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND user_id = auth.uid()
        AND (
            user_has_role('sales_staff')
            OR user_has_permission('sales.create')
        )
    );

CREATE POLICY "Sales staff can update own sales" ON sales
    FOR UPDATE USING (
        tenant_id = get_current_tenant_id()
        AND user_id = auth.uid()
        AND (
            user_has_role('sales_staff')
            OR user_has_permission('sales.update')
        )
    );

CREATE POLICY "Admins can manage all sales" ON sales
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND user_has_role('admin')
    );

-- SALE ITEMS POLICIES
CREATE POLICY "Team members can view sale items" ON sale_items
    FOR SELECT USING (
        sale_id IN (
            SELECT id FROM sales 
            WHERE tenant_id = get_current_tenant_id()
            AND (
                user_id = auth.uid()
                OR user_has_role('admin')
                OR user_has_role('manager')
                OR user_has_permission('sales.view')
            )
        )
    );

CREATE POLICY "Sales staff can manage sale items" ON sale_items
    FOR ALL USING (
        sale_id IN (
            SELECT id FROM sales 
            WHERE tenant_id = get_current_tenant_id()
            AND (
                user_id = auth.uid()
                OR user_has_role('admin')
                OR user_has_permission('sales.manage')
            )
        )
    );

-- PAYMENTS POLICIES
CREATE POLICY "Team members can view payments" ON payments
    FOR SELECT USING (
        tenant_id = get_current_tenant_id()
        AND (
            user_has_role('admin')
            OR user_has_role('manager')
            OR user_has_permission('payments.view')
        )
    );

CREATE POLICY "Sales staff can manage payments" ON payments
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND (
            user_has_role('sales_staff')
            OR user_has_permission('payments.manage')
        )
    );

-- CUSTOMERS POLICIES
CREATE POLICY "Team members can view customers" ON customers
    FOR SELECT USING (
        tenant_id = get_current_tenant_id()
        AND is_active = true
        AND (
            user_has_role('admin')
            OR user_has_role('manager')
            OR user_has_role('sales_staff')
            OR user_has_permission('customers.view')
        )
    );

CREATE POLICY "Sales staff can manage customers" ON customers
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND (
            user_has_role('admin')
            OR user_has_role('sales_staff')
            OR user_has_permission('customers.manage')
        )
    );

-- CUSTOMER COMMUNICATIONS POLICIES
CREATE POLICY "Users can view own communications" ON customer_communications
    FOR SELECT USING (
        tenant_id = get_current_tenant_id()
        AND user_id = auth.uid()
    );

CREATE POLICY "Team members can view team communications" ON customer_communications
    FOR SELECT USING (
        tenant_id = get_current_tenant_id()
        AND (
            user_has_role('admin')
            OR user_has_role('manager')
            OR user_has_permission('communications.view')
        )
    );

CREATE POLICY "Users can manage communications" ON customer_communications
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND (
            user_id = auth.uid()
            OR user_has_role('admin')
            OR user_has_permission('communications.manage')
        )
    );

-- EMPLOYEES POLICIES
CREATE POLICY "HR managers can view employees" ON employees
    FOR SELECT USING (
        tenant_id = get_current_tenant_id()
        AND (
            user_has_role('admin')
            OR user_has_role('hr_manager')
            OR user_has_permission('employees.view')
        )
    );

CREATE POLICY "HR managers can manage employees" ON employees
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND (
            user_has_role('admin')
            OR user_has_role('hr_manager')
            OR user_has_permission('employees.manage')
        )
    );

CREATE POLICY "Employees can view own profile" ON employees
    FOR SELECT USING (
        user_id = auth.uid()
        AND tenant_id = get_current_tenant_id()
    );

-- ATTENDANCE POLICIES
CREATE POLICY "Employees can view own attendance" ON attendance
    FOR SELECT USING (
        employee_id IN (
            SELECT id FROM employees 
            WHERE user_id = auth.uid() AND tenant_id = get_current_tenant_id()
        )
    );

CREATE POLICY "HR managers can manage attendance" ON attendance
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND (
            user_has_role('admin')
            OR user_has_role('hr_manager')
            OR user_has_permission('attendance.manage')
        )
    );

-- PAYROLL POLICIES
CREATE POLICY "Accountants can manage payroll" ON payroll
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND (
            user_has_role('admin')
            OR user_has_role('accountant')
            OR user_has_permission('payroll.manage')
        )
    );

CREATE POLICY "Employees can view own payroll" ON payroll
    FOR SELECT USING (
        employee_id IN (
            SELECT id FROM employees 
            WHERE user_id = auth.uid() AND tenant_id = get_current_tenant_id()
        )
    );

-- CHART OF ACCOUNTS POLICIES
CREATE POLICY "Accountants can manage chart of accounts" ON chart_of_accounts
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND (
            user_has_role('admin')
            OR user_has_role('accountant')
            OR user_has_permission('accounts.manage')
        )
    );

-- TRANSACTIONS POLICIES
CREATE POLICY "Accountants can manage transactions" ON transactions
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND (
            user_has_role('admin')
            OR user_has_role('accountant')
            OR user_has_permission('transactions.manage')
        )
    );

-- TRANSACTION LINES POLICIES
CREATE POLICY "Accountants can view transaction lines" ON transaction_lines
    FOR SELECT USING (
        transaction_id IN (
            SELECT id FROM transactions 
            WHERE tenant_id = get_current_tenant_id()
        )
        AND (
            user_has_role('admin')
            OR user_has_role('accountant')
            OR user_has_permission('transactions.view')
        )
    );

CREATE POLICY "Accountants can manage transaction lines" ON transaction_lines
    FOR ALL USING (
        transaction_id IN (
            SELECT id FROM transactions 
            WHERE tenant_id = get_current_tenant_id()
        )
        AND (
            user_has_role('admin')
            OR user_has_role('accountant')
            OR user_has_permission('transactions.manage')
        )
    );

-- INVOICES POLICIES
CREATE POLICY "Accountants can manage invoices" ON invoices
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND (
            user_has_role('admin')
            OR user_has_role('accountant')
            OR user_has_permission('invoices.manage')
        )
    );

CREATE POLICY "Sales staff can view invoices" ON invoices
    FOR SELECT USING (
        tenant_id = get_current_tenant_id()
        AND (
            user_has_role('sales_staff')
            OR user_has_permission('invoices.view')
        )
    );

-- INVOICE ITEMS POLICIES
CREATE POLICY "Accountants can manage invoice items" ON invoice_items
    FOR ALL USING (
        invoice_id IN (
            SELECT id FROM invoices 
            WHERE tenant_id = get_current_tenant_id()
        )
        AND (
            user_has_role('admin')
            OR user_has_role('accountant')
            OR user_has_permission('invoices.manage')
        )
    );

-- ANALYTICS EVENTS POLICIES
CREATE POLICY "Users can view own analytics" ON analytics_events
    FOR SELECT USING (
        tenant_id = get_current_tenant_id()
        AND (
            user_id = auth.uid()
            OR user_has_role('admin')
            OR user_has_permission('analytics.view')
        )
    );

-- REPORTS POLICIES
CREATE POLICY "Users can view own reports" ON reports
    FOR SELECT USING (
        tenant_id = get_current_tenant_id()
        AND generated_by = auth.uid()
    );

CREATE POLICY "Managers can view all reports" ON reports
    FOR SELECT USING (
        tenant_id = get_current_tenant_id()
        AND (
            user_has_role('admin')
            OR user_has_role('manager')
            OR user_has_permission('reports.view')
        )
    );

CREATE POLICY "Users can manage own reports" ON reports
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND generated_by = auth.uid()
    );

-- INVENTORY SETTINGS POLICIES
CREATE POLICY "Inventory managers can manage settings" ON inventory_settings
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND (
            user_has_role('admin')
            OR user_has_role('inventory_manager')
            OR user_has_permission('settings.manage')
        )
    );

-- INVENTORY ALERTS POLICIES
CREATE POLICY "Team members can view alerts" ON inventory_alerts
    FOR SELECT USING (
        tenant_id = get_current_tenant_id()
        AND (
            user_has_role('admin')
            OR user_has_role('inventory_manager')
            OR user_has_permission('alerts.view')
        )
    );

CREATE POLICY "Inventory managers can manage alerts" ON inventory_alerts
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND (
            user_has_role('admin')
            OR user_has_role('inventory_manager')
            OR user_has_permission('alerts.manage')
        )
    );

-- STOCK MOVEMENTS POLICIES
CREATE POLICY "Inventory managers can view movements" ON stock_movements
    FOR SELECT USING (
        tenant_id = get_current_tenant_id()
        AND (
            user_has_role('admin')
            OR user_has_role('inventory_manager')
            OR user_has_permission('movements.view')
        )
    );

CREATE POLICY "Inventory managers can manage movements" ON stock_movements
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND (
            user_has_role('admin')
            OR user_has_role('inventory_manager')
            OR user_has_permission('movements.manage')
        )
    );

-- AUDIT LOGS POLICIES
CREATE POLICY "Admins can view audit logs" ON audit_logs
    FOR SELECT USING (
        tenant_id = get_current_tenant_id()
        AND user_has_role('admin')
    );

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (
        tenant_id = get_current_tenant_id()
        AND (user_id = auth.uid() OR user_id IS NULL)
    );

CREATE POLICY "Users can manage own notifications" ON notifications
    FOR UPDATE USING (
        tenant_id = get_current_tenant_id()
        AND user_id = auth.uid()
    );

-- API KEYS POLICIES
CREATE POLICY "Admins can manage API keys" ON api_keys
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND user_has_role('admin')
    );

-- WEBHOOKS POLICIES
CREATE POLICY "Admins can manage webhooks" ON webhooks
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND user_has_role('admin')
    );

-- WEBHOOK DELIVERIES POLICIES
CREATE POLICY "Admins can view webhook deliveries" ON webhook_deliveries
    FOR SELECT USING (
        webhook_id IN (
            SELECT id FROM webhooks 
            WHERE tenant_id = get_current_tenant_id()
        )
        AND user_has_role('admin')
    );

-- Security functions for tenant context validation
CREATE OR REPLACE FUNCTION validate_tenant_context()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure tenant_id is set and matches current context
    IF NEW.tenant_id IS NULL THEN
        NEW.tenant_id := get_current_tenant_id();
    ELSIF NEW.tenant_id != get_current_tenant_id() THEN
        RAISE EXCEPTION 'Tenant ID mismatch';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add tenant validation triggers
CREATE TRIGGER validate_categories_tenant 
    BEFORE INSERT OR UPDATE ON categories 
    FOR EACH ROW EXECUTE FUNCTION validate_tenant_context();

CREATE TRIGGER validate_suppliers_tenant 
    BEFORE INSERT OR UPDATE ON suppliers 
    FOR EACH ROW EXECUTE FUNCTION validate_tenant_context();

CREATE TRIGGER validate_locations_tenant 
    BEFORE INSERT OR UPDATE ON locations 
    FOR EACH ROW EXECUTE FUNCTION validate_tenant_context();

CREATE TRIGGER validate_products_tenant 
    BEFORE INSERT OR UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION validate_tenant_context();

CREATE TRIGGER validate_sales_tenant 
    BEFORE INSERT OR UPDATE ON sales 
    FOR EACH ROW EXECUTE FUNCTION validate_tenant_context();

CREATE TRIGGER validate_customers_tenant 
    BEFORE INSERT OR UPDATE ON customers 
    FOR EACH ROW EXECUTE FUNCTION validate_tenant_context();

-- Function to set tenant context
CREATE OR REPLACE FUNCTION set_tenant_context(p_tenant_id UUID)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_tenant_id', p_tenant_id::TEXT, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clear tenant context
CREATE OR REPLACE FUNCTION clear_tenant_context()
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_tenant_id', '', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

\echo 'Row Level Security policies setup completed!'
