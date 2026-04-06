import { SESClient, SendEmailCommand, SendRawEmailCommand } from '@aws-sdk/client-ses';
import { EmailProvider, EmailOptions, EmailResult } from '../../../types/email';

export class SESProvider implements EmailProvider {
  private sesClient: SESClient;
  private fromAddress: string;
  private fromName: string;

  constructor(
    region: string,
    accessKeyId: string,
    secretAccessKey: string,
    fromAddress: string,
    fromName: string
  ) {
    this.fromAddress = fromAddress;
    this.fromName = fromName;
    
    this.sesClient = new SESClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async send(options: EmailOptions): Promise<EmailResult> {
    try {
      const fromEmail = `${this.fromName} <${this.fromAddress}>`;
      
      // If we have attachments, use SendRawEmailCommand
      if (options.attachments && options.attachments.length > 0) {
        return await this.sendRawEmail(options, fromEmail);
      }

      // For simple emails without attachments, use SendEmailCommand
      const destinations = Array.isArray(options.to) ? options.to : [options.to];
      
      const command = new SendEmailCommand({
        Source: fromEmail,
        Destination: {
          ToAddresses: destinations,
          CcAddresses: options.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : undefined,
          BccAddresses: options.bcc ? (Array.isArray(options.bcc) ? options.bcc : [options.bcc]) : undefined,
        },
        Message: {
          Subject: {
            Data: options.subject,
            Charset: 'UTF-8',
          },
          Body: {
            Text: options.text ? {
              Data: options.text,
              Charset: 'UTF-8',
            } : undefined,
            Html: options.html ? {
              Data: options.html,
              Charset: 'UTF-8',
            } : undefined,
          },
        },
        ReplyToAddresses: options.replyTo ? [options.replyTo] : undefined,
      });

      const response = await this.sesClient.send(command);
      
      return {
        success: true,
        messageId: response.MessageId || 'unknown',
        provider: 'ses',
      };
    } catch (error: any) {
      console.error('SES send error:', error);
      
      return {
        success: false,
        error: error.message || 'Unknown SES error occurred',
        provider: 'ses',
      };
    }
  }

  private async sendRawEmail(options: EmailOptions, fromEmail: string): Promise<EmailResult> {
    try {
      // Build raw email with attachments
      const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      const destinations = Array.isArray(options.to) ? options.to : [options.to];
      
      let rawMessage = '';
      
      // Headers
      rawMessage += `From: ${fromEmail}\r\n`;
      rawMessage += `To: ${destinations.join(', ')}\r\n`;
      
      if (options.cc) {
        const ccAddresses = Array.isArray(options.cc) ? options.cc : [options.cc];
        rawMessage += `Cc: ${ccAddresses.join(', ')}\r\n`;
      }
      
      if (options.bcc) {
        const bccAddresses = Array.isArray(options.bcc) ? options.bcc : [options.bcc];
        rawMessage += `Bcc: ${bccAddresses.join(', ')}\r\n`;
      }
      
      if (options.replyTo) {
        rawMessage += `Reply-To: ${options.replyTo}\r\n`;
      }
      
      rawMessage += `Subject: ${options.subject}\r\n`;
      rawMessage += `MIME-Version: 1.0\r\n`;
      rawMessage += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n`;
      
      // Body content
      rawMessage += `--${boundary}\r\n`;
      rawMessage += `Content-Type: multipart/alternative; boundary="${boundary}_alt"\r\n\r\n`;
      
      if (options.text) {
        rawMessage += `--${boundary}_alt\r\n`;
        rawMessage += `Content-Type: text/plain; charset=UTF-8\r\n\r\n`;
        rawMessage += `${options.text}\r\n\r\n`;
      }
      
      if (options.html) {
        rawMessage += `--${boundary}_alt\r\n`;
        rawMessage += `Content-Type: text/html; charset=UTF-8\r\n\r\n`;
        rawMessage += `${options.html}\r\n\r\n`;
      }
      
      rawMessage += `--${boundary}_alt--\r\n`;
      
      // Attachments
      if (options.attachments) {
        for (const attachment of options.attachments) {
          rawMessage += `--${boundary}\r\n`;
          rawMessage += `Content-Type: ${attachment.contentType || 'application/octet-stream'}\r\n`;
          rawMessage += `Content-Disposition: attachment; filename="${attachment.filename}"\r\n`;
          rawMessage += `Content-Transfer-Encoding: base64\r\n`;
          
          if (attachment.cid) {
            rawMessage += `Content-ID: <${attachment.cid}>\r\n`;
          }
          
          rawMessage += `\r\n`;
          
          const content = Buffer.isBuffer(attachment.content) 
            ? attachment.content 
            : Buffer.from(attachment.content);
          rawMessage += content.toString('base64') + '\r\n\r\n';
        }
      }
      
      rawMessage += `--${boundary}--\r\n`;
      
      const command = new SendRawEmailCommand({
        Source: fromEmail,
        Destinations: [
          ...destinations,
          ...(options.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : []),
          ...(options.bcc ? (Array.isArray(options.bcc) ? options.bcc : [options.bcc]) : []),
        ],
        RawMessage: {
          Data: Buffer.from(rawMessage),
        },
      });

      const response = await this.sesClient.send(command);
      
      return {
        success: true,
        messageId: response.MessageId || 'unknown',
        provider: 'ses',
      };
    } catch (error: any) {
      console.error('SES raw send error:', error);
      
      return {
        success: false,
        error: error.message || 'Unknown SES error occurred',
        provider: 'ses',
      };
    }
  }

  async validateConfiguration(): Promise<boolean> {
    try {
      // Test SES configuration by checking send quota
      const { GetSendQuotaCommand } = await import('@aws-sdk/client-ses');
      
      const command = new GetSendQuotaCommand({});
      await this.sesClient.send(command);
      
      return true;
    } catch (error) {
      console.error('SES configuration validation error:', error);
      return false;
    }
  }
}