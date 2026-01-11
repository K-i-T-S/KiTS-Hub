# CloudFlare CDN Configuration for KiTS Hub

# Primary domain configuration
resource "cloudflare_zone" "main" {
  zone = "kits-hub.com"
}

# DNS Records for all services
resource "cloudflare_record" "inventory" {
  zone_id = cloudflare_zone.main.zone_id
  name    = "inventory"
  value   = aws_lb.main.dns_name
  type    = "CNAME"
  ttl     = 300
  proxied = true
}

resource "cloudflare_record" "pos" {
  zone_id = cloudflare_zone.main.zone_id
  name    = "pos"
  value   = aws_lb.main.dns_name
  type    = "CNAME"
  ttl     = 300
  proxied = true
}

resource "cloudflare_record" "crm" {
  zone_id = cloudflare_zone.main.zone_id
  name    = "crm"
  value   = aws_lb.main.dns_name
  type    = "CNAME"
  ttl     = 300
  proxied = true
}

resource "cloudflare_record" "hr" {
  zone_id = cloudflare_zone.main.zone_id
  name    = "hr"
  value   = aws_lb.main.dns_name
  type    = "CNAME"
  ttl     = 300
  proxied = true
}

resource "cloudflare_record" "accounting" {
  zone_id = cloudflare_zone.main.zone_id
  name    = "accounting"
  value   = aws_lb.main.dns_name
  type    = "CNAME"
  ttl     = 300
  proxied = true
}

resource "cloudflare_record" "analytics" {
  zone_id = cloudflare_zone.main.zone_id
  name    = "analytics"
  value   = aws_lb.main.dns_name
  type    = "CNAME"
  ttl     = 300
  proxied = true
}

# SSL/TLS Configuration
resource "cloudflare_ssl" "main" {
  zone_id          = cloudflare_zone.main.zone_id
  ssl_method       = "strict"
  strict_min_https = "off"
  tls_1_3          = "on"
}

# Page Rules for caching
resource "cloudflare_page_rule" "inventory_cache" {
  zone_id  = cloudflare_zone.main.zone_id
  target   = "inventory.kits-hub.com/*"
  priority = 1

  actions {
    cache_level = "cache_everything"
    edge_cache_ttl = 86400
    browser_cache_ttl = 86400
    minify {
      html = "on"
      css  = "on"
      js   = "on"
    }
    security_level = "medium"
    always_online = "on"
  }
}

resource "cloudflare_page_rule" "api_no_cache" {
  zone_id  = cloudflare_zone.main.zone_id
  target   = "*.kits-hub.com/api/*"
  priority = 2

  actions {
    cache_level = "bypass"
    security_level = "high"
    waf = "on"
  }
}

resource "cloudflare_page_rule" "auth_no_cache" {
  zone_id  = cloudflare_zone.main.zone_id
  target   = "*.kits-hub.com/auth/*"
  priority = 3

  actions {
    cache_level = "bypass"
    security_level = "high"
    waf = "on"
  }
}

# WAF Configuration
resource "cloudflare_waf_rule" "sql_injection" {
  zone_id     = cloudflare_zone.main.zone_id
  mode        = "on"
  rule_group  = "sql_injection"
  description = "Block SQL injection attempts"
}

resource "cloudflare_waf_rule" "xss_protection" {
  zone_id     = cloudflare_zone.main.zone_id
  mode        = "on"
  rule_group  = "xss"
  description = "Block XSS attacks"
}

resource "cloudflare_waf_rule" "rate_limit" {
  zone_id     = cloudflare_zone.main.zone_id
  mode        = "on"
  rule_group  = "rate_limit"
  description = "Rate limit API endpoints"
}

# Argo Smart Routing
resource "cloudflare_argo" "main" {
  zone_id = cloudflare_zone.main.zone_id
  smart_routing = "on"
}

# Load Balancer Pool
resource "cloudflare_load_balancer_pool" "inventory" {
  name = "inventory-pool"
  check_interval = 60
  load_fallback = "any"
  description = "Inventory service pool"
  
  origins {
    name    = "inventory-1"
    address = "inventory-management-1.kits-hub.internal"
    weight  = 1
    header  {
      Host = ["inventory.kits-hub.com"]
    }
    enabled = true
  }
  
  origins {
    name    = "inventory-2"
    address = "inventory-management-2.kits-hub.internal"
    weight  = 1
    header  {
      Host = ["inventory.kits-hub.com"]
    }
    enabled = true
  }
  
  origins {
    name    = "inventory-3"
    address = "inventory-management-3.kits-hub.internal"
    weight  = 1
    header  {
      Host = ["inventory.kits-hub.com"]
    }
    enabled = true
  }
}

# Load Balancer Monitor
resource "cloudflare_load_balancer_monitor" "inventory" {
  name = "inventory-monitor"
  description = "Monitor for inventory service"
  
  path = "/api/health"
  method = "GET"
  header {
    Host = ["inventory.kits-hub.com"]
  }
  timeout = 5
  interval = 60
  retries = 3
  expected_codes = "200"
  expected_body = "healthy"
}

# Load Balancer
resource "cloudflare_load_balancer" "inventory" {
  zone_id = cloudflare_zone.main.zone_id
  name = "inventory-lb"
  fallback_domain = "inventory-backup.kits-hub.com"
  default_pool_ids = [cloudflare_load_balancer_pool.inventory.id]
  description = "Load balancer for inventory service"
  
  pop_pools {
    pool_id = cloudflare_load_balancer_pool.inventory.id
    pop = "LAX"
  }
  
  pop_pools {
    pool_id = cloudflare_load_balancer_pool.inventory.id
    pop = "SFO"
  }
  
  pop_pools {
    pool_id = cloudflare_load_balancer_pool.inventory.id
    pop = "IAD"
  }
  
  session_affinity = "cookie"
  proxied = true
  ttl = 30
  steer = "least_outstanding_requests"
}

# DDoS Protection
resource "cloudflare_rate_limit" "api_ddos" {
  zone_id     = cloudflare_zone.main.zone_id
  threshold  = 1000
  period      = 60
  description = "API DDoS protection"
  
  match {
    request {
      url_pattern = "*kits-hub.com/api/*"
      schemes     = ["HTTPS"]
      methods     = ["GET", "POST", "PUT", "DELETE"]
    }
  }
  
  action {
    mode = "simulate"
    timeout = 86400
    response {
      content_type = "application/json"
      body = "{\"error\": \"Rate limit exceeded\"}"
    }
  }
}

# Analytics and Logging
resource "cloudflare_logpush_job" "main" {
  enabled = true
  name = "kits-hub-logs"
  dataset = "http_requests"
  destination_conf = "s3://kits-hub-logs"
  logpull_options = "fields=ClientIP,ClientRequestHost,ClientRequestMethod,ClientRequestURI,EdgeStartTimestamp,EdgeResponseBytes,EdgeResponseStatus,EdgeEndTimestamp"
  frequency = "high"
}
