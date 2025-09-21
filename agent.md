# AlyviaHR - Multi-Tenant HR Management System

## Overview

AlyviaHR is a comprehensive multi-tenant HR management system built with Next.js, Supabase, and TypeScript. The system manages employee data, payroll processing, document requests, and provides advanced analytics through ScanPaie anomaly detection.

## System Architecture

### Technology Stack
- **Frontend**: Next.js 14 with App Router, React 18, TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **Authentication**: Supabase Auth with Row Level Security (RLS)
- **Database**: PostgreSQL with advanced RLS policies

### Core Features
1. **Multi-tenant Architecture** - Supports multiple companies with data isolation
2. **Role-based Access Control** - Three distinct user roles with granular permissions
3. **Payroll Management** - Complete payroll processing and history tracking
4. **Document Management** - Employee document requests and approvals
5. **ScanPaie Integration** - Anomaly detection and payroll validation
6. **Audit Logging** - Comprehensive activity tracking for compliance

## User Roles & Permissions Matrix

| Feature | Super Admin | HR Manager | Employee |
|---------|-------------|------------|----------|
| **Dashboard** | ✅ All tenants | ✅ Scoped to clients | ✅ Personal view |
| **Client Management** | ✅ All clients | ✅ Assigned clients | ❌ |
| **Employee Profiles** | ✅ All employees | ✅ Client employees | ✅ Own profile |
| **Payroll Runs** | ✅ All runs | ✅ Client runs | ❌ |
| **Document Requests** | ✅ All requests | ✅ Client requests | ✅ Own requests |
| **ScanPaie** | ✅ System-wide | ❌ | ❌ |
| **Audit Logs** | ✅ All logs | ❌ | ❌ |

### Role Descriptions

#### Super Admin
- **Scope**: System-wide access across all tenants
- **Capabilities**: 
  - Create and manage HR Manager accounts
  - Access all client data and employees
  - View system-wide ScanPaie anomalies
  - Access comprehensive audit logs
  - Manage system configurations

#### HR Manager
- **Scope**: Limited to assigned company/client
- **Capabilities**:
  - Manage assigned company employees
  - Process payroll for their company
  - Handle document requests for their employees
  - Upload employee matrices for automatic account creation
  - Cannot access other companies' data

#### Employee
- **Scope**: Personal data only
- **Capabilities**:
  - View personal dashboard and profile
  - Submit and track document requests
  - View own payroll history (if implemented)
  - Cannot access other employees' data

## Database Schema

### Core Tables

#### `companies`
\`\`\`sql
- id (uuid, primary key)
- name (text, not null)
- industry (text)
- employee_count (integer)
- created_at (timestamp)
- updated_at (timestamp)
\`\`\`

#### `user_profiles`
\`\`\`sql
- id (uuid, references auth.users)
- email (text, unique, not null)
- full_name (text, not null)
- role (user_role enum: super_admin, hr_manager, employee)
- company_id (uuid, references companies)
- cin (text, unique) -- Carte d'Identité Nationale
- phone (text)
- hire_date (date)
- department (text)
- position (text)
- salary (decimal)
- is_active (boolean, default true)
- created_at (timestamp)
- updated_at (timestamp)
\`\`\`

#### `payroll_runs`
\`\`\`sql
- id (uuid, primary key)
- company_id (uuid, references companies)
- period_start (date, not null)
- period_end (date, not null)
- status (payroll_status enum)
- total_gross (decimal)
- total_net (decimal)
- total_deductions (decimal)
- processed_by (uuid, references user_profiles)
- processed_at (timestamp)
- created_at (timestamp)
\`\`\`

#### `payroll_entries`
\`\`\`sql
- id (uuid, primary key)
- payroll_run_id (uuid, references payroll_runs)
- employee_id (uuid, references user_profiles)
- gross_salary (decimal, not null)
- net_salary (decimal, not null)
- deductions (decimal, default 0)
- bonuses (decimal, default 0)
- overtime_hours (decimal, default 0)
- overtime_pay (decimal, default 0)
- created_at (timestamp)
\`\`\`

#### `document_requests`
\`\`\`sql
- id (uuid, primary key)
- employee_id (uuid, references user_profiles)
- document_type (document_type enum)
- status (request_status enum)
- requested_at (timestamp)
- processed_at (timestamp)
- processed_by (uuid, references user_profiles)
- notes (text)
- urgency (urgency_level enum)
\`\`\`

#### `scanpaie_anomalies`
\`\`\`sql
- id (uuid, primary key)
- payroll_run_id (uuid, references payroll_runs)
- employee_id (uuid, references user_profiles)
- anomaly_type (anomaly_type enum)
- severity (severity_level enum)
- description (text, not null)
- detected_at (timestamp)
- resolved_at (timestamp)
- resolved_by (uuid, references user_profiles)
- status (anomaly_status enum)
\`\`\`

#### `audit_logs`
\`\`\`sql
- id (uuid, primary key)
- user_id (uuid, references user_profiles)
- action (text, not null)
- resource_type (text)
- resource_id (uuid)
- details (jsonb)
- ip_address (inet)
- user_agent (text)
- created_at (timestamp)
\`\`\`

### Enums

\`\`\`sql
-- User roles
CREATE TYPE user_role AS ENUM ('super_admin', 'hr_manager', 'employee');

-- Payroll status
CREATE TYPE payroll_status AS ENUM ('draft', 'processing', 'completed', 'cancelled');

-- Document types
CREATE TYPE document_type AS ENUM (
  'employment_certificate', 'salary_certificate', 'tax_certificate',
  'leave_request', 'resignation_letter', 'other'
);

-- Request status
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected', 'completed');

-- Urgency levels
CREATE TYPE urgency_level AS ENUM ('low', 'medium', 'high', 'urgent');

-- Anomaly types
CREATE TYPE anomaly_type AS ENUM (
  'salary_discrepancy', 'missing_deduction', 'overtime_anomaly',
  'duplicate_entry', 'calculation_error', 'compliance_issue'
);

-- Severity levels
CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high', 'critical');

-- Anomaly status
CREATE TYPE anomaly_status AS ENUM ('detected', 'investigating', 'resolved', 'false_positive');
\`\`\`

## Row Level Security (RLS) Policies

### Super Admin Policies
- **Full Access**: Can read/write all data across all tables
- **System Management**: Can manage user roles and company assignments

### HR Manager Policies
- **Company Scoped**: Can only access data for their assigned company
- **Employee Management**: Can manage employees within their company
- **Payroll Access**: Can process payroll for their company employees
- **Document Handling**: Can approve/reject document requests for their employees

### Employee Policies
- **Personal Data Only**: Can only access their own profile and related data
- **Document Requests**: Can create and view their own document requests
- **Read-Only Profile**: Can view but not modify most of their profile data

### Example RLS Policies

\`\`\`sql
-- User profiles - Super admin sees all, HR sees company employees, employees see own
CREATE POLICY "user_profiles_select" ON user_profiles FOR SELECT USING (
  CASE 
    WHEN auth.jwt() ->> 'role' = 'super_admin' THEN true
    WHEN auth.jwt() ->> 'role' = 'hr_manager' THEN 
      company_id = (auth.jwt() ->> 'company_id')::uuid
    WHEN auth.jwt() ->> 'role' = 'employee' THEN 
      id = auth.uid()
    ELSE false
  END
);

-- Payroll runs - Super admin sees all, HR sees company runs, employees see none
CREATE POLICY "payroll_runs_select" ON payroll_runs FOR SELECT USING (
  CASE 
    WHEN auth.jwt() ->> 'role' = 'super_admin' THEN true
    WHEN auth.jwt() ->> 'role' = 'hr_manager' THEN 
      company_id = (auth.jwt() ->> 'company_id')::uuid
    ELSE false
  END
);

-- Document requests - Super admin sees all, HR sees company requests, employees see own
CREATE POLICY "document_requests_select" ON document_requests FOR SELECT USING (
  CASE 
    WHEN auth.jwt() ->> 'role' = 'super_admin' THEN true
    WHEN auth.jwt() ->> 'role' = 'hr_manager' THEN 
      employee_id IN (
        SELECT id FROM user_profiles 
        WHERE company_id = (auth.jwt() ->> 'company_id')::uuid
      )
    WHEN auth.jwt() ->> 'role' = 'employee' THEN 
      employee_id = auth.uid()
    ELSE false
  END
);
\`\`\`

## Authentication System

### Account Creation Process

#### Super Admin Accounts
- Created manually by system administrators
- Full system access from creation

#### HR Manager Accounts
- Created by Super Admins through the admin interface
- Assigned to specific companies during creation
- Cannot create other HR Manager accounts

#### Employee Accounts
- **Automatic Creation**: When HR uploads employee matrix (Excel/CSV)
- **Credentials**: Username = CIN, Password = CIN
- **Bulk Processing**: All employees in matrix get accounts simultaneously
- **No Self-Registration**: Employees cannot create their own accounts

### Authentication Flow

\`\`\`typescript
// Login process
const { data, error } = await supabase.auth.signInWithPassword({
  email: email,
  password: password,
});

// JWT token includes role and company_id for RLS
const token = {
  sub: user.id,
  email: user.email,
  role: userProfile.role,
  company_id: userProfile.company_id
};
\`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/create-employee` - Bulk employee creation

### User Management
- `GET /api/users` - List users (role-based filtering)
- `POST /api/users` - Create user (Super Admin only)
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Deactivate user

### Payroll
- `GET /api/payroll/runs` - List payroll runs
- `POST /api/payroll/runs` - Create payroll run
- `GET /api/payroll/runs/[id]` - Get payroll run details
- `PUT /api/payroll/runs/[id]` - Update payroll run

### Documents
- `GET /api/documents/requests` - List document requests
- `POST /api/documents/requests` - Create document request
- `PUT /api/documents/requests/[id]` - Update request status

### ScanPaie
- `GET /api/scanpaie/anomalies` - List anomalies (Super Admin only)
- `POST /api/scanpaie/scan` - Run anomaly detection
- `PUT /api/scanpaie/anomalies/[id]` - Resolve anomaly

## Frontend Architecture

### Component Structure

\`\`\`
components/
├── dashboard/
│   ├── dashboard-layout.tsx      # Main layout with role-based navigation
│   ├── dashboard-overview.tsx    # Role-specific dashboard content
│   └── stats-cards.tsx          # Metric display components
├── auth/
│   ├── login-form.tsx           # Authentication form
│   └── auth-guard.tsx           # Route protection
├── payroll/
│   ├── payroll-list.tsx         # Payroll runs listing
│   ├── payroll-form.tsx         # Payroll creation/editing
│   └── payroll-details.tsx      # Individual run details
├── employees/
│   ├── employee-list.tsx        # Employee directory
│   ├── employee-form.tsx        # Employee profile editing
│   └── employee-upload.tsx      # Bulk employee import
├── documents/
│   ├── document-requests.tsx    # Document request management
│   └── document-form.tsx        # Request creation form
└── ui/                          # Reusable UI components
\`\`\`

### State Management

\`\`\`typescript
// Authentication Context
interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  canAccess: (resource: string) => boolean;
}

// Role-based access control
const canAccess = (resource: string): boolean => {
  const permissions = {
    super_admin: ['*'],
    hr_manager: ['employees', 'payroll', 'documents'],
    employee: ['profile', 'documents']
  };
  
  return permissions[userProfile.role].includes(resource) || 
         permissions[userProfile.role].includes('*');
};
\`\`\`

## Security Features

### Data Protection
- **Encryption**: All sensitive data encrypted at rest
- **RLS Policies**: Database-level access control
- **JWT Tokens**: Secure authentication with role-based claims
- **Input Validation**: Comprehensive server-side validation
- **SQL Injection Prevention**: Parameterized queries only

### Audit Trail
- **User Actions**: All CRUD operations logged
- **Access Attempts**: Failed login attempts tracked
- **Data Changes**: Before/after values for sensitive data
- **IP Tracking**: User location and device information
- **Retention**: Configurable log retention periods

### Compliance
- **GDPR Ready**: Data export and deletion capabilities
- **SOX Compliance**: Financial data audit trails
- **Role Segregation**: Proper separation of duties
- **Data Minimization**: Only necessary data collected

## Development Setup

### Prerequisites
- Node.js 18+
- Supabase account and project
- Git

### Installation

\`\`\`bash
# Clone repository
git clone <repository-url>
cd alyviaHR

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Configure Supabase
# Add your Supabase URL and keys to .env.local

# Run database migrations
npm run db:migrate

# Seed sample data
npm run db:seed

# Start development server
npm run dev
\`\`\`

### Environment Variables

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database
POSTGRES_URL=your_postgres_url
POSTGRES_PRISMA_URL=your_prisma_url

# Development
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

### Database Scripts

\`\`\`bash
# Create tables and types
scripts/01-create-tables.sql

# Set up RLS policies
scripts/02-create-rls-policies.sql

# Seed sample data
scripts/03-seed-sample-data.sql

# Employee auto-creation functions
scripts/04-employee-auto-creation.sql

# Demo accounts (development only)
scripts/05-create-demo-accounts.sql
\`\`\`

## Usage Guide

### For Super Admins

1. **System Overview**: Access system-wide dashboard with all metrics
2. **Company Management**: Create and manage client companies
3. **HR Manager Setup**: Create HR Manager accounts and assign to companies
4. **ScanPaie Monitoring**: Review anomalies across all companies
5. **Audit Review**: Monitor system activity and security events

### For HR Managers

1. **Employee Management**: 
   - Upload employee matrices for bulk account creation
   - Manage employee profiles and data
   - Handle employee lifecycle events

2. **Payroll Processing**:
   - Create and process payroll runs
   - Review payroll entries and calculations
   - Generate payroll reports

3. **Document Handling**:
   - Review and approve document requests
   - Generate employment certificates
   - Manage document workflows

### For Employees

1. **Personal Dashboard**: View personal metrics and updates
2. **Profile Management**: Update personal information (limited fields)
3. **Document Requests**: Submit requests for certificates and documents
4. **Request Tracking**: Monitor status of submitted requests

## Troubleshooting

### Common Issues

#### Authentication Problems
- **Symptom**: Users can't log in
- **Solution**: Check RLS policies and JWT token claims

#### Permission Errors
- **Symptom**: "Access denied" errors
- **Solution**: Verify user role and company assignments

#### Data Not Visible
- **Symptom**: Empty lists or missing data
- **Solution**: Check RLS policies for role-based filtering

#### Upload Failures
- **Symptom**: Employee matrix upload fails
- **Solution**: Verify CSV format and required columns

### Performance Optimization

- **Database Indexing**: Ensure proper indexes on frequently queried columns
- **Query Optimization**: Use efficient queries with proper joins
- **Caching**: Implement Redis caching for frequently accessed data
- **Connection Pooling**: Use connection pooling for database connections

## Deployment

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] RLS policies enabled
- [ ] SSL certificates installed
- [ ] Monitoring configured
- [ ] Backup strategy implemented
- [ ] Security headers configured
- [ ] Performance monitoring enabled

### Vercel Deployment

\`\`\`bash
# Deploy to Vercel
vercel --prod

# Configure environment variables in Vercel dashboard
# Set up Supabase integration
# Configure custom domain (optional)
\`\`\`

## Monitoring & Analytics

### Key Metrics
- **User Activity**: Login frequency, session duration
- **System Performance**: Response times, error rates
- **Business Metrics**: Payroll processing volume, document requests
- **Security Events**: Failed logins, permission violations

### Alerting
- **System Errors**: Automatic alerts for application errors
- **Security Events**: Notifications for suspicious activity
- **Performance Issues**: Alerts for slow queries or high load
- **Business Events**: Notifications for critical business processes

## Future Enhancements

### Planned Features
- **Mobile Application**: React Native mobile app
- **Advanced Analytics**: Business intelligence dashboard
- **Integration APIs**: Third-party payroll system integrations
- **Workflow Automation**: Automated approval processes
- **Multi-language Support**: Internationalization
- **Advanced Reporting**: Custom report builder

### Technical Improvements
- **Microservices**: Break down into smaller services
- **Event Sourcing**: Implement event-driven architecture
- **Real-time Updates**: WebSocket-based real-time features
- **Advanced Caching**: Redis-based caching layer
- **API Rate Limiting**: Implement rate limiting for API endpoints

---

## Support & Maintenance

For technical support or questions about the AlyviaHR system, please refer to:
- System documentation (this file)
- Database schema documentation
- API documentation
- Security guidelines
- Deployment guides

Last updated: December 2024
Version: 1.0.0
