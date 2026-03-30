import sgMail from '@sendgrid/mail';
import { EmailProvider, EmailOptions, EmailResult } from '../../../types/email';

export class SendGridProvider implements EmailProvider {
  private apiKey: string;
  private fromAddress: string;
  private fromName: string;

  constructor(apiKey: string, fromAddress: string, fromName: string) {
    this.apiKey = apiKey;
    this.fromAddress = fromAddress;
    this.fromName = fromName;
    
    if (this.apiKey) {
      sgMail.setApiKey(this.apiKey);
    }
  }

  async send(options: EmailOptions): Promise<EmailResult> {
    try {
      if (!this.apiKey) {
        throw new Error('SendGrid API key is not configured');
      }

      const msg: any = {
        to: Array.isArray(options.to) ? options.to : [options.to],
        from: {
          email: this.fromAddress,
          name: this.fromName,
        },
        subject: options.subject,
      };

      // Add content based on what's available
      if (options.html) {
        msg.html = options.html;
      }
      if (options.text) {
        msg.text = options.text;
      }

      // Add CC recipients if provided
      if (options.cc) {
        msg.cc = Array.isArray(options.cc) ? options.cc : [options.cc];
      }

      // Add BCC recipients if provided
      if (options.bcc) {
        msg.bcc = Array.isArray(options.bcc) ? options.bcc : [options.bcc];
      }

      // Add reply-to if provided
      if (options.replyTo) {
        msg.replyTo = options.replyTo;
      }

      // Add attachments if provided
      if (options.attachments && options.attachments.length > 0) {
        msg.attachments = options.attachments.map(attachment => ({
          filename: attachment.filename,
          content: Buffer.isBuffer(attachment.content) 
            ? attachment.content.toString('base64')
            : Buffer.from(attachment.content).toString('base64'),
          ...(attachment.contentType && { type: attachment.contentType }),
          disposition: attachment.cid ? 'inline' : 'attachment',
          ...(attachment.cid && { contentId: attachment.cid }),
        }));
      }

      // Set priority if provided (SendGrid doesn't support priority directly)
      // We'll skip this for SendGrid as it doesn't have a priority field

      const response = await sgMail.send(msg);
      
      return {
        success: true,
        messageId: response[0].headers['x-message-id'] as string,
        provider: 'sendgrid',
      };
    } catch (error: any) {
      console.error('SendGrid send error:', error);
      
      let errorMessage = 'Unknown error occurred';
      if (error.response?.body?.errors) {
        errorMessage = error.response.body.errors.map((e: any) => e.message).join(', ');
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
        provider: 'sendgrid',
      };
    }
  }

  async validateConfiguration(): Promise<boolean> {
    try {
      if (!this.apiKey) {
        return false;
      }

      // Test the API key by attempting to validate configuration
      // SendGrid doesn't have a simple validation endpoint, so we'll just check if API key exists
      return true;
    } catch (error) {
      console.error('SendGrid configuration validation error:', error);
      return false;
    }
  }
}