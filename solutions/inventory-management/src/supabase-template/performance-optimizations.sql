-- KiTS Hub Database Performance Optimizations
-- Indexes, triggers, and performance-enhancing functions

-- COMPREHENSIVE INDEXING STRATEGY

-- Core tenant and user indexes
CREATE INDEX CONCURRENTLY idx_users_tenant_id ON users(tenant_id);
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_users_role ON users(role);
CREATE INDEX CONCURRENTLY idx_users_is_active ON users(is_active);
CREATE INDEX CONCURRENTLY idx_users_tenant_active ON users(tenant_id, is_active);
CREATE INDEX CONCURRENTLY idx_users_tenant_role ON users(tenant_id, role);

-- User session indexes
CREATE INDEX CONCURRENTLY idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX CONCURRENTLY idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX CONCURRENTLY idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX CONCURRENTLY idx_user_sessions_expires ON user_sessions(expires_at);

-- Product and inventory indexes
CREATE INDEX CONCURRENTLY idx_products_tenant_id ON products(tenant_id);
CREATE INDEX CONCURRENTLY idx_products_sku ON products(sku);
CREATE INDEX CONCURRENTLY idx_products_category_id ON products(category_id);
CREATE INDEX CONCURRENTLY idx_products_supplier_id ON products(supplier_id);
CREATE INDEX CONCURRENTLY idx_products_is_active ON products(is_active);
CREATE INDEX CONCURRENTLY idx_products_low_stock ON products(low_stock);
CREATE INDEX CONCURRENTLY idx_products_track_inventory ON products(track_inventory);
CREATE INDEX CONCURRENTLY idx_products_tenant_active ON products(tenant_id, is_active);
CREATE INDEX CONCURRENTLY idx_products_tenant_category ON products(tenant_id, category_id);
CREATE INDEX CONCURRENTLY idx_products_tenant_low_stock ON products(tenant_id, low_stock);

-- Product variant indexes
CREATE INDEX CONCURRENTLY idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX CONCURRENTLY idx_product_variants_sku ON product_variants(sku);
CREATE INDEX CONCURRENTLY idx_product_variants_is_active ON product_variants(is_active);

-- Product batch indexes
CREATE INDEX CONCURRENTLY idx_product_batches_tenant_id ON product_batches(tenant_id);
CREATE INDEX CONCURRENTLY idx_product_batches_product_id ON product_batches(product_id);
CREATE INDEX CONCURRENTLY idx_product_batches_location_id ON product_batches(location_id);
CREATE INDEX CONCURRENTLY idx_product_batches_supplier_id ON product_batches(supplier_id);
CREATE INDEX CONCURRENTLY idx_product_batches_batch_number ON product_batches(batch_number);
CREATE INDEX CONCURRENTLY idx_product_batches_expiration ON product_batches(expiration_date);
CREATE INDEX CONCURRENTLY idx_product_batches_active ON product_batches(is_active);
CREATE INDEX CONCURRENTLY idx_product_batches_expiring_soon ON product_batches(expiration_date) 
    WHERE expiration_date <= NOW() + INTERVAL '30 days';

-- Sales and payment indexes
CREATE INDEX CONCURRENTLY idx_sales_tenant_id ON sales(tenant_id);
CREATE INDEX CONCURRENTLY idx_sales_created_at ON sales(created_at);
CREATE INDEX CONCURRENTLY idx_sales_customer_id ON sales(customer_id);
CREATE INDEX CONCURRENTLY idx_sales_user_id ON sales(user_id);
CREATE INDEX CONCURRENTLY idx_sales_location_id ON sales(location_id);
CREATE INDEX CONCURRENTLY idx_sales_status ON sales(status);
CREATE INDEX CONCURRENTLY idx_sales_date_range ON sales(created_at DESC);
CREATE INDEX CONCURRENTLY idx_sales_tenant_date ON sales(tenant_id, created_at DESC);
CREATE INDEX CONCURRENTLY idx_sales_tenant_status ON sales(tenant_id, status);

-- Sale items indexes
CREATE INDEX CONCURRENTLY idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX CONCURRENTLY idx_sale_items_product_id ON sale_items(product_id);
CREATE INDEX CONCURRENTLY idx_sale_items_variant_id ON sale_items(variant_id);

-- Payment indexes
CREATE INDEX CONCURRENTLY idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX CONCURRENTLY idx_payments_sale_id ON payments(sale_id);
CREATE INDEX CONCURRENTLY idx_payments_status ON payments(status);
CREATE INDEX CONCURRENTLY idx_payments_created_at ON payments(created_at);

-- Customer indexes
CREATE INDEX CONCURRENTLY idx_customers_tenant_id ON customers(tenant_id);
CREATE INDEX CONCURRENTLY idx_customers_email ON customers(email);
CREATE INDEX CONCURRENTLY idx_customers_is_active ON customers(is_active);
CREATE INDEX CONCURRENTLY idx_customers_tenant_active ON customers(tenant_id, is_active);
CREATE INDEX CONCURRENTLY idx_customers_tenant_type ON customers(tenant_id, customer_type);

-- Customer communications indexes
CREATE INDEX CONCURRENTLY idx_customer_communications_tenant_id ON customer_communications(tenant_id);
CREATE INDEX CONCURRENTLY idx_customer_communications_customer_id ON customer_communications(customer_id);
CREATE INDEX CONCURRENTLY idx_customer_communications_user_id ON customer_communications(user_id);
CREATE INDEX CONCURRENTLY idx_customer_communications_created_at ON customer_communications(created_at);
CREATE INDEX CONCURRENTLY idx_customer_communications_type ON customer_communications(type);

-- Employee and HR indexes
CREATE INDEX CONCURRENTLY idx_employees_tenant_id ON employees(tenant_id);
CREATE INDEX CONCURRENTLY idx_employees_user_id ON employees(user_id);
CREATE INDEX CONCURRENTLY idx_employees_employee_number ON employees(employee_number);
CREATE INDEX CONCURRENTLY idx_employees_department ON employees(department);
CREATE INDEX CONCURRENTLY idx_employees_is_active ON employees(is_active);
CREATE INDEX CONCURRENTLY idx_employees_manager_id ON employees(manager_id);

-- Attendance indexes
CREATE INDEX CONCURRENTLY idx_attendance_tenant_id ON attendance(tenant_id);
CREATE INDEX CONCURRENTLY idx_attendance_employee_id ON attendance(employee_id);
CREATE INDEX CONCURRENTLY idx_attendance_date ON attendance(date);
CREATE INDEX CONCURRENTLY idx_attendance_employee_date ON attendance(employee_id, date);

-- Payroll indexes
CREATE INDEX CONCURRENTLY idx_payroll_tenant_id ON payroll(tenant_id);
CREATE INDEX CONCURRENTLY idx_payroll_employee_id ON payroll(employee_id);
CREATE INDEX CONCURRENTLY idx_payroll_period ON payroll(pay_period_start, pay_period_end);
CREATE INDEX CONCURRENTLY idx_payroll_status ON payroll(status);

-- Accounting indexes
CREATE INDEX CONCURRENTLY idx_chart_of_accounts_tenant_id ON chart_of_accounts(tenant_id);
CREATE INDEX CONCURRENTLY idx_chart_of_accounts_type ON chart_of_accounts(account_type);
CREATE INDEX CONCURRENTLY idx_chart_of_accounts_parent_id ON chart_of_accounts(parent_id);
CREATE INDEX CONCURRENTLY idx_chart_of_accounts_active ON chart_of_accounts(is_active);

CREATE INDEX CONCURRENTLY idx_transactions_tenant_id ON transactions(tenant_id);
CREATE INDEX CONCURRENTLY idx_transactions_date ON transactions(transaction_date);
CREATE INDEX CONCURRENTLY idx_transactions_status ON transactions(status);
CREATE INDEX CONCURRENTLY idx_transactions_created_by ON transactions(created_by);

CREATE INDEX CONCURRENTLY idx_transaction_lines_transaction_id ON transaction_lines(transaction_id);
CREATE INDEX CONCURRENTLY idx_transaction_lines_account_id ON transaction_lines(account_id);

CREATE INDEX CONCURRENTLY idx_invoices_tenant_id ON invoices(tenant_id);
CREATE INDEX CONCURRENTLY idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX CONCURRENTLY idx_invoices_status ON invoices(status);
CREATE INDEX CONCURRENTLY idx_invoices_due_date ON invoices(due_date);
CREATE INDEX CONCURRENTLY idx_invoices_issue_date ON invoices(issue_date);

CREATE INDEX CONCURRENTLY idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX CONCURRENTLY idx_invoice_items_product_id ON invoice_items(product_id);

-- Analytics and reporting indexes
CREATE INDEX CONCURRENTLY idx_analytics_events_tenant_id ON analytics_events(tenant_id);
CREATE INDEX CONCURRENTLY idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX CONCURRENTLY idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX CONCURRENTLY idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX CONCURRENTLY idx_analytics_events_tenant_type ON analytics_events(tenant_id, event_type);
CREATE INDEX CONCURRENTLY idx_analytics_events_tenant_date ON analytics_events(tenant_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_reports_tenant_id ON reports(tenant_id);
CREATE INDEX CONCURRENTLY idx_reports_generated_by ON reports(generated_by);
CREATE INDEX CONCURRENTLY idx_reports_status ON reports(status);
CREATE INDEX CONCURRENTLY idx_reports_type ON reports(type);

-- System and audit indexes
CREATE INDEX CONCURRENTLY idx_inventory_settings_tenant_id ON inventory_settings(tenant_id);
CREATE INDEX CONCURRENTLY idx_inventory_alerts_tenant_id ON inventory_alerts(tenant_id);
CREATE INDEX CONCURRENTLY idx_inventory_alerts_product_id ON inventory_alerts(product_id);
CREATE INDEX CONCURRENTLY idx_inventory_alerts_is_read ON inventory_alerts(is_read);
CREATE INDEX CONCURRENTLY idx_inventory_alerts_urgency ON inventory_alerts(urgency);

CREATE INDEX CONCURRENTLY idx_stock_movements_tenant_id ON stock_movements(tenant_id);
CREATE INDEX CONCURRENTLY idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX CONCURRENTLY idx_stock_movements_created_at ON stock_movements(created_at);
CREATE INDEX CONCURRENTLY idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX CONCURRENTLY idx_stock_movements_tenant_product ON stock_movements(tenant_id, product_id);

CREATE INDEX CONCURRENTLY idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX CONCURRENTLY idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX CONCURRENTLY idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX CONCURRENTLY idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX CONCURRENTLY idx_audit_logs_tenant_table ON audit_logs(tenant_id, table_name);

CREATE INDEX CONCURRENTLY idx_notifications_tenant_id ON notifications(tenant_id);
CREATE INDEX CONCURRENTLY idx_notifications_user_id ON notifications(user_id);
CREATE INDEX CONCURRENTLY idx_notifications_is_read ON notifications(is_read);
CREATE INDEX CONCURRENTLY idx_notifications_type ON notifications(type);
CREATE INDEX CONCURRENTLY idx_notifications_expires_at ON notifications(expires_at);

CREATE INDEX CONCURRENTLY idx_api_keys_tenant_id ON api_keys(tenant_id);
CREATE INDEX CONCURRENTLY idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX CONCURRENTLY idx_api_keys_is_active ON api_keys(is_active);

CREATE INDEX CONCURRENTLY idx_webhooks_tenant_id ON webhooks(tenant_id);
CREATE INDEX CONCURRENTLY idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX CONCURRENTLY idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX CONCURRENTLY idx_webhook_deliveries_next_retry ON webhook_deliveries(next_retry_at);

-- PARTITIONING FOR LARGE TABLES

-- Partition analytics_events by month for better performance
CREATE TABLE analytics_events_y2024m01 PARTITION OF analytics_events
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE analytics_events_y2024m02 PARTITION OF analytics_events
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
CREATE TABLE analytics_events_y2024m03 PARTITION OF analytics_events
    FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');

-- PERFORMANCE FUNCTIONS AND TRIGGERS

-- Function to automatically update product stock and alerts
CREATE OR REPLACE FUNCTION update_product_stock_and_alerts()
RETURNS TRIGGER AS $$
DECLARE
    low_stock_threshold INTEGER;
    current_stock_level INTEGER;
BEGIN
    -- Update product stock value
    UPDATE products 
    SET 
        stock_value = current_stock * price,
        low_stock = (current_stock <= reorder_point),
        last_stock_update = NOW()
    WHERE id = NEW.product_id;
    
    -- Check if we need to create alerts
    SELECT current_stock, reorder_point INTO current_stock_level, low_stock_threshold
    FROM products 
    WHERE id = NEW.product_id;
    
    -- Create low stock alert if needed
    IF current_stock_level <= low_stock_threshold AND current_stock_level > 0 THEN
        INSERT INTO inventory_alerts (tenant_id, alert_type, product_id, urgency, message)
        SELECT 
            tenant_id,
            'low_stock',
            id,
            CASE 
                WHEN current_stock_level = 0 THEN 'critical'
                WHEN current_stock_level <= reorder_point / 2 THEN 'high'
                ELSE 'medium'
            END,
            'Product "' || name || '" is low on stock (' || current_stock_level || ' remaining)'
        FROM products
        WHERE id = NEW.product_id
        AND NOT EXISTS (
            SELECT 1 FROM inventory_alerts 
            WHERE product_id = NEW.product_id 
            AND alert_type = 'low_stock' 
            AND is_read = false
        );
    END IF;
    
    -- Create out of stock alert
    IF current_stock_level = 0 THEN
        INSERT INTO inventory_alerts (tenant_id, alert_type, product_id, urgency, message)
        SELECT 
            tenant_id,
            'out_of_stock',
            id,
            'critical',
            'Product "' || name || '" is out of stock'
        FROM products
        WHERE id = NEW.product_id
        AND NOT EXISTS (
            SELECT 1 FROM inventory_alerts 
            WHERE product_id = NEW.product_id 
            AND alert_type = 'out_of_stock' 
            AND is_read = false
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for stock movements
CREATE TRIGGER trigger_update_product_stock_and_alerts
    AFTER INSERT OR UPDATE ON stock_movements
    FOR EACH ROW EXECUTE FUNCTION update_product_stock_and_alerts();

-- Function to update customer statistics
CREATE OR REPLACE FUNCTION update_customer_statistics()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE customers 
    SET 
        total_purchases = COALESCE((
            SELECT COALESCE(SUM(total_amount), 0) 
            FROM sales 
            WHERE customer_id = NEW.customer_id 
            AND status = 'completed'
        ), 0),
        average_order_value = COALESCE((
            SELECT COALESCE(AVG(total_amount), 0) 
            FROM sales 
            WHERE customer_id = NEW.customer_id 
            AND status = 'completed'
        ), 0),
        last_purchase_date = (
            SELECT MAX(created_at) 
            FROM sales 
            WHERE customer_id = NEW.customer_id 
            AND status = 'completed'
        )
    WHERE id = NEW.customer_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for customer statistics
CREATE TRIGGER trigger_update_customer_statistics
    AFTER INSERT OR UPDATE ON sales
    FOR EACH ROW EXECUTE FUNCTION update_customer_statistics();

-- Function to maintain audit logs
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    audit_record JSONB;
BEGIN
    audit_record := jsonb_build_object(
        'old', CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        'new', CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
    
    INSERT INTO audit_logs (
        tenant_id,
        user_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        ip_address,
        user_agent
    ) VALUES (
        COALESCE(NEW.tenant_id, OLD.tenant_id),
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
        inet_client_addr(),
        current_setting('request.headers')::JSONB->>'user-agent'
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to critical tables
CREATE TRIGGER audit_products_trigger
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_sales_trigger
    AFTER INSERT OR UPDATE OR DELETE ON sales
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_customers_trigger
    AFTER INSERT OR UPDATE OR DELETE ON customers
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- PERFORMANCE MONITORING VIEWS

-- View for slow query analysis
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
    query,
    mean_time,
    calls,
    total_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
WHERE mean_time > 100 -- queries taking more than 100ms
ORDER BY mean_time DESC;

-- View for table size monitoring
CREATE OR REPLACE VIEW table_sizes AS
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- View for index usage
CREATE OR REPLACE VIEW index_usage AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- View for tenant usage statistics
CREATE OR REPLACE VIEW tenant_usage_stats AS
SELECT 
    t.id,
    t.name,
    t.plan_type,
    COUNT(DISTINCT u.id) as user_count,
    COUNT(DISTINCT p.id) as product_count,
    COUNT(DISTINCT s.id) as sale_count,
    pg_size_pretty(SUM(pg_total_relation_size('public.'||c.tablename))) as estimated_storage
FROM tenants t
LEFT JOIN users u ON t.id = u.tenant_id
LEFT JOIN products p ON t.id = p.tenant_id
LEFT JOIN sales s ON t.id = s.tenant_id
CROSS JOIN pg_tables c
WHERE c.schemaname = 'public'
GROUP BY t.id, t.name, t.plan_type
ORDER BY t.name;

-- CACHED VIEWS FOR COMMON QUERIES

-- Materialized view for product inventory summary
CREATE MATERIALIZED VIEW product_inventory_summary AS
SELECT 
    p.tenant_id,
    p.id,
    p.name,
    p.sku,
    p.current_stock,
    p.reorder_point,
    p.low_stock,
    p.stock_value,
    c.name as category_name,
    s.name as supplier_name,
    COUNT(pb.id) as batch_count
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN suppliers s ON p.supplier_id = s.id
LEFT JOIN product_batches pb ON p.id = pb.product_id AND pb.is_active = true
WHERE p.is_active = true
GROUP BY p.tenant_id, p.id, p.name, p.sku, p.current_stock, p.reorder_point, p.low_stock, p.stock_value, c.name, s.name;

CREATE UNIQUE INDEX idx_product_inventory_summary_id ON product_inventory_summary(id);
CREATE INDEX idx_product_inventory_summary_tenant ON product_inventory_summary(tenant_id);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_inventory_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY product_inventory_summary;
END;
$$ LANGUAGE plpgsql;

-- Schedule refresh (this would be handled by pg_cron or external scheduler)
-- SELECT cron.schedule('refresh-inventory-summary', '0 */6 * * *', 'SELECT refresh_inventory_summary();');

-- PERFORMANCE CONFIGURATION RECOMMENDATIONS
-- These settings should be applied at the database level

-- Recommended PostgreSQL settings for KiTS Hub:
-- shared_buffers = 256MB (25% of RAM on 1GB system)
-- effective_cache_size = 1GB (75% of RAM)
-- work_mem = 4MB
-- maintenance_work_mem = 64MB
-- checkpoint_completion_target = 0.9
-- wal_buffers = 16MB
-- default_statistics_target = 100
-- random_page_cost = 1.1 (for SSD)
-- effective_io_concurrency = 200 (for SSD)
