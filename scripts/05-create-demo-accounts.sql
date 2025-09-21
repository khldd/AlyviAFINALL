-- Demo accounts for AlyviaHR testing
-- This script creates complete demo accounts for all three user roles
-- Run this after the main database setup is complete

-- IMPORTANT: Before running this script, you need to create these users in Supabase Auth:
-- 1. ayedik17@gmail.com (password: admin123) - Super Admin
-- 2. ayedik02@gmail.com (password: demo123) - HR Manager  
-- 3. nabliamalnabli@gmail.com (password: 12345678) - Employee

-- Updated to work with Supabase auth constraints by using auth.users IDs
-- First, let's create user profiles for existing auth users
-- Note: Replace these UUIDs with actual auth.users IDs from your Supabase dashboard

-- Demo Company IDs (using existing companies from seed data)
-- TechCorp Solutions: 550e8400-e29b-41d4-a716-446655440001
-- Marketing Plus: 550e8400-e29b-41d4-a716-446655440002

-- Create demo user profiles (you'll need to update the IDs with real auth.users IDs)
-- For now, we'll use a different approach that doesn't violate foreign key constraints

-- Create temporary function to safely insert user profiles
CREATE OR REPLACE FUNCTION create_demo_user_profile(
    p_email TEXT,
    p_first_name TEXT,
    p_last_name TEXT,
    p_role user_role,
    p_company_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    user_uuid UUID;
    existing_profile UUID;
BEGIN
    -- Check if user profile already exists
    SELECT id INTO existing_profile 
    FROM user_profiles 
    WHERE email = p_email;
    
    IF existing_profile IS NOT NULL THEN
        RETURN existing_profile;
    END IF;
    
    -- Generate a UUID for demo purposes
    user_uuid := gen_random_uuid();
    
    -- Insert user profile
    INSERT INTO user_profiles (
        id, 
        email, 
        first_name, 
        last_name, 
        role, 
        company_id, 
        is_active,
        created_at,
        updated_at
    ) VALUES (
        user_uuid,
        p_email,
        p_first_name,
        p_last_name,
        p_role,
        p_company_id,
        true,
        NOW(),
        NOW()
    );
    
    RETURN user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Create demo user profiles
DO $$
DECLARE
    super_admin_id UUID;
    hr_manager_id UUID;
    employee_id UUID;
    hr_manager2_id UUID;
    employee2_id UUID;
BEGIN
    -- Create Super Admin
    super_admin_id := create_demo_user_profile(
        'ayedik17@gmail.com',
        'Alexandre',
        'Administrateur',
        'super_admin',
        NULL
    );
    
    -- Create HR Manager for TechCorp Solutions
    hr_manager_id := create_demo_user_profile(
        'ayedik02@gmail.com',
        'Marie',
        'Dubois',
        'hr_manager',
        '550e8400-e29b-41d4-a716-446655440001'
    );
    
    -- Create Employee for TechCorp Solutions
    employee_id := create_demo_user_profile(
        'nabliamalnabli@gmail.com',
        'Jean',
        'Martin',
        'employee',
        '550e8400-e29b-41d4-a716-446655440001'
    );
    
    -- Create additional HR Manager for Marketing Plus
    hr_manager2_id := create_demo_user_profile(
        'sophie.bernard@marketingplus.fr',
        'Sophie',
        'Bernard',
        'hr_manager',
        '550e8400-e29b-41d4-a716-446655440002'
    );
    
    -- Create additional Employee for Marketing Plus
    employee2_id := create_demo_user_profile(
        'pierre.durand@marketingplus.fr',
        'Pierre',
        'Durand',
        'employee',
        '550e8400-e29b-41d4-a716-446655440002'
    );

    -- Create employee dossiers for the employees
    INSERT INTO employee_dossiers (
        user_id,
        company_id,
        employee_number,
        cin,
        hire_date,
        position,
        department,
        salary_base,
        contract_type,
        manager_id,
        is_active
    ) VALUES 
        -- Jean Martin (TechCorp Employee)
        (
            employee_id,
            '550e8400-e29b-41d4-a716-446655440001',
            'EMP001',
            '12345678', -- CIN used as username/password
            '2024-01-15',
            'Développeur Full-Stack',
            'Développement',
            4500.00,
            'CDI',
            hr_manager_id, -- Marie Dubois as manager
            true
        ),
        
        -- Pierre Durand (Marketing Plus Employee)
        (
            employee2_id,
            '550e8400-e29b-41d4-a716-446655440002',
            'EMP001',
            '87654321', -- CIN used as username/password
            '2024-02-01',
            'Spécialiste Marketing Digital',
            'Marketing',
            3800.00,
            'CDI',
            hr_manager2_id, -- Sophie Bernard as manager
            true
        );

    -- Generate sample payroll data for employees
    PERFORM generate_sample_payroll_data(
        '550e8400-e29b-41d4-a716-446655440001'::UUID,
        employee_id,
        12
    );

    PERFORM generate_sample_payroll_data(
        '550e8400-e29b-41d4-a716-446655440002'::UUID,
        employee2_id,
        12
    );

    -- Create sample document requests
    INSERT INTO document_requests (
        company_id,
        employee_id,
        requested_by,
        title,
        description,
        document_type,
        is_mandatory,
        due_date,
        status
    ) VALUES 
        -- Requests for Jean Martin
        (
            '550e8400-e29b-41d4-a716-446655440001',
            employee_id,
            hr_manager_id,
            'Copie CIN mise à jour',
            'Veuillez fournir une copie mise à jour de votre carte d''identité nationale',
            'identity_document',
            true,
            '2024-12-31',
            'pending'
        ),
        (
            '550e8400-e29b-41d4-a716-446655440001',
            employee_id,
            hr_manager_id,
            'Certificat de formation',
            'Téléchargez votre certificat de formation récent',
            'certificate',
            false,
            '2024-11-30',
            'submitted'
        ),
        
        -- Requests for Pierre Durand
        (
            '550e8400-e29b-41d4-a716-446655440002',
            employee2_id,
            hr_manager2_id,
            'Attestation de domicile',
            'Fournir une attestation de domicile récente',
            'address_proof',
            true,
            '2024-12-15',
            'pending'
        );

    -- Create sample ScanPaie anomalies (for Super Admin view)
    INSERT INTO scanpaie_anomalies (
        company_id,
        employee_id,
        payroll_matrix_id,
        anomaly_type,
        severity,
        description,
        detected_value,
        expected_range,
        confidence_score,
        status
    ) VALUES 
        (
            '550e8400-e29b-41d4-a716-446655440001',
            employee_id,
            (SELECT id FROM payroll_matrices WHERE employee_id = employee_id LIMIT 1),
            'salary_spike',
            'medium',
            'Augmentation salariale inhabituelle détectée (+15% par rapport à la moyenne)',
            '5175.00',
            '4200.00-4800.00',
            0.85,
            'pending'
        ),
        (
            '550e8400-e29b-41d4-a716-446655440002',
            employee2_id,
            (SELECT id FROM payroll_matrices WHERE employee_id = employee2_id LIMIT 1),
            'excessive_overtime',
            'high',
            'Heures supplémentaires excessives détectées (25h ce mois)',
            '25.00',
            '0.00-10.00',
            0.92,
            'pending'
        );

    -- Create audit log entries for demo
    INSERT INTO audit_logs (
        user_id,
        company_id,
        action,
        resource_type,
        resource_id,
        details,
        ip_address,
        user_agent
    ) VALUES 
        (
            hr_manager_id,
            '550e8400-e29b-41d4-a716-446655440001',
            'CREATE',
            'document_request',
            (SELECT id FROM document_requests WHERE title = 'Copie CIN mise à jour' LIMIT 1)::TEXT,
            '{"title": "Copie CIN mise à jour", "employee": "Jean Martin"}',
            '192.168.1.100',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        ),
        (
            super_admin_id,
            NULL,
            'VIEW',
            'scanpaie_dashboard',
            NULL,
            '{"anomalies_reviewed": 2, "companies_accessed": ["TechCorp Solutions", "Marketing Plus"]}',
            '192.168.1.50',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        );

END $$;

-- Update companies with additional demo data
UPDATE companies 
SET 
    employee_count = (
        SELECT COUNT(*) 
        FROM employee_dossiers 
        WHERE company_id = companies.id AND is_active = true
    ),
    updated_at = NOW()
WHERE id IN (
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440002'
);

-- Create a view for easy demo account reference
CREATE OR REPLACE VIEW demo_accounts AS
SELECT 
    up.email,
    up.first_name || ' ' || up.last_name as full_name,
    up.role,
    c.name as company_name,
    CASE 
        WHEN up.role = 'super_admin' THEN 'admin123'
        WHEN up.role = 'hr_manager' THEN 'demo123'
        WHEN up.role = 'employee' THEN COALESCE(ed.cin, 'demo123')
        ELSE 'demo123'
    END as demo_password,
    up.is_active
FROM user_profiles up
LEFT JOIN companies c ON up.company_id = c.id
LEFT JOIN employee_dossiers ed ON up.id = ed.user_id
WHERE up.email IN (
    'ayedik17@gmail.com',
    'ayedik02@gmail.com', 
    'nabliamalnabli@gmail.com',
    'sophie.bernard@marketingplus.fr',
    'pierre.durand@marketingplus.fr'
)
ORDER BY 
    CASE up.role 
        WHEN 'super_admin' THEN 1
        WHEN 'hr_manager' THEN 2
        WHEN 'employee' THEN 3
    END,
    up.first_name;

-- Clean up the temporary function
DROP FUNCTION IF EXISTS create_demo_user_profile(TEXT, TEXT, TEXT, user_role, UUID);

-- Display the demo accounts for reference
SELECT 
    'Demo Accounts Created Successfully!' as status,
    email,
    full_name,
    role,
    company_name,
    demo_password
FROM demo_accounts;
