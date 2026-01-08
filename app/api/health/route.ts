/**
 * Health check endpoint for production monitoring
 * Provides system status and health metrics
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { supabaseAdmin } from '@/lib/supabase'
import { validateEnvironment, isProduction } from '@/lib/env-config'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const requestId = `health-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  const requestLogger = logger.withRequest(requestId)
  
  try {
    requestLogger.info('Health check started')

    // Check environment configuration
    const envValidation = validateEnvironment()
    if (!envValidation.isValid) {
      requestLogger.error('Environment validation failed', { error: envValidation.error })
      return NextResponse.json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        requestId,
        error: 'Environment validation failed',
        details: envValidation.error,
        checks: {
          environment: 'failed',
          database: 'unknown',
          services: 'unknown'
        }
      }, { status: 500 })
    }

    const checks: Record<string, any> = {
      environment: 'healthy',
      database: 'checking',
      services: 'checking'
    }

    // Check database connectivity
    let databaseHealthy = false
    let databaseLatency = 0
    
    try {
      const dbStartTime = Date.now()
      const { data, error } = await supabaseAdmin!
        .from('provisioning_queue')
        .select('id')
        .limit(1)
      
      databaseLatency = Date.now() - dbStartTime
      
      if (error) {
        throw error
      }
      
      databaseHealthy = true
      checks.database = 'healthy'
      requestLogger.info('Database health check passed', { latency: databaseLatency })
    } catch (error) {
      checks.database = 'failed'
      checks.database_error = error instanceof Error ? error.message : 'Unknown database error'
      requestLogger.error('Database health check failed', { error: error instanceof Error ? error.message : 'Unknown error' })
    }

    // Check external services (email service)
    let emailServiceHealthy = true
    try {
      const emailService = process.env.EMAIL_SERVICE || 'resend'
      const emailApiKey = process.env.EMAIL_SERVICE_API_KEY
      
      if (!emailApiKey && isProduction()) {
        emailServiceHealthy = false
        checks.email_service = 'failed'
        checks.email_error = 'Email service API key not configured in production'
      } else {
        checks.email_service = 'healthy'
      }
    } catch (error) {
      emailServiceHealthy = false
      checks.email_service = 'failed'
      checks.email_error = error instanceof Error ? error.message : 'Unknown email service error'
    }

    checks.services = emailServiceHealthy ? 'healthy' : 'degraded'

    // Calculate overall health
    const overallHealthy = databaseHealthy && envValidation.isValid
    
    // System metrics
    const metrics = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      requestId,
      latency: Date.now() - startTime,
      databaseLatency
    }

    const healthStatus = overallHealthy ? 'healthy' : 'unhealthy'
    const httpStatus = overallHealthy ? 200 : 503

    requestLogger.info('Health check completed', {
      status: healthStatus,
      latency: metrics.latency,
      databaseLatency: metrics.databaseLatency,
      databaseHealthy,
      emailServiceHealthy
    })

    return NextResponse.json({
      status: healthStatus,
      timestamp: metrics.timestamp,
      requestId,
      uptime: metrics.uptime,
      version: process.env.npm_package_version || '1.0.0',
      environment: metrics.environment,
      checks,
      metrics: {
        latency: `${metrics.latency}ms`,
        databaseLatency: `${metrics.databaseLatency}ms`,
        memory: {
          used: `${Math.round(metrics.memory.heapUsed / 1024 / 1024)}MB`,
          total: `${Math.round(metrics.memory.heapTotal / 1024 / 1024)}MB`,
          external: `${Math.round(metrics.memory.external / 1024 / 1024)}MB`
        },
        node: metrics.nodeVersion,
        platform: metrics.platform
      }
    }, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    requestLogger.error('Health check failed', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      requestId,
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      checks: {
        environment: 'failed',
        database: 'unknown',
        services: 'unknown'
      },
      metrics: {
        latency: `${Date.now() - startTime}ms`,
        uptime: process.uptime(),
        memory: process.memoryUsage()
      }
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
}

// Also support HEAD requests for simple health checks
export async function HEAD(request: NextRequest) {
  try {
    // Quick environment check
    const envValidation = validateEnvironment()
    
    if (!envValidation.isValid) {
      return new Response(null, { status: 503 })
    }

    // Quick database check
    try {
      await supabaseAdmin!.from('provisioning_queue').select('id').limit(1)
      return new Response(null, { status: 200 })
    } catch (error) {
      return new Response(null, { status: 503 })
    }
  } catch (error) {
    return new Response(null, { status: 503 })
  }
}
