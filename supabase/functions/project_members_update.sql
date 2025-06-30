-- Update project members for a project
DROP FUNCTION IF EXISTS public_v2.project_members_update (id UUID, members JSONB);

CREATE OR REPLACE FUNCTION public_v2.project_members_update (id UUID, members JSONB) RETURNS void AS $$
BEGIN
    -- Remove existing members for this project
    DELETE FROM public_v2._project_members WHERE project_id = project_members_update.id;

    -- Insert new members
    INSERT INTO public_v2._project_members (project_id, user_id, role_id)
    SELECT 
        project_members_update.id, 
        (member->>'id')::UUID, 
        (member->>'role_id')::UUID
    FROM jsonb_array_elements(members) AS member
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql VOLATILE;