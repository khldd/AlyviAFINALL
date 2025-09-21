-- Trigger to automatically create user profile when a user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    company_uuid UUID;
BEGIN
    -- Create or get company
    IF NEW.raw_user_meta_data->>'company_name' IS NOT NULL THEN
        -- Try to find existing company first
        SELECT id INTO company_uuid 
        FROM public.companies
        WHERE LOWER(name) = LOWER(NEW.raw_user_meta_data->>'company_name')
        LIMIT 1;
        
        -- If company doesn't exist, create it
        IF company_uuid IS NULL THEN
            INSERT INTO public.companies (name)
            VALUES (NEW.raw_user_meta_data->>'company_name')
            RETURNING id INTO company_uuid;
        END IF;
    ELSE
        -- Default company for testing
        SELECT id INTO company_uuid 
        FROM public.companies
        WHERE name = 'TechCorp Solutions'
        LIMIT 1;
        
        IF company_uuid IS NULL THEN
            INSERT INTO public.companies (name)
            VALUES ('TechCorp Solutions')
            RETURNING id INTO company_uuid;
        END IF;
    END IF;

    -- Create user profile
    INSERT INTO public.user_profiles (
        id,
        company_id,
        email,
        first_name,
        last_name,
        role
    ) VALUES (
        NEW.id,
        company_uuid,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'Utilisateur'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'Nouveau'),
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'employee')
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
