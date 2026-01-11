/**
 * KiTS Hub HTTP Client
 * Handles API communication between solutions with retry logic and error handling
 */

import { TenantContext, APIResponse, IntegrationConfig, IntegrationErrorCode } from './types';

export class HttpClient {
  private config: IntegrationConfig;

  constructor(config: IntegrationConfig) {
    this.config = config;
  }

  /**
   * Make authenticated API request to another solution
   */
  async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    context: TenantContext,
    data?: any,
    headers?: Record<string, string>
  ): Promise<APIResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const requestId = this.generateRequestId();

    try {
      const response = await this.makeRequestWithRetry(method, url, context, data, headers, requestId);
      
      return await this.parseResponse<T>(response);
    } catch (error) {
      return this.handleError(error, requestId);
    }
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequestWithRetry(
    method: string,
    url: string,
    context: TenantContext,
    data: any,
    headers: Record<string, string> | undefined,
    requestId: string,
    attempt: number = 1
  ): Promise<Response> {
    try {
      const authHeaders = this.getAuthHeaders(context);
      const requestHeaders = {
        ...authHeaders,
        ...headers,
        'X-Request-ID': requestId
      };

      const requestOptions: RequestInit = {
        method,
        headers: requestHeaders
      };

      if (data && method !== 'GET') {
        requestOptions.body = JSON.stringify(data);
      }

      const response = await fetch(url, {
        ...requestOptions,
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      if (attempt < this.config.retries && this.shouldRetry(error)) {
        const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
        await this.sleep(delay);
        return this.makeRequestWithRetry(method, url, context, data, headers, requestId, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Parse API response
   */
  private async parseResponse<T>(response: Response): Promise<APIResponse<T>> {
    try {
      const data = await response.json();
      
      // If response already follows APIResponse format, return as-is
      if (data && typeof data === 'object' && 'success' in data) {
        return data as APIResponse<T>;
      }

      // Otherwise, wrap in APIResponse format
      return {
        success: true,
        data: data as T,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: response.headers.get('X-Request-ID') || this.generateRequestId()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: IntegrationErrorCode.DATA_VALIDATION_ERROR,
          message: 'Failed to parse response',
          details: error.message
        }
      };
    }
  }

  /**
   * Handle errors and convert to APIResponse format
   */
  private handleError(error: any, requestId: string): APIResponse<never> {
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: {
          code: IntegrationErrorCode.TIMEOUT_ERROR,
          message: 'Request timeout',
          details: error.message
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId
        }
      };
    }

    if (error.message?.includes('HTTP 429')) {
      return {
        success: false,
        error: {
          code: IntegrationErrorCode.RATE_LIMIT_EXCEEDED,
          message: 'Rate limit exceeded',
          details: error.message
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId
        }
      };
    }

    if (error.message?.includes('HTTP 401')) {
      return {
        success: false,
        error: {
          code: IntegrationErrorCode.INVALID_API_KEY,
          message: 'Authentication failed',
          details: error.message
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId
        }
      };
    }

    if (error.message?.includes('HTTP 403')) {
      return {
        success: false,
        error: {
          code: IntegrationErrorCode.INSUFFICIENT_PERMISSIONS,
          message: 'Insufficient permissions',
          details: error.message
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId
        }
      };
    }

    if (error.message?.includes('HTTP 503') || error.message?.includes('HTTP 502')) {
      return {
        success: false,
        error: {
          code: IntegrationErrorCode.SERVICE_UNAVAILABLE,
          message: 'Service unavailable',
          details: error.message
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId
        }
      };
    }

    return {
      success: false,
      error: {
        code: IntegrationErrorCode.NETWORK_ERROR,
        message: 'Network error',
        details: error.message
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId
      }
    };
  }

  /**
   * Determine if error should trigger retry
   */
  private shouldRetry(error: any): boolean {
    if (error.name === 'AbortError') return false;
    if (error.message?.includes('HTTP 429')) return true;
    if (error.message?.includes('HTTP 503')) return true;
    if (error.message?.includes('HTTP 502')) return true;
    if (error.message?.includes('ECONNRESET')) return true;
    if (error.message?.includes('ETIMEDOUT')) return true;
    return false;
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(context: TenantContext): Record<string, string> {
    return {
      'X-Tenant-ID': context.tenant_id,
      'X-API-Key': context.api_key,
      'X-Timestamp': context.timestamp.toString(),
      'X-Signature': context.signature,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Convenience method for GET requests
   */
  async get<T>(endpoint: string, context: TenantContext, headers?: Record<string, string>): Promise<APIResponse<T>> {
    return this.request<T>('GET', endpoint, context, undefined, headers);
  }

  /**
   * Convenience method for POST requests
   */
  async post<T>(endpoint: string, context: TenantContext, data?: any, headers?: Record<string, string>): Promise<APIResponse<T>> {
    return this.request<T>('POST', endpoint, context, data, headers);
  }

  /**
   * Convenience method for PUT requests
   */
  async put<T>(endpoint: string, context: TenantContext, data?: any, headers?: Record<string, string>): Promise<APIResponse<T>> {
    return this.request<T>('PUT', endpoint, context, data, headers);
  }

  /**
   * Convenience method for DELETE requests
   */
  async delete<T>(endpoint: string, context: TenantContext, headers?: Record<string, string>): Promise<APIResponse<T>> {
    return this.request<T>('DELETE', endpoint, context, undefined, headers);
  }

  /**
   * Convenience method for PATCH requests
   */
  async patch<T>(endpoint: string, context: TenantContext, data?: any, headers?: Record<string, string>): Promise<APIResponse<T>> {
    return this.request<T>('PATCH', endpoint, context, data, headers);
  }
}
