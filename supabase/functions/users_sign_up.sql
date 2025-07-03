-- Idempotent user sign-up trigger function for public_v2._users
DROP FUNCTION IF EXISTS public_v2.users_sign_up () CASCADE;

CREATE OR REPLACE FUNCTION public_v2.users_sign_up () RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET
  search_path = public_v2,
  public,
  pg_temp AS $$
BEGIN
    INSERT INTO public_v2._users (id, full_name, email)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data ->> 'full_name',
        NEW.email
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Trigger to call the function after user creation in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW
EXECUTE PROCEDURE public_v2.users_sign_up ();