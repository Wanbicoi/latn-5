DROP FUNCTION IF EXISTS public_v2.members_update (UUID, TEXT);

CREATE OR REPLACE FUNCTION public_v2.members_update (id UUID, full_name TEXT) RETURNS VOID AS $$
BEGIN
    UPDATE public_v2._users
    SET full_name = members_update.full_name
    WHERE public_v2._users.id = members_update.id;
END;
$$ LANGUAGE plpgsql VOLATILE;