/**
 * Resilient Email Provider
 * 
 * Wraps email provider calls with retry and circuit breaker patterns
 * to handle transient failures gracefully.
 */

import { EmailProvider, EmailOptions, EmailResult } from '../../types/email';
import { getResilienceWrapper } from '../../config/resilience';
import logger from '../../utils/logger';

export class ResilientEmailProvider implements EmailProvider {
  constructor(private provider: EmailProvider) {}

  async send(options: EmailOptions): Promise<EmailResult> {
    const resilience = getResilienceWrapper('email-service');

    try {
      return await resilience.execute(async () => {
        return await this.provider.send(options);
      });
    } catch (error: any) {
      logger.error('Email send failed after retries and circuit breaker:', error.message);

      // Return graceful failure response
      return {
        success: false,
        error: error.message || 'Email service temporarily unavailable',
        provider: this.provider.constructor.name,
      };
    }
  }

  async sendBulk(recipients: string[], options: Omit<EmailOptions, 'to'>): Promise<EmailResult[]> {
    const resilience = getResilienceWrapper('email-service');
    const results: EmailResult[] = [];

    for (const recipient of recipients) {
      try {
        const result = await resilience.executeWithFallback(
          async () => {
            return await this.provider.send({ ...options, to: recipient });
          },
          {
            success: false,
            error: 'Email service temporarily unavailable',
            provider: this.provider.constructor.name,
          }
        );
        results.push(result);
      } catch (error: any) {
        results.push({
          success: false,
          error: error.message || 'Unknown error',
          provider: this.provider.constructor.name,
        });
      }
    }

    return results;
  }

  async validateConfiguration(): Promise<boolean> {
    const resilience = getResilienceWrapper('email-service');

    try {
      return await resilience.executeWithFallback(
        async () => {
          return await this.provider.validateConfiguration();
        },
        false
      );
    } catch (error: any) {
      logger.error('Email configuration validation failed:', error.message);
      return false;
    }
  }

  /**
   * Get resilience metrics for email service
   */
  getResilienceMetrics() {
    const resilience = getResilienceWrapper('email-service');
    return resilience.getMetrics();
  }

  /**
   * Check if email service is available
   */
  isAvailable(): boolean {
    const resilience = getResilienceWrapper('email-service');
    return resilience.isAvailable();
  }

  /**
   * Reset resilience wrapper
   */
  resetResilience(): void {
    const resilience = getResilienceWrapper('email-service');
    resilience.reset();
  }
}
