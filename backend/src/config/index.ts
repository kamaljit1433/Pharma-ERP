import path from 'path';
import fs from 'fs';

// Manually parse .env file without using dotenv
const envPath = path.join(__dirname, '../../.env');

if (fs.existsSync(envPath)) {
  const fileContent = fs.readFileSync(envPath, 'utf-8');
  // Remove BOM if present
  const cleanContent = fileContent.replace(/^\uFEFF/, '');
  
  // Parse the .env file manually
  const lines = cleanContent.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').trim();
    
    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

interface Config {
  env: string;
  port: number;
  apiVersion: string;
  frontendUrl: string;
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
    poolMin: number;
    poolMax: number;
  };
  redis: {
    host: string;
    port: number;
    password: string;
    db: number;
  };
  session: {
    secret: string;
    maxAge: number;
  };
  jwt: {
    secret: string;
    refreshSecret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  cors: {
    origin: string;
  };
  upload: {
    maxFileSize: number;
    allowedFileTypes: string[];
    categoryLimits: {
      [key: string]: {
        maxFileSize: number;
        allowedFileTypes: string[];
      };
    };
  };
  fileStorage: {
    provider: 'local' | 's3' | 'gcs';
    s3?: {
      region: string;
      bucket: string;
      accessKeyId: string;
      secretAccessKey: string;
    };
    gcs?: {
      projectId: string;
      bucket: string;
      keyFile: string;
    };
    urlExpiry: number;
  };
  email: {
    provider: 'sendgrid' | 'ses' | 'smtp';
    fromName: string;
    fromAddress: string;
    sendgrid: {
      apiKey: string;
    };
    ses: {
      region: string;
      accessKeyId: string;
      secretAccessKey: string;
    };
    smtp: {
      host: string;
      port: number;
      secure: boolean;
      user: string;
      password: string;
    };
    templateDir: string;
  };
  notification: {
    provider: 'fcm' | 'disabled';
  };
  logging: {
    level: string;
  };
  firebase: {
    enabled: boolean;
    projectId: string;
    privateKeyId: string;
    privateKey: string;
    clientEmail: string;
    clientId: string;
    authUri: string;
    tokenUri: string;
    authProviderX509CertUrl: string;
    clientX509CertUrl: string;
  };
}

const config: Config = {
  env: process.env['NODE_ENV'] || 'development',
  port: parseInt(process.env['PORT'] || '3000', 10),
  apiVersion: process.env['API_VERSION'] || 'v1',
  frontendUrl: process.env['FRONTEND_URL'] || process.env['CORS_ORIGIN'] || 'http://localhost:5173',
  database: {
    host: process.env['DB_HOST'] || 'localhost',
    port: parseInt(process.env['DB_PORT'] || '5432', 10),
    name: process.env['DB_NAME'] || 'employee_management_system',
    user: process.env['DB_USER'] || 'postgres',
    password: process.env['DB_PASSWORD'] || '',
    poolMin: parseInt(process.env['DB_POOL_MIN'] || '2', 10),
    poolMax: parseInt(process.env['DB_POOL_MAX'] || '10', 10),
  },
  redis: {
    host: process.env['REDIS_HOST'] || 'localhost',
    port: parseInt(process.env['REDIS_PORT'] || '6379', 10),
    password: process.env['REDIS_PASSWORD'] || '',
    db: parseInt(process.env['REDIS_DB'] || '0', 10),
  },
  session: {
    secret: (() => {
      const s = process.env['SESSION_SECRET'];
      if (!s) {
        throw new Error('FATAL: SESSION_SECRET environment variable is required');
      }
      return s;
    })(),
    maxAge: parseInt(process.env['SESSION_MAX_AGE'] || '86400000', 10),
  },
  jwt: {
    secret: (() => {
      const s = process.env['JWT_SECRET'];
      if (!s) {
        throw new Error('FATAL: JWT_SECRET environment variable is required');
      }
      return s;
    })(),
    refreshSecret: (() => {
      const s = process.env['JWT_REFRESH_SECRET'] || process.env['JWT_SECRET'];
      if (!s) {
        throw new Error('FATAL: JWT_REFRESH_SECRET environment variable is required');
      }
      return s;
    })(),
    expiresIn: process.env['JWT_EXPIRES_IN'] || '15m',
    refreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] || '7d',
  },
  cors: {
    origin: process.env['CORS_ORIGIN'] || 'http://localhost:5173',
  },
  upload: {
    maxFileSize: parseInt(process.env['MAX_FILE_SIZE'] || '10485760', 10),
    allowedFileTypes: (process.env['ALLOWED_FILE_TYPES'] || 'image/jpeg,image/png,image/gif,application/pdf').split(','),
    categoryLimits: {
      'profile-photo': {
        maxFileSize: parseInt(process.env['PROFILE_PHOTO_MAX_SIZE'] || '5242880', 10), // 5MB
        allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      },
      'document': {
        maxFileSize: parseInt(process.env['DOCUMENT_MAX_SIZE'] || '20971520', 10), // 20MB
        allowedFileTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain',
          'image/jpeg',
          'image/png',
        ],
      },
      'certificate': {
        maxFileSize: parseInt(process.env['CERTIFICATE_MAX_SIZE'] || '10485760', 10), // 10MB
        allowedFileTypes: [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
      },
      'payslip': {
        maxFileSize: parseInt(process.env['PAYSLIP_MAX_SIZE'] || '5242880', 10), // 5MB
        allowedFileTypes: ['application/pdf'],
      },
      'contract': {
        maxFileSize: parseInt(process.env['CONTRACT_MAX_SIZE'] || '15728640', 10), // 15MB
        allowedFileTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
      },
      'training-material': {
        maxFileSize: parseInt(process.env['TRAINING_MATERIAL_MAX_SIZE'] || '52428800', 10), // 50MB
        allowedFileTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'video/mp4',
          'video/webm',
          'audio/mpeg',
          'audio/wav',
          'image/jpeg',
          'image/png',
        ],
      },
      'reimbursement': {
        maxFileSize: parseInt(process.env['REIMBURSEMENT_MAX_SIZE'] || '10485760', 10), // 10MB
        allowedFileTypes: [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
      },
      'other': {
        maxFileSize: parseInt(process.env['OTHER_MAX_SIZE'] || '10485760', 10), // 10MB
        allowedFileTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain',
          'image/jpeg',
          'image/png',
          'image/gif',
        ],
      },
    },
  },
  fileStorage: {
    provider: (process.env['FILE_STORAGE_PROVIDER'] || 's3') as 'local' | 's3' | 'gcs',
    s3: {
      region: process.env['AWS_REGION'] || 'us-east-1',
      bucket: process.env['S3_BUCKET_NAME'] || process.env['S3_BUCKET'] || 'ems-file-storage',
      accessKeyId: process.env['AWS_ACCESS_KEY_ID'] || '',
      secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'] || '',
    },
    gcs: {
      projectId: process.env['GCS_PROJECT_ID'] || '',
      bucket: process.env['GCS_BUCKET'] || 'ems-file-storage',
      keyFile: process.env['GCS_KEY_FILE'] || '',
    },
    urlExpiry: parseInt(process.env['FILE_URL_EXPIRY'] || '3600', 10),
  },
  email: {
    provider: (process.env['EMAIL_PROVIDER'] || 'smtp') as 'sendgrid' | 'ses' | 'smtp',
    fromName: process.env['EMAIL_FROM_NAME'] || 'Employee Management System',
    fromAddress: process.env['EMAIL_FROM_ADDRESS'] || 'noreply@yourcompany.com',
    sendgrid: {
      apiKey: process.env['SENDGRID_API_KEY'] || '',
    },
    ses: {
      region: process.env['AWS_SES_REGION'] || 'us-east-1',
      accessKeyId: process.env['AWS_SES_ACCESS_KEY_ID'] || '',
      secretAccessKey: process.env['AWS_SES_SECRET_ACCESS_KEY'] || '',
    },
    smtp: {
      host: process.env['SMTP_HOST'] || 'smtp.gmail.com',
      port: parseInt(process.env['SMTP_PORT'] || '587', 10),
      secure: process.env['SMTP_SECURE'] === 'true',
      user: process.env['SMTP_USER'] || '',
      password: process.env['SMTP_PASSWORD'] || '',
    },
    templateDir: process.env['EMAIL_TEMPLATE_DIR'] || 'src/templates/email',
  },
  logging: {
    level: process.env['LOG_LEVEL'] || 'info',
  },
  notification: {
    provider: (process.env['NOTIFICATION_PROVIDER'] || 'fcm') as 'fcm' | 'disabled',
  },
  firebase: {
    enabled: process.env['FIREBASE_ENABLED'] === 'true',
    projectId: process.env['FIREBASE_PROJECT_ID'] || '',
    privateKeyId: process.env['FIREBASE_PRIVATE_KEY_ID'] || '',
    privateKey: process.env['FIREBASE_PRIVATE_KEY']?.replace(/\\n/g, '\n') || '',
    clientEmail: process.env['FIREBASE_CLIENT_EMAIL'] || '',
    clientId: process.env['FIREBASE_CLIENT_ID'] || '',
    authUri: process.env['FIREBASE_AUTH_URI'] || 'https://accounts.google.com/o/oauth2/auth',
    tokenUri: process.env['FIREBASE_TOKEN_URI'] || 'https://oauth2.googleapis.com/token',
    authProviderX509CertUrl: process.env['FIREBASE_AUTH_PROVIDER_X509_CERT_URL'] || 'https://www.googleapis.com/oauth2/v1/certs',
    clientX509CertUrl: process.env['FIREBASE_CLIENT_X509_CERT_URL'] || '',
  },
};

export default config;
