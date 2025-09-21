-- Employee Auto-Creation System
-- Automatically creates employee accounts when payroll matrix is uploaded
-- Username and password are both set to the employee's CIN (Carte d'Identité Nationale)

-- Add CIN field to employee dossiers if not exists
ALTER TABLE employee_dossiers ADD COLUMN IF NOT EXISTS cin VARCHAR(20) UNIQUE;

-- Function to create employee account from payroll matrix upload
CREATE OR REPLACE FUNCTION create_employee_from_payroll_matrix()
RETURNS TRIGGER AS $$
DECLARE
    employee_cin VARCHAR(20);
    employee_email VARCHAR(255);
    employee_first_name VARCHAR(100);
    employee_last_name VARCHAR(100);
    new_user_id UUID;
    company_id_val UUID;
BEGIN
    -- Extract employee information from raw_data JSONB
    employee_cin := NEW.raw_data->>'cin';
    employee_email := NEW.raw_data->>'email';
    employee_first_name := NEW.raw_data->>'first_name';
    employee_last_name := NEW.raw_data->>'last_name';
    company_id_val := NEW.company_id;
    
    -- Skip if CIN is missing
    IF employee_cin IS NULL OR employee_cin = '' THEN
        RETURN NEW;
    END IF;
    
    -- Check if employee already exists
    IF NOT EXISTS (
        SELECT 1 FROM employee_dossiers 
        WHERE cin = employee_cin AND company_id = company_id_val
    ) THEN
        -- Create auth user with CIN as both username and password
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_user_meta_data
        ) VALUES (
            gen_random_uuid(),
            COALESCE(employee_email, employee_cin || '@' || company_id_val || '.local'),
            crypt(employee_cin, gen_salt('bf')), -- Password is CIN
            NOW(),
            NOW(),
            NOW(),
            jsonb_build_object(
                'first_name', employee_first_name,
                'last_name', employee_last_name,
                'cin', employee_cin
            )
        ) RETURNING id INTO new_user_id;
        
        -- Create user profile
        INSERT INTO user_profiles (
            id,
            company_id,
            email,
            first_name,
            last_name,
            role
        ) VALUES (
            new_user_id,
            company_id_val,
            COALESCE(employee_email, employee_cin || '@' || company_id_val || '.local'),
            COALESCE(employee_first_name, 'Employee'),
            COALESCE(employee_last_name, employee_cin),
            'employee'
        );
        
        -- Create employee dossier
        INSERT INTO employee_dossiers (
            user_id,
            company_id,
            cin,
            employee_number,
            hire_date,
            position,
            salary_base
        ) VALUES (
            new_user_id,
            company_id_val,
            employee_cin,
            employee_cin, -- Use CIN as employee number
            COALESCE((NEW.raw_data->>'hire_date')::DATE, CURRENT_DATE),
            NEW.raw_data->>'position',
            NEW.base_salary
        );
        
        -- Update the payroll matrix with the new employee_id
        NEW.employee_id := new_user_id;
        
        -- Log the auto-creation
        INSERT INTO audit_logs (
            company_id,
            user_id,
            action,
            resource_type,
            resource_id,
            new_values
        ) VALUES (
            company_id_val,
            NULL, -- System action
            'auto_create_employee',
            'user_profiles',
            new_user_id,
            jsonb_build_object(
                'cin', employee_cin,
                'created_from', 'payroll_matrix_upload'
            )
        );
    ELSE
        -- Employee exists, get their user_id
        SELECT user_id INTO new_user_id
        FROM employee_dossiers 
        WHERE cin = employee_cin AND company_id = company_id_val;
        
        NEW.employee_id := new_user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic employee creation
DROP TRIGGER IF EXISTS auto_create_employee_trigger ON payroll_matrices;
CREATE TRIGGER auto_create_employee_trigger
    BEFORE INSERT ON payroll_matrices
    FOR EACH ROW
    EXECUTE FUNCTION create_employee_from_payroll_matrix();

-- Function for HR managers to manually create employee accounts
CREATE OR REPLACE FUNCTION create_employee_account(
    p_company_id UUID,
    p_cin VARCHAR(20),
    p_email VARCHAR(255),
    p_first_name VARCHAR(100),
    p_last_name VARCHAR(100),
    p_position VARCHAR(255) DEFAULT NULL,
    p_hire_date DATE DEFAULT CURRENT_DATE
)
RETURNS UUID AS $$
DECLARE
    new_user_id UUID;
    hr_role user_role;
BEGIN
    -- Check if caller is HR manager or super admin
    SELECT role INTO hr_role FROM user_profiles WHERE id = auth.uid();
    
    IF hr_role NOT IN ('hr_manager', 'super_admin') THEN
        RAISE EXCEPTION 'Only HR managers and super admins can create employee accounts';
    END IF;
    
    -- Check if HR manager is trying to create in their own company
    IF hr_role = 'hr_manager' AND p_company_id != get_user_company_id() THEN
        RAISE EXCEPTION 'HR managers can only create employees in their own company';
    END IF;
    
    -- Check if employee with this CIN already exists
    IF EXISTS (
        SELECT 1 FROM employee_dossiers 
        WHERE cin = p_cin AND company_id = p_company_id
    ) THEN
        RAISE EXCEPTION 'Employee with CIN % already exists in this company', p_cin;
    END IF;
    
    -- Create auth user
    INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_user_meta_data
    ) VALUES (
        gen_random_uuid(),
        p_email,
        crypt(p_cin, gen_salt('bf')), -- Password is CIN
        NOW(),
        NOW(),
        NOW(),
        jsonb_build_object(
            'first_name', p_first_name,
            'last_name', p_last_name,
            'cin', p_cin
        )
    ) RETURNING id INTO new_user_id;
    
    -- Create user profile
    INSERT INTO user_profiles (
        id,
        company_id,
        email,
        first_name,
        last_name,
        role
    ) VALUES (
        new_user_id,
        p_company_id,
        p_email,
        p_first_name,
        p_last_name,
        'employee'
    );
    
    -- Create employee dossier
    INSERT INTO employee_dossiers (
        user_id,
        company_id,
        cin,
        employee_number,
        hire_date,
        position
    ) VALUES (
        new_user_id,
        p_company_id,
        p_cin,
        p_cin, -- Use CIN as employee number
        p_hire_date,
        p_position
    );
    
    -- Log the creation
    INSERT INTO audit_logs (
        company_id,
        user_id,
        action,
        resource_type,
        resource_id,
        new_values
    ) VALUES (
        p_company_id,
        auth.uid(),
        'create_employee',
        'user_profiles',
        new_user_id,
        jsonb_build_object(
            'cin', p_cin,
            'created_by', 'hr_manager'
        )
    );
    
    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
