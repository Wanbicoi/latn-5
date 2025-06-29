DROP FUNCTION IF EXISTS public_v2.projects_delete (UUID);

CREATE OR REPLACE FUNCTION public_v2.projects_delete (id UUID) RETURNS void AS $$
BEGIN
    UPDATE public_v2._projects 
    SET deleted_at = NOW()
    WHERE public_v2._projects.id = projects_delete.id;
END;
$$ LANGUAGE plpgsql VOLATILE;