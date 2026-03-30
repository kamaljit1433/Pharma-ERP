import nodemailer from 'nodemailer';
import { EmailProvider, EmailOptions, EmailResult } from '../../../types/email';

export class SMTPProvider implements EmailProvider {
  private transporter: nodemailer.Transporter;
  private fromAddress: string;
  private fromName: string;

  constructor(
    host: string,
    port: number,
    secure: boolean,
    user: string,
    password: string,
    fromAddress: string,
    fromName: string
  ) {
    this.fromAddress = fromAddress;
    this.fromName = fromName;
    
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass: password,
      },
      tls: {
        // Do not fail on invalid certs for development
        rejectUnauthorized: process.env['NODE_ENV'] === 'production',
      },
    });
  }

  async send(options: EmailOptions): Promise<EmailResult> {
    try {
      const mailOptions: nodemailer.SendMailOptions = {
        from: `${this.fromName} <${this.fromAddress}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      // Add CC recipients if provided
      if (options.cc) {
        mailOptions.cc = Array.isArray(options.cc) ? options.cc.join(', ') : options.cc;
      }

      // Add BCC recipients if provided
      if (options.bcc) {
        mailOptions.bcc = Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc;
      }

      // Add reply-to if provided
      if (options.replyTo) {
        mailOptions.replyTo = options.replyTo;
      }

      // Add attachments if provided
      if (options.attachments && options.attachments.length > 0) {
        mailOptions.attachments = options.attachments.map(attachment => ({
          filename: attachment.filename,
          content: attachment.content,
          contentType: attachment.contentType,
          cid: attachment.cid,
        }));
      }

      // Set priority if provided
      if (options.priority) {
        const priorityMap = {
          high: 'high',
          normal: 'normal',
          low: 'low',
        };
        mailOptions.priority = priorityMap[options.priority] as 'high' | 'normal' | 'low';
      }

      const info = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: info.messageId,
        provider: 'smtp',
      };
    } catch (error: any) {
      console.error('SMTP send error:', error);
      
      return {
        success: false,
        error: error.message || 'Unknown SMTP error occurred',
        provider: 'smtp',
      };
    }
  }

  async validateConfiguration(): Promise<boolean> {
    try {
      // Verify SMTP connection
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('SMTP configuration validation error:', error);
      return false;
    }
  }

  // Clean up the transporter when done
  close(): void {
    this.transporter.close();
  }
}