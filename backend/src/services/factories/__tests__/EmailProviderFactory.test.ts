import { EmailProviderFactory } from '../EmailProviderFactory';
import { SendGridProvider } from '../../email/providers/sendgridProvider';
import { SESProvider } from '../../email/providers/sesProvider';
import { SMTPProvider } from '../../email/providers/smtpProvider';
import config from '../../../config';

// Mock the config module
jest.mock('../../../config', () => ({
  email: {
    provider: 'sendgrid',
    fromAddress: 'test@example.com',
    fromName: 'Test Company',
    sendgrid: {
      apiKey: 'test-api-key',
    },
    ses: {
      region: 'us-east-1',
      accessKeyId: 'test-key',
      secretAccessKey: 'test-secret',
    },
    smtp: {
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      user: 'test@example.com',
      password: 'test-password',
    },
  },
}));

// Mock the providers
jest.mock('../../email/providers/sendgridProvider');
jest.mock('../../email/providers/sesProvider');
jest.mock('../../email/providers/smtpProvider');

describe('EmailProviderFactory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProvider', () => {
    it('should create SendGrid provider when configured', () => {
      (config.email.provider as any) = 'sendgrid';
      
      const provider = EmailProviderFactory.createProvider();
      
      expect(SendGridProvider).toHaveBeenCalledWith(
        'test-api-key',
        'test@example.com',
        'Test Company'
      );
      expect(provider).toBeInstanceOf(SendGridProvider);
    });

    it('should create SES provider when configured', () => {
      (config.email.provider as any) = 'ses';
      
      const provider = EmailProviderFactory.createProvider();
      
      expect(SESProvider).toHaveBeenCalledWith(
        'us-east-1',
        'test-key',
        'test-secret',
        'test@example.com',
        'Test Company'
      );
      expect(provider).toBeInstanceOf(SESProvider);
    });

    it('should create SMTP provider when configured', () => {
      (config.email.provider as any) = 'smtp';
      
      const provider = EmailProviderFactory.createProvider();
      
      expect(SMTPProvider).toHaveBeenCalledWith(
        'smtp.example.com',
        587,
        false,
        'test@example.com',
        'test-password',
        'test@example.com',
        'Test Company'
      );
      expect(provider).toBeInstanceOf(SMTPProvider);
    });

    it('should throw error for unsupported provider', () => {
      (config.email.provider as any) = 'unsupported';
      
      expect(() => EmailProviderFactory.createProvider()).toThrow(
        'Unsupported email provider: unsupported'
      );
    });

    it('should throw error when SendGrid API key is missing', () => {
      (config.email.provider as any) = 'sendgrid';
      (config.email.sendgrid.apiKey as any) = '';
      
      expect(() => EmailProviderFactory.createProvider()).toThrow(
        'SendGrid API key is not configured'
      );
    });

    it('should throw error when SES configuration is incomplete', () => {
      (config.email.provider as any) = 'ses';
      (config.email.ses.region as any) = '';
      
      expect(() => EmailProviderFactory.createProvider()).toThrow(
        'AWS SES configuration is incomplete'
      );
    });

    it('should throw error when SMTP configuration is incomplete', () => {
      (config.email.provider as any) = 'smtp';
      (config.email.smtp.host as any) = '';
      
      expect(() => EmailProviderFactory.createProvider()).toThrow(
        'SMTP configuration is incomplete'
      );
    });

    it('should throw error when from address is not configured', () => {
      (config.email.provider as any) = 'sendgrid';
      (config.email.sendgrid.apiKey as any) = 'valid-key';
      (config.email.fromAddress as any) = '';
      
      expect(() => EmailProviderFactory.createProvider()).toThrow(
        'Email from address is not configured'
      );
    });
  });

  describe('getSupportedProviders', () => {
    it('should return list of supported providers', () => {
      const providers = EmailProviderFactory.getSupportedProviders();
      
      expect(providers).toEqual(['sendgrid', 'ses', 'smtp']);
    });
  });
});
