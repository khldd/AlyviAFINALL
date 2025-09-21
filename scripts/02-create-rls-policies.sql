-- Row Level Security (RLS) Policies for AlyviaHR
-- Ensures multi-tenant data isolation and proper access control based on the permissions matrix

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_matrices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's company_id
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT company_id 
        FROM user_profiles 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
BEGIN
    RETURN (
        SELECT role 
        FROM user_profiles 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated companies policies to match permissions matrix
-- Companies table policies (Client Management feature)
CREATE POLICY "Super admins can view all companies" ON companies
    FOR SELECT USING (get_user_role() = 'super_admin');

CREATE POLICY "HR managers can view assigned companies" ON companies
    FOR SELECT USING (
        get_user_role() = 'hr_manager' 
        AND id = get_user_company_id()
    );

CREATE POLICY "Super admins can manage all companies" ON companies
    FOR ALL USING (get_user_role() = 'super_admin');

-- Updated user profiles policies for proper role-based access
-- User profiles table policies (Employee Profiles feature)
CREATE POLICY "Super admins can view all user profiles" ON user_profiles
    FOR SELECT USING (get_user_role() = 'super_admin');

CREATE POLICY "HR managers can view profiles in their company" ON user_profiles
    FOR SELECT USING (
        get_user_role() = 'hr_manager' 
        AND company_id = get_user_company_id()
    );

CREATE POLICY "Employees can view their own profile" ON user_profiles
    FOR SELECT USING (
        get_user_role() = 'employee' 
        AND id = auth.uid()
    );

CREATE POLICY "Super admins can manage all profiles" ON user_profiles
    FOR ALL USING (get_user_role() = 'super_admin');

CREATE POLICY "HR managers can create employee profiles in their company" ON user_profiles
    FOR INSERT WITH CHECK (
        get_user_role() = 'hr_manager' 
        AND company_id = get_user_company_id()
        AND role = 'employee'
    );

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (id = auth.uid());

-- Updated employee dossiers policies
-- Employee dossiers table policies
CREATE POLICY "Super admins can view all employee dossiers" ON employee_dossiers
    FOR SELECT USING (get_user_role() = 'super_admin');

CREATE POLICY "HR managers can view dossiers in their company" ON employee_dossiers
    FOR SELECT USING (
        get_user_role() = 'hr_manager' 
        AND company_id = get_user_company_id()
    );

CREATE POLICY "Employees can view their own dossier" ON employee_dossiers
    FOR SELECT USING (
        get_user_role() = 'employee' 
        AND user_id = auth.uid()
    );

CREATE POLICY "Super admins can manage all dossiers" ON employee_dossiers
    FOR ALL USING (get_user_role() = 'super_admin');

CREATE POLICY "HR managers can manage dossiers in their company" ON employee_dossiers
    FOR ALL USING (
        get_user_role() = 'hr_manager' 
        AND company_id = get_user_company_id()
    );

-- Updated payroll policies - employees cannot access payroll runs
-- Payroll matrices table policies (Payroll Runs feature)
CREATE POLICY "Super admins can view all payroll data" ON payroll_matrices
    FOR SELECT USING (get_user_role() = 'super_admin');

CREATE POLICY "HR managers can view payroll data in their company" ON payroll_matrices
    FOR SELECT USING (
        get_user_role() = 'hr_manager' 
        AND company_id = get_user_company_id()
    );

CREATE POLICY "Super admins can manage all payroll data" ON payroll_matrices
    FOR ALL USING (get_user_role() = 'super_admin');

CREATE POLICY "HR managers can manage payroll data in their company" ON payroll_matrices
    FOR ALL USING (
        get_user_role() = 'hr_manager' 
        AND company_id = get_user_company_id()
    );

-- Updated payslips policies - employees cannot access payroll runs
-- Payslips table policies
CREATE POLICY "Super admins can view all payslips" ON payslips
    FOR SELECT USING (get_user_role() = 'super_admin');

CREATE POLICY "HR managers can view payslips in their company" ON payslips
    FOR SELECT USING (
        get_user_role() = 'hr_manager' 
        AND company_id = get_user_company_id()
    );

CREATE POLICY "Super admins can manage all payslips" ON payslips
    FOR ALL USING (get_user_role() = 'super_admin');

CREATE POLICY "HR managers can manage payslips in their company" ON payslips
    FOR ALL USING (
        get_user_role() = 'hr_manager' 
        AND company_id = get_user_company_id()
    );

-- Updated document request policies
-- Document requests table policies
CREATE POLICY "Super admins can view all document requests" ON document_requests
    FOR SELECT USING (get_user_role() = 'super_admin');

CREATE POLICY "HR managers can view requests in their company" ON document_requests
    FOR SELECT USING (
        get_user_role() = 'hr_manager' 
        AND company_id = get_user_company_id()
    );

CREATE POLICY "Employees can view their own document requests" ON document_requests
    FOR SELECT USING (
        get_user_role() = 'employee' 
        AND employee_id = auth.uid()
    );

CREATE POLICY "Super admins can manage all document requests" ON document_requests
    FOR ALL USING (get_user_role() = 'super_admin');

CREATE POLICY "HR managers can manage requests in their company" ON document_requests
    FOR ALL USING (
        get_user_role() = 'hr_manager' 
        AND company_id = get_user_company_id()
    );

-- Document submissions table policies
CREATE POLICY "Super admins can view all document submissions" ON document_submissions
    FOR SELECT USING (get_user_role() = 'super_admin');

CREATE POLICY "HR managers can view submissions in their company" ON document_submissions
    FOR SELECT USING (
        get_user_role() = 'hr_manager' 
        AND company_id = get_user_company_id()
    );

CREATE POLICY "Employees can view their own submissions" ON document_submissions
    FOR SELECT USING (
        get_user_role() = 'employee'
        AND EXISTS (
            SELECT 1 FROM document_requests 
            WHERE id = document_request_id 
            AND employee_id = auth.uid()
        )
    );

CREATE POLICY "Employees can submit documents for their requests" ON document_submissions
    FOR INSERT WITH CHECK (
        get_user_role() = 'employee'
        AND company_id = get_user_company_id()
        AND EXISTS (
            SELECT 1 FROM document_requests 
            WHERE id = document_request_id 
            AND employee_id = auth.uid()
        )
    );

CREATE POLICY "Super admins can manage all submissions" ON document_submissions
    FOR ALL USING (get_user_role() = 'super_admin');

CREATE POLICY "HR managers can manage submissions in their company" ON document_submissions
    FOR ALL USING (
        get_user_role() = 'hr_manager' 
        AND company_id = get_user_company_id()
    );

-- File uploads table policies
CREATE POLICY "Super admins can view all files" ON file_uploads
    FOR SELECT USING (get_user_role() = 'super_admin');

CREATE POLICY "HR managers can view files in their company" ON file_uploads
    FOR SELECT USING (
        get_user_role() = 'hr_manager' 
        AND company_id = get_user_company_id()
    );

CREATE POLICY "Employees can view their own files" ON file_uploads
    FOR SELECT USING (
        get_user_role() = 'employee' 
        AND uploaded_by = auth.uid()
    );

CREATE POLICY "Users can upload files to their company" ON file_uploads
    FOR INSERT WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Super admins can manage all files" ON file_uploads
    FOR ALL USING (get_user_role() = 'super_admin');

CREATE POLICY "HR managers can manage files in their company" ON file_uploads
    FOR ALL USING (
        get_user_role() = 'hr_manager' 
        AND company_id = get_user_company_id()
    );

-- Updated ScanPaie policies - only Super Admins have system-wide access
-- Payroll anomalies table policies (ScanPaie feature)
CREATE POLICY "Super admins can view all anomalies system-wide" ON payroll_anomalies
    FOR SELECT USING (get_user_role() = 'super_admin');

CREATE POLICY "Super admins can manage all anomalies" ON payroll_anomalies
    FOR ALL USING (get_user_role() = 'super_admin');

-- Updated audit logs policies - only Super Admins have access
-- Audit logs table policies
CREATE POLICY "Super admins can view all audit logs" ON audit_logs
    FOR SELECT USING (get_user_role() = 'super_admin');

CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (true);
