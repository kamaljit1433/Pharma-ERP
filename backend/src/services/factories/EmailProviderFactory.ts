import config from '../../config';
import { EmailProvider } from '../../types/email';
import { SendGridProvider } from '../email/providers/sendgridProvider';
import { SESProvider } from '../email/providers/sesProvider';
import { SMTPProvider } from '../email/providers/smtpProvider';

/**
 * Factory for creating email service providers
 * Supports: SendGrid, AWS SES, SMTP
 * Provider is selected via EMAIL_PROVIDER environment variable
 */
export class EmailProviderFactory {
  /**
   * Create an email provider instance based on configuration
   * @throws Error if provider is not supported or configuration is invalid
   */
  static createProvider(): EmailProvider {
    const { provider, fromAddress, fromName } = config.email;

    this.validateConfiguration(provider);

    switch (provider) {
      case 'sendgrid':
        return this.createSendGridProvider(fromAddress, fromName);

      case 'ses':
        return this.createSESProvider(fromAddress, fromName);

      case 'smtp':
        return this.createSMTPProvider(fromAddress, fromName);

      default:
        throw new Error(`Unsupported email provider: ${provider}`);
    }
  }

  /**
   * Get list of supported providers
   */
  static getSupportedProviders(): string[] {
    return ['sendgrid', 'ses', 'smtp'];
  }

  /**
   * Validate that required configuration exists for the provider
   */
  private static validateConfiguration(provider: string): void {
    switch (provider) {
      case 'sendgrid':
        if (!config.email.sendgrid?.apiKey) {
          throw new Error('SendGrid API key is not configured (SENDGRID_API_KEY)');
        }
        break;

      case 'ses':
        if (!config.email.ses?.region || !config.email.ses?.accessKeyId || !config.email.ses?.secretAccessKey) {
          throw new Error('AWS SES configuration is incomplete (AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)');
        }
        break;

      case 'smtp':
        if (!config.email.smtp?.host || !config.email.smtp?.port) {
          throw new Error('SMTP configuration is incomplete (SMTP_HOST, SMTP_PORT)');
        }
        break;
    }

    if (!config.email.fromAddress) {
      throw new Error('Email from address is not configured (EMAIL_FROM_ADDRESS)');
    }
  }

  /**
   * Create SendGrid provider
   */
  private static createSendGridProvider(fromAddress: string, fromName: string): EmailProvider {
    return new SendGridProvider(
      config.email.sendgrid.apiKey,
      fromAddress,
      fromName
    );
  }

  /**
   * Create AWS SES provider
   */
  private static createSESProvider(fromAddress: string, fromName: string): EmailProvider {
    return new SESProvider(
      config.email.ses.region,
      config.email.ses.accessKeyId,
      config.email.ses.secretAccessKey,
      fromAddress,
      fromName
    );
  }

  /**
   * Create SMTP provider
   */
  private static createSMTPProvider(fromAddress: string, fromName: string): EmailProvider {
    return new SMTPProvider(
      config.email.smtp.host,
      config.email.smtp.port,
      config.email.smtp.secure,
      config.email.smtp.user,
      config.email.smtp.password,
      fromAddress,
      fromName
    );
  }
}
