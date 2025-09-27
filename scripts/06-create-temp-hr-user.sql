-- Create a temporary HR Manager for testing purposes

-- 1. Insert into auth.users
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
    'a1b2c3d4-e5f6-7890-1234-567890abcdef', -- A fixed UUID for the test user
    'hr.manager@techcorp.fr',
    crypt('password123', gen_salt('bf')), -- Password is 'password123'
    NOW(),
    '{"role": "hr_manager"}'
)
ON CONFLICT (email) DO NOTHING;

-- 2. Insert into user_profiles
INSERT INTO user_profiles (id, company_id, email, first_name, last_name, role)
VALUES (
    'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    '550e8400-e29b-41d4-a716-446655440001', -- TechCorp Solutions company ID from seed data
    'hr.manager@techcorp.fr',
    'HR',
    'Manager',
    'hr_manager'
)
ON CONFLICT (id) DO NOTHING;