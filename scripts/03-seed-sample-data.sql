-- Sample data for AlyviaHR development and testing
-- This script creates sample companies, users, and payroll data

-- Insert sample companies
INSERT INTO companies (id, name, siret, address, phone, email) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'TechCorp Solutions', '12345678901234', '123 Tech Street, Paris, France', '+33123456789', 'contact@techcorp.fr'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Marketing Plus', '98765432109876', '456 Marketing Ave, Lyon, France', '+33987654321', 'hello@marketingplus.fr');

-- Note: User profiles will be created when users sign up through Supabase Auth
-- The following would be inserted after user registration:

-- Sample employee dossiers (to be created after user registration)
-- INSERT INTO employee_dossiers (user_id, company_id, employee_number, hire_date, position, department, salary_base, contract_type)
-- VALUES 
--     ('user-uuid-1', '550e8400-e29b-41d4-a716-446655440001', 'EMP001', '2024-01-15', 'Software Developer', 'Engineering', 55000.00, 'CDI'),
--     ('user-uuid-2', '550e8400-e29b-41d4-a716-446655440001', 'EMP002', '2024-02-01', 'HR Manager', 'Human Resources', 65000.00, 'CDI');

-- Sample payroll matrix data (for testing)
-- INSERT INTO payroll_matrices (company_id, employee_id, period_month, period_year, base_salary, overtime_hours, bonuses, net_salary, worked_hours)
-- VALUES 
--     ('550e8400-e29b-41d4-a716-446655440001', 'user-uuid-1', 1, 2024, 4583.33, 5.0, 200.00, 3850.00, 160.0),
--     ('550e8400-e29b-41d4-a716-446655440001', 'user-uuid-2', 1, 2024, 5416.67, 0.0, 0.00, 4200.00, 160.0);

-- Sample document requests
-- INSERT INTO document_requests (company_id, employee_id, requested_by, title, description, document_type, is_mandatory, due_date)
-- VALUES 
--     ('550e8400-e29b-41d4-a716-446655440001', 'user-uuid-1', 'hr-manager-uuid', 'Updated ID Copy', 'Please provide an updated copy of your ID card', 'identity_document', true, '2024-12-31'),
--     ('550e8400-e29b-41d4-a716-446655440001', 'user-uuid-1', 'hr-manager-uuid', 'Training Certificate', 'Upload your recent training certificate', 'certificate', false, '2024-11-30');

-- Create a function to generate sample payroll data
CREATE OR REPLACE FUNCTION generate_sample_payroll_data(
    p_company_id UUID,
    p_employee_id UUID,
    p_months INTEGER DEFAULT 12
)
RETURNS VOID AS $$
DECLARE
    i INTEGER;
    base_salary DECIMAL(10,2) := 4500.00;
    current_month INTEGER;
    current_year INTEGER := 2024;
BEGIN
    FOR i IN 1..p_months LOOP
        current_month := i;
        IF current_month > 12 THEN
            current_month := current_month - 12;
            current_year := current_year + 1;
        END IF;
        
        INSERT INTO payroll_matrices (
            company_id, 
            employee_id, 
            period_month, 
            period_year,
            base_salary,
            overtime_hours,
            overtime_rate,
            bonuses,
            deductions,
            social_charges,
            tax_deductions,
            net_salary,
            worked_hours
        ) VALUES (
            p_company_id,
            p_employee_id,
            current_month,
            current_year,
            base_salary,
            ROUND((RANDOM() * 10)::NUMERIC, 2), -- Random overtime 0-10 hours
            25.00, -- €25/hour overtime rate
            CASE WHEN RANDOM() > 0.7 THEN ROUND((RANDOM() * 500)::NUMERIC, 2) ELSE 0 END, -- Random bonus
            ROUND((base_salary * 0.02)::NUMERIC, 2), -- 2% deductions
            ROUND((base_salary * 0.23)::NUMERIC, 2), -- 23% social charges
            ROUND((base_salary * 0.15)::NUMERIC, 2), -- 15% tax
            ROUND((base_salary * 0.60 + (RANDOM() * 200))::NUMERIC, 2), -- ~60% net + variance
            160.0 + ROUND((RANDOM() * 10)::NUMERIC, 2) -- 160-170 worked hours
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Note: Sample data insertion will be completed after user authentication is set up
-- This ensures proper user IDs are available for foreign key relationships
