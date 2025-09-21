-- AlyviaHR Database Schema
-- Multi-tenant payroll & HR SaaS application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('super_admin', 'hr_manager', 'employee');
CREATE TYPE document_status AS ENUM ('pending', 'submitted', 'approved', 'rejected');
CREATE TYPE payslip_status AS ENUM ('draft', 'generated', 'sent', 'viewed');
CREATE TYPE anomaly_type AS ENUM ('salary_deviation', 'hours_anomaly', 'bonus_irregularity', 'deduction_error');
CREATE TYPE anomaly_severity AS ENUM ('low', 'medium', 'high', 'critical');

-- Companies table (multi-tenant root)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    siret VARCHAR(14) UNIQUE,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'employee',
    phone VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(email, company_id)
);

-- Employee dossiers (detailed employee information)
CREATE TABLE employee_dossiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    employee_number VARCHAR(50) UNIQUE,
    hire_date DATE NOT NULL,
    position VARCHAR(255),
    department VARCHAR(255),
    manager_id UUID REFERENCES user_profiles(id),
    salary_base DECIMAL(10,2),
    salary_currency VARCHAR(3) DEFAULT 'EUR',
    contract_type VARCHAR(100),
    work_schedule VARCHAR(100),
    social_security_number VARCHAR(50),
    tax_number VARCHAR(50),
    bank_iban VARCHAR(34),
    bank_bic VARCHAR(11),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payroll matrix (imported data for payroll calculations)
CREATE TABLE payroll_matrices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    period_month INTEGER NOT NULL CHECK (period_month BETWEEN 1 AND 12),
    period_year INTEGER NOT NULL CHECK (period_year > 2000),
    base_salary DECIMAL(10,2) NOT NULL,
    overtime_hours DECIMAL(5,2) DEFAULT 0,
    overtime_rate DECIMAL(5,2) DEFAULT 0,
    bonuses DECIMAL(10,2) DEFAULT 0,
    deductions DECIMAL(10,2) DEFAULT 0,
    social_charges DECIMAL(10,2) DEFAULT 0,
    tax_deductions DECIMAL(10,2) DEFAULT 0,
    net_salary DECIMAL(10,2) NOT NULL,
    worked_hours DECIMAL(5,2) DEFAULT 0,
    sick_days INTEGER DEFAULT 0,
    vacation_days INTEGER DEFAULT 0,
    raw_data JSONB, -- Store original imported data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, employee_id, period_month, period_year)
);

-- Payslips (generated from payroll matrix)
CREATE TABLE payslips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    payroll_matrix_id UUID REFERENCES payroll_matrices(id) ON DELETE CASCADE,
    period_month INTEGER NOT NULL,
    period_year INTEGER NOT NULL,
    status payslip_status DEFAULT 'draft',
    pdf_url TEXT,
    generated_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document requests (HR-driven document collection)
CREATE TABLE document_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    requested_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    document_type VARCHAR(100),
    is_mandatory BOOLEAN DEFAULT false,
    due_date DATE,
    status document_status DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document submissions (employee responses to requests)
CREATE TABLE document_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_request_id UUID REFERENCES document_requests(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES user_profiles(id),
    review_notes TEXT
);

-- File uploads (general file storage)
CREATE TABLE file_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    category VARCHAR(100), -- 'payroll_matrix', 'document', 'avatar', etc.
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ScanPaie anomaly detection (AI-powered analysis)
CREATE TABLE payroll_anomalies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    payroll_matrix_id UUID REFERENCES payroll_matrices(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    anomaly_type anomaly_type NOT NULL,
    severity anomaly_severity NOT NULL,
    description TEXT NOT NULL,
    expected_value DECIMAL(10,2),
    actual_value DECIMAL(10,2),
    confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
    is_resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES user_profiles(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    ai_model_version VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs (track all important actions)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_user_profiles_company_id ON user_profiles(company_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_employee_dossiers_company_id ON employee_dossiers(company_id);
CREATE INDEX idx_employee_dossiers_user_id ON employee_dossiers(user_id);
CREATE INDEX idx_payroll_matrices_company_id ON payroll_matrices(company_id);
CREATE INDEX idx_payroll_matrices_employee_period ON payroll_matrices(employee_id, period_year, period_month);
CREATE INDEX idx_payslips_company_id ON payslips(company_id);
CREATE INDEX idx_payslips_employee_id ON payslips(employee_id);
CREATE INDEX idx_document_requests_company_id ON document_requests(company_id);
CREATE INDEX idx_document_requests_employee_id ON document_requests(employee_id);
CREATE INDEX idx_document_submissions_request_id ON document_submissions(document_request_id);
CREATE INDEX idx_file_uploads_company_id ON file_uploads(company_id);
CREATE INDEX idx_payroll_anomalies_company_id ON payroll_anomalies(company_id);
CREATE INDEX idx_payroll_anomalies_matrix_id ON payroll_anomalies(payroll_matrix_id);
CREATE INDEX idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employee_dossiers_updated_at BEFORE UPDATE ON employee_dossiers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payroll_matrices_updated_at BEFORE UPDATE ON payroll_matrices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payslips_updated_at BEFORE UPDATE ON payslips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_document_requests_updated_at BEFORE UPDATE ON document_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
