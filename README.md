# Employee Management System

A comprehensive Progressive Web Application (PWA) for managing the complete employee lifecycle from recruitment through offboarding.

## Overview

The Employee Management System (EMS) is an end-to-end HR automation platform that streamlines workforce operations, automates repetitive processes, and provides real-time visibility into organizational activities. Built with modern web technologies, it offers a seamless experience across desktop and mobile devices.

## Key Features

### Core Modules

- **Employee Information Management** - Complete employee profile and record management
- **Recruitment & Onboarding** - Applicant tracking, interview scheduling, and onboarding workflows
- **Attendance & Time Management** - Check-in/check-out with face detection and GPS tracking
- **Leave Management** - Leave applications, approvals, and balance tracking
- **Payroll Management** - Automated salary calculation with statutory compliance
- **Benefits & Compensation** - Insurance, reimbursements, rewards, and PF management
- **Separation & Offboarding** - Resignation processing and full & final settlement
- **Performance Management** - OKR/KPI tracking and performance reviews
- **Training & Certification** - Training programs and skill matrix management

### Extended Features

- Face presence detection for attendance verification (client-side processing)
- GPS-based geo tracking and travel allowance calculation
- Company hierarchy visualization and org chart generation
- Supplier & buyer relationship tracking
- Attendance-based salary calculation (monthly/daily/hourly)
- Bank details management with encryption
- Document management with self-upload capabilities
- e-Signature workflow for contracts and policies
- Automated birthday and work anniversary wishes

## Technology Stack

### Frontend
- **Framework:** React.js with TypeScript
- **Build Tool:** Vite with PWA Plugin
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Icons:** Lucide React
- **Styling:** Tailwind CSS
- **Face Detection:** TensorFlow.js (BlazeFace)
- **Maps:** Google Maps Platform

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (primary data)
- **Cache:** Redis (sessions and caching)
- **File Storage:** AWS S3 or Google Cloud Storage
- **Authentication:** JWT + OAuth 2.0 + MFA (TOTP)
- **Notifications:** Firebase Cloud Messaging (FCM)
- **Email:** SendGrid or AWS SES

## Architecture

The system follows a three-tier architecture:

```
┌─────────────────────────────────────┐
│     Presentation Layer (React)      │
│  Web App | PWA App | Admin Panel    │
└─────────────────────────────────────┘
                 │
                 │ REST API
                 ▼
┌─────────────────────────────────────┐
│    Application Layer (Node.js)      │
│  API Gateway + Microservices        │
│  (Employee, Attendance, Payroll,    │
│   Leave, Recruitment, etc.)         │
└─────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│         Data Layer                  │
│  PostgreSQL | Redis | AWS S3        │
└─────────────────────────────────────┘
```

### Key Architectural Patterns

- **Service-Oriented Architecture (SOA)** - Independent, scalable services
- **Repository Pattern** - Abstracted data access layer
- **Event-Driven Architecture** - Asynchronous event handling
- **Role-Based Access Control (RBAC)** - Granular permissions

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL 14+
- Redis 6+
- AWS account (for S3) or Google Cloud account
- Google Maps API key (for geo tracking)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd employee-management-system
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Configure environment variables:
```bash
# Backend (.env)
cp .env.example .env
# Edit .env with your database, Redis, AWS, and API credentials

# Frontend (.env)
cp .env.example .env
# Edit .env with your API endpoint and Google Maps key
```

4. Set up the database:
```bash
cd backend
npm run db:migrate
npm run db:seed
```

5. Start the development servers:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

6. Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Project Structure

```
employee-management-system/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions
│   │   └── types/           # TypeScript type definitions
│   ├── public/              # Static assets
│   └── package.json
│
├── backend/                 # Node.js backend application
│   ├── src/
│   │   ├── services/        # Business logic services
│   │   ├── repositories/    # Data access layer
│   │   ├── controllers/     # API controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   └── utils/           # Utility functions
│   ├── migrations/          # Database migrations
│   ├── seeds/               # Database seed data
│   └── package.json
│
├── docs/                    # Documentation
└── README.md
```

## User Roles

The system supports the following roles with specific permissions:

- **Super Admin** - Full system access and configuration
- **HR Manager** - Employee management, recruitment, and HR operations
- **Department Manager** - Team management and approvals
- **Finance/Payroll** - Payroll processing and financial operations
- **Employee** - Self-service portal for personal tasks
- **IT Admin** - System administration and technical support

## Security Features

- JWT-based authentication with refresh tokens
- Multi-factor authentication (MFA) using TOTP
- Role-based access control (RBAC)
- AES-256 encryption for sensitive data
- TLS 1.2+ for all API communication
- Client-side face detection (no biometric data transmission)
- Audit logging for sensitive operations
- PII data masking in logs and UI

## Development

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production

```bash
# Build backend
cd backend
npm run build

# Build frontend (with PWA support)
cd frontend
npm run build
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

## Deployment

### Backend Deployment

1. Set up PostgreSQL and Redis instances
2. Configure environment variables for production
3. Run database migrations
4. Deploy to your Node.js hosting platform (AWS, Heroku, etc.)

### Frontend Deployment

1. Build the production bundle
2. Deploy to static hosting (Vercel, Netlify, AWS S3 + CloudFront)
3. Configure service worker for PWA functionality
4. Set up HTTPS for secure connections

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or contributions, please open an issue on the repository or contact the development team.

## Roadmap

- [ ] Mobile native apps (iOS/Android)
- [ ] Dark mode support
- [ ] Advanced analytics and reporting
- [ ] Integration with third-party HR tools
- [ ] AI-powered resume screening
- [ ] Chatbot for employee queries
- [ ] Multi-language support
- [ ] Advanced workflow automation

---

**Version:** 1.0  
**Last Updated:** 2026-03-05
